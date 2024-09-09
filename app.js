document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('colorChart');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');
    const width = canvas.width;
    const height = canvas.height;
    const points = []; // プロットされた点を保存するリスト

    // カラーチャートの作成
    function drawColorChart() {
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = Math.floor((x / width) * 255);
                const g = Math.floor((y / height) * 255);
                const b = 128; // 固定値もしくは別の要素で調整可能
                imageData.data[index] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = 50; // 不透明度
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }


    // CSVファイルからデータを読み込む
    async function loadCSVFiles() {
        const files = ['./colordict/のりプロ.csv',
            './colordict/ななしいんく.csv',
            './colordict/ホロライブ.csv',
            './colordict/ぶいすぽっ!.csv',
            './colordict/ネオポルテ.csv',
            './colordict/にじさんじ.csv'];
        let data = [];
        for (const file of files) {
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

    function rgbToHsv(rgb) {
        const R = rgb.r / 255.0
        const G = rgb.g / 255.0
        const B = rgb.b / 255.0

        const C_max = Math.max(R, G, B)
        const C_min = Math.min(R, G, B)
        const delta = C_max - C_min

        let H = 0;
        let S = 0;
        let V = 0;

        if (delta == 0) {
            H = 0
        }
        else if (C_max == R) {
            H = 60 * (((G - B) / delta) % 6)
        }
        else if (C_max == G) {
            H = 60 * (((B - R) / delta) + 2)
        }
        else if (C_max == B) {
            H = 60 * (((R - G) / delta) + 4)
        }

        if (C_max == 0) {
            S = 0
        }
        else {
            S = delta / C_max
        }

        V = C_max

        if (H < 0) {
            H += 360
        }

        return {
            H: H / 360,
            S: S,
            V: V
        };
    }


    // データをカラーチャートにプロット
    async function plotData() {
        const data = await loadCSVFiles();

        data.forEach(item => {
            const rgb = hexToRgb(item.colorCode);
            // r-g平面にしようとしたけどおかしかった
            // const x = Math.floor((rgb.r / 255) * width);
            // const y = Math.floor((rgb.g / 255) * height);
            const hsv = rgbToHsv(rgb);
            const x = Math.floor(hsv.H * width);
            // h-v平面にしたらいい感じ、逆対数スケールにして見やすくした
            // const y = Math.floor(hsv.V * height);
            const a = 4;
            const y = Math.floor(Math.exp(hsv.V * a) / Math.exp(a) * height);

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

            // console.log({
            //     x, y, name: item.name,
            //     office: item.office,
            //     colorCode: item.colorCode,
            //     rgb: `r:${rgb.r} g:${rgb.g} b:${rgb.b}`,
            //     hsv: `h:${hsv.H.toFixed(4)} s:${hsv.S.toFixed(4)} v:${hsv.V.toFixed(4)}`
            // })
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
            if (distance < 8) { // 5ピクセル以内でヒットとみなす
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

    // drawColorChart();
    plotData();
});
