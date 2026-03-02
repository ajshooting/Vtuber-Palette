import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://wikiwiki.jp/neo-porte/%E3%83%87%E3%83%BC%E3%82%BF%E4%B8%80%E8%A6%A7/%E3%82%AB%E3%83%A9%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%89"


headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

import sys

# ソース取得
try:
    response = requests.get(url,headers=headers)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"URLの取得中にエラーが発生しました: {e}")
    sys.exit(0)

soup = BeautifulSoup(response.content, "html.parser")


# 表を抽出
tables = soup.find_all("table")
table = None
for tbl in tables:
    rows = tbl.find_all("tr")
    if not rows: continue
    
    first_row = rows[0]
    if first_row.find("th") or first_row.find("td"):
        cols = first_row.find_all(["th", "td"])
        first_row_text = "".join(c.text.strip() for c in cols)
    else:
        first_row_text = first_row.text.strip()
    
    if "名前" in first_row_text and ("背景色" in first_row_text or "カラー" in first_row_text):
        table = tbl
        break

data = []
if table:
    rows = table.find_all("tr")
    for row in rows:
        th = row.find("th")
        td = row.find("td")
        if th and td:
            header = th.text.strip()
            first_td = td.text.strip()
            if header and header != "名前":
                data.append([header, first_td])
else:
    print("Table not found")

# 指定CSVファイルを開く
csv_file = "colordict/ネオポルテ.csv"
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
