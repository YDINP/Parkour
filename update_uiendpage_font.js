const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIEndPage.prefab";
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== UIEndPage 폰트 변경 ===\n');

let fontChanged = 0;

// Label 폰트 변경
for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (item && item.__type__ === 'cc.Label') {
        // 폰트 변경
        item._N$file = { "__uuid__": KAKAO_FONT_UUID };
        item._isSystemFontUsed = false;
        fontChanged++;
        console.log(`✓ Label 폰트 변경 (index ${i})`);
    }
}

console.log(`\n=== 완료 ===`);
console.log(`폰트 변경: ${fontChanged}개`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nUIEndPage.prefab 폰트 업데이트 완료!`);
