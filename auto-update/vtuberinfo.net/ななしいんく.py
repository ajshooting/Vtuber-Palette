import requests
from bs4 import BeautifulSoup
import csv

import sys

# URL
url = "https://vtuberinfo.net/774inc-membercolor/"

# ソース取得
try:
    response = requests.get(url)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"URLの取得中にエラーが発生しました: {e}")
    sys.exit(0)

soup = BeautifulSoup(response.content, "html.parser")

# 表を抽出
tables = soup.find_all("table")
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
    
    if "タレント" in first_row_text and ("カラー" in first_row_text or "色" in first_row_text):
        target_table = tbl
        break

if not target_table:
    print("目的のテーブルが見つかりませんでした。処理をスキップします。")
    sys.exit(0)

table = target_table
rows = table.find_all("tr")
data = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) >= 2:
        name = cols[0].text.strip()
        color_code = cols[1].text.strip()
        if name and name != "タレント" and name != "名前":
            data.append([name, color_code])

# 指定CSVファイルを開く
csv_file = "colordict/ななしいんく.csv"
existing_data = []
with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        if len(row) >= 2 and not row[0].startswith("#"):
            existing_data.append([row[0], row[1]])

# 差分を確認し、存在しない名前とカラーコードを追加
new_entries = [entry for entry in data if entry not in existing_data]

if new_entries:
    with open(csv_file, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([])
        for entry in new_entries:
            name, color_code = entry
            writer.writerow([name, color_code])
