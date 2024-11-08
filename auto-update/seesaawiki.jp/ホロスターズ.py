import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://seesaawiki.jp/holostarstv/d/%c1%e1%b8%ab%c9%bd"

# ソース取得
response = requests.get(url)
response.encoding = "utf-8"
soup = BeautifulSoup(response.content, "lxml")

# 表を抽出
table = soup.find_all("table")[9]
rows = table.find_all("tr")
data = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) >= 1:
        name = cols[0].text.strip()
        color_code = cols[2].text.strip()
        data.append([name, color_code])

# 指定CSVファイルを開く
csv_file = "colordict/ホロスターズ.csv"
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
