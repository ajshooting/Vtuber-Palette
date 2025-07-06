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
