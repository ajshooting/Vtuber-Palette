async function loadCSVFiles() {
    let readFiles = [];
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
            readFiles.push(files[checkbox.id]);
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

function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2)
    );
}

function calculateSimilarity(distance) {
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // 最大距離は √(255^2 + 255^2 + 255^2)
    return ((maxDistance - distance) / maxDistance) * 100;
}

async function findClosestColors() {
    const inputColor = document.getElementById('colorInput').value;
    const rgbInput = inputColor.startsWith('#') ? hexToRgb(inputColor) : inputColor.split(',').map(Number);
    const data = await loadCSVFiles();

    console.log('Input Color:', inputColor);
    console.log('RGB Input:', rgbInput);

    // HEXで処理するのかRGBで処理するのかしっかりしろよ！！
    const inputColorHEX = inputColor.startsWith('#') ? inputColor : "#" + ((1 << 24) + (rgbInput[0] << 16) + (rgbInput[1] << 8) + rgbInput[2]).toString(16).slice(1).toUpperCase();

    // 入力したカラーをデータの先頭に追加
    data.unshift({ name: 'Input Color', colorCode: inputColorHEX, office: 'User Input' });

    data.sort((a, b) => {
        const colorA = hexToRgb(a.colorCode);
        const colorB = hexToRgb(b.colorCode);
        return colorDistance(rgbInput, colorA) - colorDistance(rgbInput, colorB);
    });

    const colorList = document.getElementById('colorList');
    colorList.innerHTML = '';
    for (let i = 0; i < 50 && i < data.length; i++) {
        const colorItem = data[i];
        const colorRow = document.createElement('div');
        colorRow.className = 'color-row';

        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = colorItem.colorCode;

        const colorA = hexToRgb(colorItem.colorCode);
        const distance = colorDistance(rgbInput, colorA);
        const similarity = calculateSimilarity(distance).toFixed(2);

        const colorInfo = document.createElement('div');
        colorInfo.textContent = `${colorItem.name} (${colorItem.colorCode}) - ${colorItem.office} - <${similarity}%>`;

        colorRow.appendChild(colorBox);
        colorRow.appendChild(colorInfo);
        colorList.appendChild(colorRow);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // 検索
    document.getElementById('findButton').addEventListener('click', findClosestColors);

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
})