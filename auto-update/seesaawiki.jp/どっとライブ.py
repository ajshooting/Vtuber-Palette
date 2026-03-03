import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://seesaawiki.jp/siroyoutuber/d/%c1%e1%b8%ab%c9%bd"

# ソース取得
response = requests.get(url)
response.encoding = response.apparent_encoding
soup = BeautifulSoup(response.text, "html.parser")

# 「公式イメージカラー」のh3要素を特定
target_h3 = None
for h3 in soup.find_all("h3"):
    if "公式イメージカラー" in h3.text:
        target_h3 = h3
        break

# h3が見つかった場合、その次にあるtableを探す
table = None
if target_h3:
    table = target_h3.find_next("table")

# h3が見つかった場合、その次にあるtableを探す
table = None
if target_h3:
    table = target_h3.find_next("table")

# 表のデータを抽出
data = []
if table:
    rows = table.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 2:
            name = cols[0].text.strip()
            color_code = cols[1].text.strip()
            data.append([name, color_code])

# 指定CSVファイルを開く
csv_file = "colordict/どっとライブ.csv"
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
