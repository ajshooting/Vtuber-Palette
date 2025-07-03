import requests
from bs4 import BeautifulSoup
import csv
import sys

# URL
url = "https://seesaawiki.jp/holostarstv/d/%c1%e1%b8%ab%c9%bd"

# ソース取得
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
response = requests.get(url, headers=headers)
response.encoding = "utf-8"

# レスポンス確認
if response.status_code != 200:
    print(f"Error: HTTP {response.status_code}")
    print(f"Response: {response.text[:500]}...")
    sys.exit(1)

soup = BeautifulSoup(response.content, "lxml")

# 表を抽出
tables = soup.find_all("table")
print(f"Found {len(tables)} tables")

if len(tables) <= 9:
    print(f"Error: Expected at least 10 tables, but found {len(tables)}")
    print("Available tables:")
    for i, tbl in enumerate(tables):
        if hasattr(tbl, 'find_all'):
            print(f"  Table {i}: {len(tbl.find_all('tr'))} rows")
    sys.exit(1)
table = tables[9]
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
