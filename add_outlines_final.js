const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

// 아웃라인이 없는 Label 인덱스들: 76, 97, 110, 113
const labelIndices = [76, 97, 110, 113];

let addedCount = 0;

for (const labelIndex of labelIndices) {
    const label = data[labelIndex];
    if (!label || label.__type__ !== 'cc.Label') {
        console.log(`Index ${labelIndex} is not a Label`);
        continue;
    }

    const nodeId = label.node?.__id__;
    const node = data[nodeId];

    if (!node) {
        console.log(`Node ${nodeId} not found for Label at index ${labelIndex}`);
        continue;
    }

    console.log(`\nProcessing Label at index ${labelIndex}, node __id__: ${nodeId}`);

    // 노드에 _color가 있으면 흰색으로 설정
    if (node._color) {
        node._color.r = 255;
        node._color.g = 255;
        node._color.b = 255;
        console.log(`  Set node color to white`);
    }

    // 다음 항목이 이미 LabelOutline인지 확인
    if (labelIndex + 1 < data.length && data[labelIndex + 1].__type__ === 'cc.LabelOutline') {
        console.log(`  Label already has outline`);
        continue;
    }

    // 새 LabelOutline 생성
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

    // 배열 끝에 추가
    data.push(labelOutline);

    // 노드의 _components 배열에 참조 추가
    if (node._components) {
        node._components.push({
            "__id__": newOutlineIndex
        });
        console.log(`  Added LabelOutline at index ${newOutlineIndex}`);
        console.log(`  Added component reference to node`);
        addedCount++;
    } else {
        console.log(`  Node has no _components array`);
    }
}

console.log(`\n=== Summary ===`);
console.log(`LabelOutlines added: ${addedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nPrefab file updated successfully!`);
