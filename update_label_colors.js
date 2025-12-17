const fs = require('fs');

// 프리팹 파일 경로
const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";

// 파일 읽기
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

// Label 노드의 부모 노드 색상 변경
let modifiedCount = 0;

for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item && item.__type__ === 'cc.Label') {
        const nodeId = item.node?.__id__;

        // 해당 Label의 노드 찾기
        for (let j = 0; j < data.length; j++) {
            const node = data[j];
            if (node && node.__type__ === 'cc.Node') {
                // 노드가 배열 인덱스 nodeId에 해당하는지 확인
                // 프리팹 구조에서 __id__는 배열 인덱스를 참조합니다
                if (j === nodeId) {
                    // 노드의 _color를 흰색으로 변경
                    if (node._color) {
                        node._color.r = 255;
                        node._color.g = 255;
                        node._color.b = 255;
                        console.log(`Updated color for node at index ${j} to white`);
                        modifiedCount++;
                    }
                    break;
                }
            }
        }
    }
}

console.log(`\nTotal Label node colors modified: ${modifiedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\nPrefab file updated successfully!`);
