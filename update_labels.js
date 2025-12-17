const fs = require('fs');

// 프리팹 파일 경로
const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";

// KAKAOFRIENDSREGULAR 폰트 UUID
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

// 파일 읽기
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

// Label 노드 찾기 및 수정
let modifiedCount = 0;
let outlineAddedCount = 0;

for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item && item.__type__ === 'cc.Label') {
        const nodeId = item.node?.__id__;
        console.log(`Processing Label at index ${i}, node __id__: ${nodeId}`);

        // 폰트를 KAKAOFRIENDSREGULAR로 변경
        item._N$file = { "__uuid__": KAKAO_FONT_UUID };
        item._isSystemFontUsed = false;

        modifiedCount++;

        // 다음 항목이 LabelOutline인지 확인
        let hasOutline = false;
        if (i + 1 < data.length) {
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
                console.log(`  Updated existing LabelOutline`);
            }
        }

        // LabelOutline이 없으면 추가
        if (!hasOutline) {
            // PrefabInfo 찾기 (Label 다음에 있음)
            const prefabInfoIndex = i + 1;
            if (prefabInfoIndex < data.length) {
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

                // Label과 PrefabInfo 사이에 LabelOutline 삽입
                data.splice(prefabInfoIndex, 0, labelOutline);
                outlineAddedCount++;
                console.log(`  Added new LabelOutline`);

                // 인덱스 조정 (새 항목을 삽입했으므로)
                i++;
            }
        }
    }
}

console.log(`\nTotal Labels modified: ${modifiedCount}`);
console.log(`LabelOutlines added: ${outlineAddedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\nPrefab file updated successfully!`);
