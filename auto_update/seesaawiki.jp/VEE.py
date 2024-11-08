import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://vee.memo.wiki/d/%a5%a2%a5%a4%a5%b3%a5%f3%a5%c6%a5%f3%a5%d7%a5%ec%a1%bc%a5%c8%a1%a6%a5%ab%a5%e9%a1%bc%a5%b3%a1%bc%a5%c9%a4%de%a4%c8%a4%e1"

# ソース取得
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

# 表を抽出
table = soup.find_all("table")[0]
rows = table.find_all("tr")
data = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) >= 1:
        name = cols[0].text.strip()
        color_code = cols[1].text.strip()
        color_code2 = cols[2].text.strip()
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
