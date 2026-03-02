import requests
from bs4 import BeautifulSoup
import csv
import sys
import os

# URL
url = "https://seesaawiki.jp/holostarstv/d/%c1%e1%b8%ab%c9%bd"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"URLの取得中にエラーが発生しました: {e}")
    sys.exit(0)

# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
# ★★★ 真の原因に対応する、最終修正箇所です ★★★
# 不正なバイト文字が含まれていてもエラーにせず、置換して処理を続行させる
html_text = response.content.decode("euc-jp", errors="replace")

# エラーを乗り越えて日本語に変換したテキストを、BeautifulSoupで解析
soup = BeautifulSoup(html_text, "html.parser")
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


# 表を抽出
tables = soup.find_all("table")
print(f"ページ上で {len(tables)} 個のテーブルを見つけました。")

if len(tables) == 0:
    print("エラー: ページ上にテーブルが見つかりませんでした。")
    sys.exit(0)

target_table = None

for tbl in tables:
    rows = tbl.find_all("tr")
    if not rows: continue
    
    first_row = rows[0]
    if first_row.find("th") or first_row.find("td"):
        cols = first_row.find_all(["th", "td"])
        first_row_text = "".join(c.text.strip() for c in cols)
    else:
        first_row_text = first_row.text.strip()
    
    if "カラーコード" in first_row_text:
        target_table = tbl
        break

if not target_table:
    print("エラー: 目的のテーブルが見つかりませんでした。")
    sys.exit(0)

table = target_table
print("目的のテーブルを使用します。")

# テーブルからデータを抽出
rows = table.find_all("tr")
new_data = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) >= 3:
        name = cols[0].text.strip()
        color_code = cols[2].text.strip()
        if name and color_code and name != "名前":
            new_data.append([name, color_code])

print(f"新たに {len(new_data)} 件のデータを抽出しました。")

# --- CSVファイル処理 ---
output_dir = "colordict"
csv_file = os.path.join(output_dir, "ホロスターズ.csv")
os.makedirs(output_dir, exist_ok=True)

existing_data = []
try:
    with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.reader(file)
        for row in reader:
            if row and len(row) >= 2 and not row[0].startswith("#"):
                existing_data.append([row[0], row[1]])
except FileNotFoundError:
    print(f"CSVファイル '{csv_file}' が存在しないため、新規に作成します。")

entries_to_add = [entry for entry in new_data if entry not in existing_data]

if entries_to_add:
    print(f"{len(entries_to_add)} 件の新しいデータをCSVファイルに追記します。")
    with open(csv_file, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if os.path.getsize(csv_file) > 0 if os.path.exists(csv_file) else False:
            writer.writerow([])
        writer.writerows(entries_to_add)
    print("追記が完了しました。")
else:
    print("追加する新しいデータはありませんでした。")
