const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Label Analysis ===\n');

for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i].__type__ === 'cc.Label') {
        const nodeId = data[i].node?.__id__;
        console.log(`Label at index ${i}, node __id__: ${nodeId}`);

        // 다음 항목 확인
        const hasOutline = (i + 1 < data.length && data[i + 1].__type__ === 'cc.LabelOutline');
        console.log(`  Has outline: ${hasOutline}`);

        // 노드 색상 확인
        if (data[nodeId]) {
            const color = data[nodeId]._color;
            if (color) {
                console.log(`  Node color: R=${color.r}, G=${color.g}, B=${color.b}`);
            } else {
                console.log(`  Node has no _color property`);
            }
        } else {
            console.log(`  Node ${nodeId} not found at that index`);
        }
        console.log('');
    }
}
