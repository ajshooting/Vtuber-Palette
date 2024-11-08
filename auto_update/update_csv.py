import pandas as pd
import requests
from bs4 import BeautifulSoup
import os

# CSVファイルのパス
csv_file_path = 'source.csv'
df = pd.read_csv(csv_file_path)

# colordictを複数のCSVファイルから読み込む
colordict_dir_path = '../colordict/'
colordict = {}

for filename in os.listdir(colordict_dir_path):
    if filename.endswith('.csv'):
        colordict_csv_path = os.path.join(colordict_dir_path, filename)
        colordict_df = pd.read_csv(colordict_csv_path)
        colordict.update(dict(zip(colordict_df['Name'], colordict_df['ColorCode'])))

# URLにアクセスして名前とカラーコードを抽出する関数
def extract_name_and_color(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    # ここで名前とカラーコードを抽出するロジックを実装
    name = soup.find('div', class_='name').text
    color_code = soup.find('div', class_='color-code').text
    return name, color_code

# 差分をチェックしてCSVに追記する関数
def update_csv_with_differences(df, colordict):
    updated = False
    for url in df['URL']:
        name, color_code = extract_name_and_color(url)
        if name in colordict and colordict[name] != color_code:
            df.loc[df['URL'] == url, 'ColorCode'] = color_code
            updated = True
        elif name not in colordict:
            new_row = {'URL': url, 'Name': name, 'ColorCode': color_code}
            df = df.append(new_row, ignore_index=True)
            updated = True
    if updated:
        df.to_csv(csv_file_path, index=False)
        # colordictも更新する
        for filename in os.listdir(colordict_dir_path):
            if filename.endswith('.csv'):
                colordict_csv_path = os.path.join(colordict_dir_path, filename)
                colordict_df = pd.DataFrame(list(colordict.items()), columns=['Name', 'ColorCode'])
                colordict_df.to_csv(colordict_csv_path, index=False)

# CSVファイルを読み込み、それぞれのURLにアクセスして、スクレイピングを行う
update_csv_with_differences(df, colordict)

# スクレイピング結果をフォルダ内と比較し、差分があればCSVファイルに追記する