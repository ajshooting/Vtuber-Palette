document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('colorChart');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');
    const width = canvas.width;
    const height = canvas.height;
    const real_width = canvas.getBoundingClientRect().width;
    const real_height = canvas.getBoundingClientRect().height;
    let points = [];

    let colorSpace = "hsv";
    let useAxis = "1-2";
    let reverse = "default";


    function toRealPixel(num) {
        return num * real_height / height
    }


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
                            imageData.data[index] = b;
                            imageData.data[index + 1] = r;
                            imageData.data[index + 2] = g;
                            imageData.data[index + 3] = a;
                        }
                    } else {
                        if (reverse == "default") {
                            imageData.data[index] = b;
                            imageData.data[index + 1] = g;
                            imageData.data[index + 2] = r;
                            imageData.data[index + 3] = a;
                        } else {
                            imageData.data[index] = g;
                            imageData.data[index + 1] = b;
                            imageData.data[index + 2] = r;
                            imageData.data[index + 3] = a;
                        }
                    }
                } else {
                    // HSV平面
                    let h, s, v;
                    // 軸割り当て
                    if (useAxis == "1-2") { // H-S
                        h = (x / width) * 360;
                        s = (y / height);
                        v = 1;
                    } else if (useAxis == "1-3") { // H-V
                        h = (x / width) * 360;
                        s = 1;
                        v = (y / height);
                    } else { // S-V
                        h = 0;
                        s = (x / width);
                        v = (y / height);
                    }

                    // 軸反転
                    if (reverse !== "default") {
                        if (useAxis == "1-2") { // H-S → S-H
                            [h, s] = [s * 360, h / 360];
                        } else if (useAxis == "1-3") { // H-V → V-H
                            [h, v] = [v * 360, h / 360];
                        } else { // S-V → V-S
                            [s, v] = [v, s];
                        }
                    }

                    // HSV→RGB
                    let rgb = hsvToRgb(h, s, v);
                    imageData.data[index] = rgb[0];
                    imageData.data[index + 1] = rgb[1];
                    imageData.data[index + 2] = rgb[2];
                    imageData.data[index + 3] = 50;
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
            'VEE': './colordict/VEE.csv',
            'Virtua': './colordict/VirtuaReal.csv',
            'VOMS': './colordict/VOMS.csv',
            'aogiri': './colordict/あおぎり高校.csv',
            'dot': './colordict/どっとライブ.csv',
            '774': './colordict/ななしいんく.csv',
            'niji': './colordict/にじさんじ.csv',
            'neo': './colordict/ネオポルテ.csv',
            'nori': './colordict/のりプロ.csv',
            'vspo': './colordict/ぶいすぽっ!.csv',
            'holos': './colordict/ホロスターズ.csv',
            'holo': './colordict/ホロライブ.csv',
            'mochi': './colordict/元もちぷろ.csv'
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
                let colorCode = '';
                if (columns[1] && columns[1].trim().startsWith('#')) {
                    colorCode = columns[1].trim()
                } else if (columns[2] && columns[2].trim().startsWith('#')) {
                    colorCode = columns[2].trim()
                } else {
                    continue;
                }
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
            let x, y;

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
                // 軸反転
                if (reverse !== "default") {
                    [x, y] = [y, x];
                }
            } else {
                // HSV平面
                if (useAxis == "1-2") { // H-S
                    if (reverse === "default") {
                        x = Math.floor(hsv.H * width);
                        y = Math.floor(hsv.S * height);
                    } else { // S-H
                        x = Math.floor(hsv.S * width);
                        y = Math.floor(hsv.H * height);
                    }
                } else if (useAxis == "1-3") { // H-V
                    if (reverse === "default") {
                        x = Math.floor(hsv.H * width);
                        y = Math.floor(hsv.V * height);
                    } else { // V-H
                        x = Math.floor(hsv.V * width);
                        y = Math.floor(hsv.H * height);
                    }
                } else { // S-V
                    if (reverse === "default") {
                        x = Math.floor(hsv.S * width);
                        y = Math.floor(hsv.V * height);
                    } else { // V-S
                        x = Math.floor(hsv.V * width);
                        y = Math.floor(hsv.S * height);
                    }
                }
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
        console.log(`loaded ${points.length} points`)
    }


    // マウス移動時にツールチップを表示
    canvas.addEventListener('mousemove', function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        let found = false;

        points.forEach(point => {
            if (Math.abs(mouseX - toRealPixel(point.x)) < toRealPixel(5) && Math.abs(mouseY - toRealPixel(point.y)) < toRealPixel(5)) { // 5ピクセル以内でヒットとみなす
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;
                const pageWidth = window.innerWidth;
                const pageHeight = window.innerHeight;

                let tooltipX = event.pageX + 10;
                let tooltipY = event.pageY + 10;

                if (tooltipX + tooltipWidth > pageWidth) {
                    tooltipX = event.pageX - tooltipWidth - 10;
                }
                if (tooltipY + tooltipHeight > pageHeight) {
                    tooltipY = event.pageY - tooltipHeight - 10;
                }

                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;
                tooltip.innerHTML = `${point.name}<br>${point.office}<br>${point.colorCode}<br>${point.rgb}<br>${point.hsv}`;
                tooltip.style.display = 'block';
                found = true;
            }
        });

        if (!found) {
            tooltip.style.display = 'none';
        }
    });



    // クリック・タッチ時の処理
    const handleEvent = (e) => {
        const canvas = document.getElementById('colorChart');
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX || e.touches[0].clientX) - rect.left;
        const clickY = (e.clientY || e.touches[0].clientY) - rect.top;

        // クリックまたはタップされた点を特定
        points.forEach(point => {
            const distance = Math.sqrt((clickX - toRealPixel(point.x)) ** 2 + (clickY - toRealPixel(point.y)) ** 2);
            if (distance < toRealPixel(5)) {
                document.getElementById('colorSample').style.backgroundColor = point.colorCode;
                document.getElementById('descriptionBox').innerHTML = `${point.name}<br>${point.office}<br>${point.colorCode}<br>${point.rgb}<br>${point.hsv}`;
            }
        });
    };

    canvas.addEventListener('click', handleEvent);
    canvas.addEventListener('touchstart', handleEvent);



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
                line.style.width = `${real_width}px`;
                line.style.top = (rect.top + toRealPixel(y)) + 'px';
                line.style.left = rect.left + 'px';
            } else {
                line.classList.add('vertical');
                line.style.height = `${real_height}px`;
                line.style.left = (rect.left + toRealPixel(x)) + 'px';
                line.style.top = rect.top + 'px';
            }
            document.getElementById('linesContainer').appendChild(line);
        }

        addLine(0, results[0].y, true)
        addLine(results[0].x, 0, false)

        document.getElementById('colorSample').style.backgroundColor = results[0].colorCode
        document.getElementById('descriptionBox').innerHTML = `${results[0].name}<br>${results[0].office}<br>${results[0].colorCode}<br>${results[0].rgb}<br>${results[0].hsv}`
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


    // 全選択
    document.getElementById('checkAll').addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
    });

    // 全選択解除
    document.getElementById('uncheckAll').addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    });


    // 二本指拡大禁止
    document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });


    // ダブルタップズーム禁止
    document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });

});
