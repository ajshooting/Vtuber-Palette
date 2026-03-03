import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://seesaawiki.jp/mochi8hiyoko/d/%c1%e1%b8%ab%c9%bd"

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
    prev = tbl.find_previous(["h2", "h3", "h4", "h5", "b", "strong"])
    if prev and "イメージカラー" in prev.text:
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
    if len(cols) >= 1:
        name = cols[1].text.strip()
        color_code = cols[2].text.strip()
        data.append([name, color_code])

# 指定CSVファイルを開く
csv_file = "colordict/元もちぷろ.csv"
all_rows = []
with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
    all_rows = list(csv.reader(file))

existing_dict = {}
for i, row in enumerate(all_rows):
    if len(row) >= 2 and not row[0].startswith("#"):
        existing_dict[row[0]] = i

new_entries = []
updated = False

for entry in data:
    name, color_code = entry
    if name in existing_dict:
        idx = existing_dict[name]
        existing_color = all_rows[idx][1].strip()
        if (not existing_color or existing_color == "---") and color_code and color_code != "---":
            all_rows[idx][1] = color_code
            updated = True
    else:
        new_entries.append(entry)

if updated or new_entries:
    if new_entries:
        if all_rows:
            all_rows.append([])
        all_rows.extend(new_entries)
    with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
        csv.writer(file).writerows(all_rows)
