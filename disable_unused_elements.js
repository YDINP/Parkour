const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Disabling Unused Elements ===\n');

let disabledCount = 0;

// 레퍼런스에 없는 요소들:
// - btn_add (추가 버튼)
// - btn_select (선택 버튼 - 레벨업만 있음)
// - maxlabel (최대 레벨 표시는 레퍼런스에 없음)

for (let i = 0; i < data.length; i++) {
    const node = data[i];

    if (node && node.__type__ === 'cc.Node') {

        // btn_add 비활성화 (레퍼런스에 + 버튼 없음)
        if (node._name === 'btn_add') {
            node._active = false;
            console.log(`✗ Disabled "btn_add" at index ${i}`);
            disabledCount++;
        }

        // btn_select copy 비활성화 (필요시)
        if (node._name === 'btn_select copy') {
            node._active = false;
            console.log(`✗ Disabled "btn_select copy" at index ${i}`);
            disabledCount++;
        }
    }
}

console.log(`\n=== Summary ===`);
console.log(`Elements disabled: ${disabledCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nPrefab file updated successfully!`);
