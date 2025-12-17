const fs = require('fs');
const path = require('path');

const prefabsDir = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs";
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

// 이미 수정한 프리펩 제외
const excludePrefabs = [
    'UIHeroShop.prefab',
    'UIDrawBox.prefab',
    'UILIftGift.prefab',
    'UIEndPage.prefab'
];

// 모든 프리펩 파일 가져오기
const allFiles = fs.readdirSync(prefabsDir);
const prefabFiles = allFiles.filter(file =>
    file.endsWith('.prefab') && !excludePrefabs.includes(file)
);

console.log('=== 전체 프리펩 폰트 일괄 변경 ===\n');
console.log(`대상 프리펩: ${prefabFiles.length}개\n`);

let totalFontChanged = 0;
let totalPrefabsProcessed = 0;

prefabFiles.forEach(filename => {
    const prefabPath = path.join(prefabsDir, filename);

    try {
        const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));
        let fontChanged = 0;

        // Label 폰트 변경
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (item && item.__type__ === 'cc.Label') {
                // 폰트 변경
                item._N$file = { "__uuid__": KAKAO_FONT_UUID };
                item._isSystemFontUsed = false;
                fontChanged++;
            }
        }

        if (fontChanged > 0) {
            // 파일 저장
            fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✓ ${filename}: ${fontChanged}개 Label 폰트 변경`);
            totalFontChanged += fontChanged;
            totalPrefabsProcessed++;
        } else {
            console.log(`○ ${filename}: Label 없음`);
        }
    } catch (error) {
        console.error(`✗ ${filename}: 오류 발생 - ${error.message}`);
    }
});

console.log(`\n=== 완료 ===`);
console.log(`처리된 프리펩: ${totalPrefabsProcessed}개`);
console.log(`변경된 Label: ${totalFontChanged}개`);
console.log(`\n모든 프리펩 폰트 업데이트 완료!`);
