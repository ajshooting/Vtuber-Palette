import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://vee.memo.wiki/d/%a5%a2%a5%a4%a5%b3%a5%f3%a5%c6%a5%f3%a5%d7%a5%ec%a1%bc%a5%c8%a1%a6%a5%ab%a5%e9%a1%bc%a5%b3%a1%bc%a5%c9%a4%de%a4%c8%a4%e1"

import sys

# ソース取得
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
try:
    response = requests.get(url, headers=headers)
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
    
    if "タレント名" in first_row_text and ("公式" in first_row_text or "カラー" in first_row_text):
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
        if len(cols) >= 3:
            color_code2 = cols[2].text.strip()
        if name and name != "タレント名":
            data.append([name, color_code])

# 指定CSVファイルを開く
csv_file = "colordict/VEE.csv"
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
