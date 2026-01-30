/**
 * TMX 파일의 타일 레이어 압축 방식을 zlib에서 CSV로 변환하는 스크립트
 *
 * 사용법: node convert-tmx-to-csv.js [경로]
 * 예: node convert-tmx-to-csv.js ../assets/resources/map
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function convertTmxFile(filePath) {
    console.log(`Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // base64+zlib 데이터를 CSV로 변환
    const regex = /<data encoding="base64" compression="zlib">\s*([\s\S]*?)\s*<\/data>/g;

    content = content.replace(regex, (match, base64Data) => {
        try {
            // base64 디코드
            const buffer = Buffer.from(base64Data.trim(), 'base64');

            // zlib 압축 해제
            const decompressed = zlib.inflateSync(buffer);

            // 4바이트씩 읽어서 GID 배열로 변환
            const gids = [];
            for (let i = 0; i < decompressed.length; i += 4) {
                const gid = decompressed.readUInt32LE(i);
                gids.push(gid);
            }

            modified = true;
            return `<data encoding="csv">\n${gids.join(',')}\n</data>`;
        } catch (err) {
            console.error(`  Error decompressing data in ${filePath}: ${err.message}`);
            return match; // 오류 시 원본 유지
        }
    });

    if (modified) {
        // 백업 생성
        const backupPath = filePath + '.bak';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filePath, backupPath);
        }

        // 변환된 파일 저장
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  Converted successfully!`);
        return true;
    } else {
        console.log(`  No zlib data found or already CSV`);
        return false;
    }
}

function processDirectory(dirPath) {
    let converted = 0;
    let total = 0;

    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            const result = processDirectory(fullPath);
            converted += result.converted;
            total += result.total;
        } else if (file.name.endsWith('.tmx')) {
            total++;
            if (convertTmxFile(fullPath)) {
                converted++;
            }
        }
    }

    return { converted, total };
}

// 메인 실행
const targetPath = process.argv[2] || '../assets/resources/map';
const absolutePath = path.resolve(__dirname, targetPath);

console.log(`\nConverting TMX files in: ${absolutePath}\n`);

if (fs.existsSync(absolutePath)) {
    const stats = fs.statSync(absolutePath);

    if (stats.isDirectory()) {
        const result = processDirectory(absolutePath);
        console.log(`\n완료: ${result.converted}/${result.total} 파일 변환됨`);
    } else if (absolutePath.endsWith('.tmx')) {
        convertTmxFile(absolutePath);
    }
} else {
    console.error(`경로를 찾을 수 없습니다: ${absolutePath}`);
}
