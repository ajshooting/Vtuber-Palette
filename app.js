document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('colorChart');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');
    const width = canvas.width;
    const height = canvas.height;
    let points = [];

    let colorSpace = "hsv";
    let useAxis = "1-2";
    let reverse = "default";


    function loadSettings() {
        const colorSpaceElement = document.getElementById("colorSpace");
        const useAxisElement = document.getElementById("useAxis");
        const reverseElement = document.getElementById("reverse");
        colorSpace = colorSpaceElement.value;
        useAxis = useAxisElement.value;
        reverse = reverseElement.value;
    }


    // カラーチャートの作成(HSV)(RGBもいけちゃう！)
    function drawColorChart() {
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                if (colorSpace == "rgb") {
                    const r = Math.floor((x / width) * 255);
                    const g = Math.floor((y / height) * 255);
                    const b = 128; // 固定値(変数減らし)
                    const a = 50;  // 不透明度
                    if (useAxis == "1-2") {
                        if (reverse == "default") {
                            imageData.data[index] = r;
                            imageData.data[index + 1] = g;
                            imageData.data[index + 2] = b;
                            imageData.data[index + 3] = a;
                        } else {
                            imageData.data[index] = g;
                            imageData.data[index + 1] = r;
                            imageData.data[index + 2] = b;
                            imageData.data[index + 3] = a;
                        }
                    } else if (useAxis == "1-3") {
                        if (reverse == "default") {
                            imageData.data[index] = r;
                            imageData.data[index + 1] = b;
                            imageData.data[index + 2] = g;
                            imageData.data[index + 3] = a;
                        } else {
                            imageData.data[index] = g;
                            imageData.data[index + 1] = b;
                            imageData.data[index + 2] = r;
                            imageData.data[index + 3] = a;
                        }
                    } else {
                        if (reverse == "default") {
                            imageData.data[index] = b;
                            imageData.data[index + 1] = r;
                            imageData.data[index + 2] = g;
                            imageData.data[index + 3] = a;
                        } else {
                            imageData.data[index] = b;
                            imageData.data[index + 1] = g;
                            imageData.data[index + 2] = r;
                            imageData.data[index + 3] = a;
                        }
                    }
                } else {
                    const h = (x / width) * 360;
                    const s = (y / height);
                    const V = 1; // 定数
                    const a = 30; // 不透明度
                    let rgb;
                    if (useAxis == "1-2") {
                        if (reverse == "default") {
                            rgb = hsvToRgb(h, s, V);
                        } else {
                            rgb = hsvToRgb(s, h, V);
                        }
                        imageData.data[index] = rgb[0];
                        imageData.data[index + 1] = rgb[1];
                        imageData.data[index + 2] = rgb[2];
                        imageData.data[index + 3] = a;
                    } else if (useAxis == "1-3") {
                        // h-vなら逆対数の逆..つまり対数をとる的な
                        const a = 2
                        const v = Math.log((y / height) * (Math.exp(a) - 1) + 1) / a;
                        if (reverse == "default") {
                            rgb = hsvToRgb(h, 0.5, v);
                        } else {
                            rgb = hsvToRgb(v, 0.5, h);
                        }
                        imageData.data[index] = rgb[0];
                        imageData.data[index + 1] = rgb[2];
                        imageData.data[index + 2] = rgb[1];
                        imageData.data[index + 3] = a;
                    } else {
                        if (reverse == "default") {
                            rgb = hsvToRgb(h, s, V);
                        } else {
                            rgb = hsvToRgb(s, h, V);
                        }
                        imageData.data[index] = rgb[2];
                        imageData.data[index + 1] = rgb[0];
                        imageData.data[index + 2] = rgb[1];
                        imageData.data[index + 3] = a;
                    }
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }


    // HSVからRGBへの変換
    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }

        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }


    // CSVファイルからデータを読み込む
    async function loadCSVFiles() {
        let readFiles = []
        const files = {
            'nijiEN': './colordict/NIJISANJI EN.csv',
            'nijiIN': './colordict/NIJISANJI IN.csv',
            'Virtua': './colordict/VirtuaReal.csv',
            '774': './colordict/ななしいんく.csv',
            'niji': './colordict/にじさんじ.csv',
            'neo': './colordict/ネオポルテ.csv',
            'nori': './colordict/のりプロ.csv',
            'vspo': './colordict/ぶいすぽっ!.csv',
            'holo': './colordict/ホロライブ.csv'
        };

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                readFiles.push(files[checkbox.id])
            }
        });

        let data = [];
        for (const file of readFiles) {
            const response = await fetch(file);
            const text = await response.text();
            const rows = text.trim().split('\n');
            for (const row of rows) {
                if (row.trim() === '') continue;
                if (row.trim().startsWith('#')) continue;
                const columns = row.split(',');
                const name = columns[0].trim();
                const colorCode = columns[1] ? columns[1].trim() : '';
                if (!colorCode.trim().startsWith('#')) continue;
                data.push({ name: name.trim(), colorCode: colorCode.trim(), office: file.split('/').pop().replace('.csv', '') });
            }
        }
        return data;
    }


    // カラーコードをRGBに変換
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }


    // RGBをHSVに変換
    function rgbToHsv({ r, g, b }) {
        const [R, G, B] = [r, g, b].map(v => v / 255);
        const C_max = Math.max(R, G, B);
        const C_min = Math.min(R, G, B);
        const delta = C_max - C_min;

        let H = 0;
        if (delta) {
            if (C_max === R) H = 60 * (((G - B) / delta) % 6);
            else if (C_max === G) H = 60 * (((B - R) / delta) + 2);
            else H = 60 * (((R - G) / delta) + 4);
        }
        if (H < 0) H += 360;

        const S = C_max ? delta / C_max : 0;
        const V = C_max;

        return { H: H / 360, S, V };
    }


    // データをカラーチャートにプロット
    async function plotData() {
        const data = await loadCSVFiles();

        data.forEach(item => {
            const rgb = hexToRgb(item.colorCode);
            const hsv = rgbToHsv(rgb);
            let x;
            let y;
            if (colorSpace == "rgb") {
                if (useAxis == "1-2") {
                    x = Math.floor((rgb.r / 255) * width);
                    y = Math.floor((rgb.g / 255) * height);
                } else if (useAxis == "1-3") {
                    x = Math.floor((rgb.r / 255) * width);
                    y = Math.floor((rgb.b / 255) * height);
                } else {
                    x = Math.floor((rgb.g / 255) * width);
                    y = Math.floor((rgb.b / 255) * height);
                }
            } else {
                if (useAxis = "1-2") {
                    x = Math.floor(hsv.H * width);
                    y = Math.floor(hsv.S * height);
                } else if (useAxis == "1-3") {
                    x = Math.floor(hsv.H * width);
                    h - v平面にするなら逆対数スケールにする
                    const a = 4;
                    y = Math.floor(Math.exp(hsv.V * a) / Math.exp(a) * height);
                } else {
                    x = Math.floor(hsv.S * width);
                    y = Math.floor(hsv.V * height);
                }
            }
            if (reverse !== "default") {
                [x, y] = [y, x];
            }

            // プロットする点を描画
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = item.colorCode;
            ctx.fill();

            // プロットされた点を記録
            points.push({
                x, y, name: item.name,
                office: item.office,
                colorCode: item.colorCode,
                rgb: `r:${rgb.r} g:${rgb.g} b:${rgb.b}`,
                hsv: `h:${hsv.H.toFixed(4)} s:${hsv.S.toFixed(4)} v:${hsv.V.toFixed(4)}`
            });
        });
    }


    // マウス移動時にツールチップを表示
    canvas.addEventListener('mousemove', function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        let found = false;

        points.forEach(point => {
            const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);
            if (distance < 5) { // 5ピクセル以内でヒットとみなす
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                tooltip.innerHTML = `${point.name}<br>${point.office}<br>${point.colorCode}<br>${point.rgb}<br>${point.hsv}`;
                tooltip.style.display = 'block';
                found = true;
            }
        });

        if (!found) {
            tooltip.style.display = 'none';
        }
    });


    // 検索
    function searchV() {
        const query = document.getElementById("query").value;
        const linesContainer = document.getElementById('linesContainer');
        if (query == "") return;

        // 最初に全部消す！
        while (linesContainer.firstChild) {
            linesContainer.removeChild(linesContainer.firstChild);
        }

        const results = points.filter(point =>
            Object.values(point).some(value =>
                value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );

        showInfo(results)
        // console.log(results);

        function addLine(x, y, isHorizontal) {
            const canvas = document.getElementById('colorChart');
            const rect = canvas.getBoundingClientRect();
            const line = document.createElement('div');
            line.classList.add('line');
            if (isHorizontal) {
                line.classList.add('horizontal');
                line.style.width = `${width + 1}px`;
                line.style.top = (rect.top + y + 1) + 'px';
                line.style.left = rect.left + 'px';
            } else {
                line.classList.add('vertical');
                line.style.height = `${height + 1}px`;
                line.style.left = (rect.left + x + 1) + 'px';
                line.style.top = rect.top + 'px';
            }
            document.getElementById('linesContainer').appendChild(line);
        }

        addLine(0, results[0].y, true)
        addLine(results[0].x, 0, false)
    }


    function showInfo(results) {
        const infoElement = document.getElementById('info');

        // 最初に全部消す！
        while (infoElement.firstChild) {
            infoElement.removeChild(infoElement.firstChild);
        }

        results.forEach(item => {
            const infoLine = document.createElement('div');
            infoLine.textContent = `x: ${item.x}, y: ${item.y}, name: ${item.name}, office: ${item.office}, colorCode: ${item.colorCode}, ${item.rgb}, ${item.hsv}`;
            infoElement.appendChild(infoLine);
        });


    }


    loadSettings()
    drawColorChart()
    plotData();


    // 適応！
    const adaptElement = document.getElementById("adapt");
    adaptElement.addEventListener("click", function () {
        points = [];
        loadSettings()
        drawColorChart()
        plotData();
    });

    // 検索！
    document.getElementById("search").addEventListener("click", searchV);
});
