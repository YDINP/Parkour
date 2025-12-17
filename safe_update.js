const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

let fontChangedCount = 0;
let colorChangedCount = 0;
let outlineUpdatedCount = 0;

console.log('=== Safe Update (no new components) ===\n');

for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // 1. Label 폰트 변경
    if (item && item.__type__ === 'cc.Label') {
        const nodeId = item.node?.__id__;
        console.log(`Label at index ${i}, node __id__: ${nodeId}`);

        // 폰트 변경
        item._N$file = { "__uuid__": KAKAO_FONT_UUID };
        item._isSystemFontUsed = false;
        fontChangedCount++;
        console.log(`  - Changed font`);

        // 노드 색상 변경 (색상이 있는 경우에만)
        if (data[nodeId] && data[nodeId]._color) {
            data[nodeId]._color.r = 255;
            data[nodeId]._color.g = 255;
            data[nodeId]._color.b = 255;
            colorChangedCount++;
            console.log(`  - Changed color to white`);
        }
    }

    // 2. 기존 LabelOutline 업데이트 (새로 추가하지 않음)
    if (item && item.__type__ === 'cc.LabelOutline') {
        item._color = {
            "__type__": "cc.Color",
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 255
        };
        item._width = 2;
        outlineUpdatedCount++;
        console.log(`LabelOutline at index ${i}: updated color and width`);
    }
}

// 3. 메인 컨테이너 크기 조정
const kNode = data[2];
if (kNode && kNode._name === 'k') {
    kNode._contentSize.width = 920;
    kNode._contentSize.height = 500;
    console.log('\nAdjusted "k" container: 920x500');
}

console.log(`\n=== Summary ===`);
console.log(`Labels font changed: ${fontChangedCount}`);
console.log(`Node colors changed: ${colorChangedCount}`);
console.log(`Existing outlines updated: ${outlineUpdatedCount}`);

fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nPrefab file updated successfully!`);
console.log('\n⚠️  Note: Labels without outline need manual LabelOutline component in Cocos Creator');
console.log('   - Color: #000000 (black)');
console.log('   - Width: 2');
