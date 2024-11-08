import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://wikiwiki.jp/neo-porte/%E3%83%87%E3%83%BC%E3%82%BF%E4%B8%80%E8%A6%A7/%E3%82%AB%E3%83%A9%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%89"


headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

# ソース取得
response = requests.get(url,headers=headers)
soup = BeautifulSoup(response.content, "html.parser")


# 表を抽出
table = soup.find_all("table")[0]
if table:
    rows = table.find_all("tr")
    data = []
    for row in rows:
        th = row.find("th")
        td = row.find("td")
        if th and td:
            header = th.text.strip()
            first_td = td.text.strip()
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
