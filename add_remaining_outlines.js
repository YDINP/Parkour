const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

// 아웃라인이 없는 Label 노드들: 74, 95, 108, 111
const nodesNeedingOutline = [74, 95, 108, 111];

let addedCount = 0;
let colorChangedCount = 0;

for (const nodeId of nodesNeedingOutline) {
    // 해당 노드 찾기
    const node = data[nodeId];
    if (!node || node.__type__ !== 'cc.Node') {
        console.log(`Node ${nodeId} not found or not a Node`);
        continue;
    }

    // 노드 색상을 흰색으로 변경
    if (node._color) {
        node._color.r = 255;
        node._color.g = 255;
        node._color.b = 255;
        colorChangedCount++;
        console.log(`Changed color for node ${nodeId} to white`);
    }

    // 노드의 컴포넌트들 확인
    if (!node._components) {
        console.log(`Node ${nodeId} has no components`);
        continue;
    }

    // 이미 LabelOutline이 있는지 확인
    let hasOutline = false;
    for (const comp of node._components) {
        const compId = comp.__id__;
        if (data[compId] && data[compId].__type__ === 'cc.LabelOutline') {
            hasOutline = true;
            break;
        }
    }

    if (hasOutline) {
        console.log(`Node ${nodeId} already has LabelOutline`);
        continue;
    }

    // 새 LabelOutline 객체 생성
    const newOutlineIndex = data.length;
    const labelOutline = {
        "__type__": "cc.LabelOutline",
        "_name": "",
        "_objFlags": 0,
        "node": {
            "__id__": nodeId
        },
        "_enabled": true,
        "_color": {
            "__type__": "cc.Color",
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 255
        },
        "_width": 2,
        "_id": ""
    };

    // 데이터 배열에 추가
    data.push(labelOutline);

    // 노드의 _components 배열에 참조 추가
    node._components.push({
        "__id__": newOutlineIndex
    });

    addedCount++;
    console.log(`Added LabelOutline to node ${nodeId} at index ${newOutlineIndex}`);
}

console.log(`\n=== Summary ===`);
console.log(`LabelOutlines added: ${addedCount}`);
console.log(`Colors changed: ${colorChangedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nPrefab file updated successfully!`);
