import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://seesaawiki.jp/siroyoutuber/d/%c1%e1%b8%ab%c9%bd"

# ソース取得
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

# 「公式イメージカラー」セクションを探す
headings = soup.find_all("h3")
target_section = None
for heading in headings:
    if "公式イメージカラー" in heading.text:
        target_section = heading.parent

# セクションが見つかった場合、その中の表を探す
table = None
if target_section:
    # セクションの親要素を取得し、その中から表を探す
    section_container = target_section.parent
    table = section_container.find("table", class_="filter sort")

# 表が見つからない場合のフォールバック
if not table:
    table = soup.find("table", class_="filter sort")

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
