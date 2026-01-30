/**
 * TMX 엔딩 맵 바닥 타일 수정 스크립트
 * 맵 마지막의 빈 타일(0)을 이전 타일과 동일한 값으로 채움
 * bg 레이어와 platform 레이어 모두 수정
 */

const fs = require('fs');
const path = require('path');

const mapDir = path.join(__dirname, '..', 'assets', 'resources', 'map');

// 모든 _end*.tmx 파일 찾기
function findEndMaps(dir) {
    const results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results.push(...findEndMaps(fullPath));
        } else if (item.name.includes('_end') && item.name.endsWith('.tmx')) {
            results.push(fullPath);
        }
    }
    return results;
}

// 특정 레이어의 빈 타일 수정
function fixLayerTiles(content, layerName) {
    const regex = new RegExp(`<layer[^>]*name="${layerName}"[^>]*>[\\s\\S]*?<data encoding="csv">([\\s\\S]*?)<\\/data>`, 'g');
    const match = regex.exec(content);

    if (!match) {
        return { content, modified: false, message: `No ${layerName} layer found` };
    }

    const csvData = match[1].trim();

    // CSV를 2D 배열로 파싱
    const rows = csvData.split('\n').map(row => row.split(',').map(n => parseInt(n.trim()) || 0));

    // 마지막 행
    const lastRowIndex = rows.length - 1;
    const lastRow = rows[lastRowIndex];

    // 마지막 행에서 0이 아닌 첫 번째 타일 값 찾기 (오른쪽에서 왼쪽으로)
    let fillValue = 0;
    for (let i = lastRow.length - 1; i >= 0; i--) {
        if (lastRow[i] !== 0) {
            fillValue = lastRow[i];
            break;
        }
    }

    // 만약 마지막 행에 값이 없으면, 이전 행들에서 찾기
    if (fillValue === 0) {
        for (let r = lastRowIndex - 1; r >= 0; r--) {
            for (let c = rows[r].length - 1; c >= 0; c--) {
                if (rows[r][c] !== 0) {
                    fillValue = rows[r][c];
                    break;
                }
            }
            if (fillValue !== 0) break;
        }
    }

    if (fillValue === 0) {
        return { content, modified: false, message: `No fill value found in ${layerName}` };
    }

    // 마지막 행의 빈 타일(0)을 fillValue로 채움
    let modified = false;
    for (let i = 0; i < lastRow.length; i++) {
        if (lastRow[i] === 0) {
            lastRow[i] = fillValue;
            modified = true;
        }
    }

    if (!modified) {
        return { content, modified: false, message: `No tiles to fix in ${layerName}` };
    }

    // 새 CSV 데이터 생성
    const newCsvData = rows.map(row => row.join(',')).join('\n');

    // 원본에서 레이어 데이터 교체
    const replaceRegex = new RegExp(`<layer([^>]*name="${layerName}"[^>]*)>[\\s\\S]*?<data encoding="csv">[\\s\\S]*?<\\/data>`);
    const newContent = content.replace(
        replaceRegex,
        `<layer$1>\n  <data encoding="csv">\n${newCsvData}\n</data>`
    );

    return { content: newContent, modified: true, message: `Fixed ${layerName}: filled with tile ${fillValue}` };
}

// 메인
const endMaps = findEndMaps(mapDir);
console.log(`Found ${endMaps.length} end maps\n`);

let fixedCount = 0;
for (const mapFile of endMaps) {
    console.log(`Processing: ${path.relative(mapDir, mapFile)}`);

    let content = fs.readFileSync(mapFile, 'utf8');
    let fileModified = false;

    // bg 레이어 수정 (시각적 바닥 타일)
    const bgResult = fixLayerTiles(content, 'bg');
    console.log(`  ${bgResult.message}`);
    if (bgResult.modified) {
        content = bgResult.content;
        fileModified = true;
    }

    // platform 레이어 수정 (충돌 감지용)
    const platformResult = fixLayerTiles(content, 'platform');
    console.log(`  ${platformResult.message}`);
    if (platformResult.modified) {
        content = platformResult.content;
        fileModified = true;
    }

    if (fileModified) {
        fs.writeFileSync(mapFile, content, 'utf8');
        fixedCount++;
    }
}

console.log(`\nDone! Fixed ${fixedCount}/${endMaps.length} files`);
