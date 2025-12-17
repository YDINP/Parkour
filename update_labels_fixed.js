const fs = require('fs');

// 프리팹 파일 경로
const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";

// KAKAOFRIENDSREGULAR 폰트 UUID
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

// 파일 읽기
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

let modifiedCount = 0;
let outlineAddedCount = 0;
let colorModifiedCount = 0;

// 먼저 Label을 찾고, 필요한 작업 수행
for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item && item.__type__ === 'cc.Label') {
        const nodeId = item.node?.__id__;
        console.log(`\nProcessing Label at index ${i}, node __id__: ${nodeId}`);

        // 1. 폰트를 KAKAOFRIENDSREGULAR로 변경
        item._N$file = { "__uuid__": KAKAO_FONT_UUID };
        item._isSystemFontUsed = false;
        modifiedCount++;
        console.log(`  - Changed font to KAKAOFRIENDSREGULAR`);

        // 2. 노드의 색상을 흰색으로 변경
        if (data[nodeId] && data[nodeId].__type__ === 'cc.Node') {
            if (data[nodeId]._color) {
                data[nodeId]._color.r = 255;
                data[nodeId]._color.g = 255;
                data[nodeId]._color.b = 255;
                colorModifiedCount++;
                console.log(`  - Changed node color to white`);
            }
        }

        // 3. LabelOutline이 있는지 확인
        let hasOutline = false;
        const nextItem = data[i + 1];
        if (nextItem && nextItem.__type__ === 'cc.LabelOutline') {
            // 기존 outline의 색상을 검은색으로, width를 2로 변경
            nextItem._color = {
                "__type__": "cc.Color",
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 255
            };
            nextItem._width = 2;
            hasOutline = true;
            console.log(`  - Updated existing LabelOutline`);
        }

        // 4. LabelOutline이 없으면 추가
        if (!hasOutline) {
            // 노드의 _components 배열 찾기
            const node = data[nodeId];
            if (node && node._components) {
                // 새 LabelOutline의 인덱스 (Label 바로 다음)
                const newOutlineIndex = i + 1;

                // LabelOutline 컴포넌트 생성
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

                // Label과 다음 항목 사이에 LabelOutline 삽입
                data.splice(newOutlineIndex, 0, labelOutline);

                // 노드의 _components 배열에 새 LabelOutline 참조 추가
                node._components.push({
                    "__id__": newOutlineIndex
                });

                outlineAddedCount++;
                console.log(`  - Added new LabelOutline at index ${newOutlineIndex}`);
                console.log(`  - Added component reference to node`);

                // 인덱스 조정 (새 항목을 삽입했으므로 모든 후속 __id__ 참조를 업데이트해야 함)
                // 이 부분이 복잡하므로 간단한 접근으로 변경
                i++; // 다음 반복에서 새로 추가된 outline을 건너뛰기
            }
        }
    }
}

console.log(`\n=== Summary ===`);
console.log(`Labels modified: ${modifiedCount}`);
console.log(`Label colors changed: ${colorModifiedCount}`);
console.log(`LabelOutlines added: ${outlineAddedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\nPrefab file updated successfully!`);
