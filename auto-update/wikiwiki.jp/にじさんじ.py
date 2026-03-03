import requests
from bs4 import BeautifulSoup
import csv

# URL
url = "https://wikiwiki.jp/nijisanji/%E3%82%AB%E3%83%A9%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%89%E3%81%BE%E3%81%A8%E3%82%81"


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

def updateNijisanji():
    data = []
    # 表を抽出
    tables = soup.find_all("table")
    table = None
    for tbl in tables:
        prev = tbl.find_previous(["h2", "h3", "h4", "h5", "b", "strong"])
        if prev and "にじさんじ" in prev.text and "NIJISANJI" not in prev.text and "VirtuaReal" not in prev.text:
            table = tbl
            break

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
    csv_file = "colordict/にじさんじ.csv"
    all_rows = []
    with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
        all_rows = list(csv.reader(file))

    def normalize(text):
        return text.replace("（", "(").replace("）", ")").replace(" ", "").replace("　", "")

    existing_dict = {}
    for i, row in enumerate(all_rows):
        if len(row) >= 2 and not row[0].startswith("#"):
            existing_dict[normalize(row[0])] = i

    new_entries = []
    updated = False
    for entry in data:
        name, color_code = entry
        norm_name = normalize(name)
        if norm_name in existing_dict:
            idx = existing_dict[norm_name]
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



def updateVirtuaReal():
    data = []
    # 表を抽出
    tables = soup.find_all("table")
    table = None
    for tbl in tables:
        prev = tbl.find_previous(["h2", "h3", "h4", "h5", "b", "strong"])
        if prev and "VirtuaReal" in prev.text:
            table = tbl
            break

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
    csv_file = "colordict/VirtuaReal.csv"
    all_rows = []
    with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
        all_rows = list(csv.reader(file))

    def normalize(text):
        return text.replace("（", "(").replace("）", ")").replace(" ", "").replace("　", "")

    existing_dict = {}
    for i, row in enumerate(all_rows):
        if len(row) >= 2 and not row[0].startswith("#"):
            existing_dict[normalize(row[0])] = i

    new_entries = []
    updated = False
    for entry in data:
        name, color_code = entry
        norm_name = normalize(name)
        if norm_name in existing_dict:
            idx = existing_dict[norm_name]
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



def updateIN():
    data = []
    # 表を抽出
    tables = soup.find_all("table")
    table = None
    for tbl in tables:
        prev = tbl.find_previous(["h2", "h3", "h4", "h5", "b", "strong"])
        if prev and "NIJISANJI IN" in prev.text:
            table = tbl
            break

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
    csv_file = "colordict/NIJISANJI IN.csv"
    all_rows = []
    with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
        all_rows = list(csv.reader(file))

    def normalize(text):
        return text.replace("（", "(").replace("）", ")").replace(" ", "").replace("　", "")

    existing_dict = {}
    for i, row in enumerate(all_rows):
        if len(row) >= 2 and not row[0].startswith("#"):
            existing_dict[normalize(row[0])] = i

    new_entries = []
    updated = False
    for entry in data:
        name, color_code = entry
        norm_name = normalize(name)
        if norm_name in existing_dict:
            idx = existing_dict[norm_name]
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



def updateEN():
    data = []
    # 表を抽出
    tables = soup.find_all("table")
    table = None
    for tbl in tables:
        prev = tbl.find_previous(["h2", "h3", "h4", "h5", "b", "strong"])
        if prev and "NIJISANJI EN" in prev.text:
            table = tbl
            break

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
    csv_file = "colordict/NIJISANJI EN.csv"
    all_rows = []
    with open(csv_file, mode="r", newline="", encoding="utf-8") as file:
        all_rows = list(csv.reader(file))

    def normalize(text):
        return text.replace("（", "(").replace("）", ")").replace(" ", "").replace("　", "")

    existing_dict = {}
    for i, row in enumerate(all_rows):
        if len(row) >= 2 and not row[0].startswith("#"):
            existing_dict[normalize(row[0])] = i

    new_entries = []
    updated = False
    for entry in data:
        name, color_code = entry
        norm_name = normalize(name)
        if norm_name in existing_dict:
            idx = existing_dict[norm_name]
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


updateNijisanji()
updateVirtuaReal()
updateIN()
updateEN()
