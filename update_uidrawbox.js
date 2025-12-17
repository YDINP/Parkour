const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIDrawBox.prefab";
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

// Kakao 리소스 UUID
const KAKAO_UUIDS = {
    // Gift box sprites
    gift_box1: "a67da255-d3b8-40ac-afdb-3cefa4aff854",  // 갈색
    gift_box2: "375f1042-77ec-4117-a9a6-ff00890160e5",  // 파란색
    gift_box3: "a0ff6a20-f519-4156-9f62-77f413c5650c",  // 핑크
    gift_box4: "59197fc9-f09c-4b79-8fc8-459d34565fec",  // 노란/보라
    gift_box5: "e9f4fd55-da8e-40a1-b80a-a65722d648ab",  // 초록
    gift_shadow: "55bf1b97-f142-4249-8071-03ec79eaa434", // 그림자
    gift_line: "2be93872-6252-41b2-9586-734cbf4319d6",   // 구분선

    // UI components
    popup_bg: "01d6519f-32ae-405b-8f3c-da265d854233",    // 팝업 배경
    gift_bg: "b3e7610d-caa0-4972-9e64-4efbb6ab00d9",     // gift1 전체 배경
    titleB: "c04feaae-e992-4149-9df7-4f197d2e585a",      // 타이틀 배경
    close_x: "690a3b20-6253-44c9-810f-332951506c1e",     // X 버튼
    dia_icon: "8d28465c-d0b6-4c43-807f-4eb400dc8486",    // 다이아 아이콘
    yellow_btn: "1ed2c830-ffa0-4c5c-9eaf-966cdfb8b38f"  // 노란 버튼
};

const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== UIDrawBox Kakao 리소스 변경 ===\n');

let spriteChanged = 0;
let fontChanged = 0;
let colorChanged = 0;
let outlineChanged = 0;

// 1. 스프라이트 UUID 교체
for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (item && item.__type__ === 'cc.Sprite') {
        const node = data[item.node?.__id__];

        if (node) {
            // heidi (구분선) -> gift_line
            if (node._name === 'heidi') {
                item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_line };
                console.log(`✓ heidi (구분선) -> gift_line`);
                spriteChanged++;
            }

            // box 노드들 -> gift box images
            if (node._name === 'box') {
                const parent = data[node._parent?.__id__];
                if (parent) {
                    if (parent._name === 'box_0') {
                        item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_box1 };
                        console.log(`✓ box_0 -> gift_box1 (갈색)`);
                        spriteChanged++;
                    } else if (parent._name === 'box_1') {
                        item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_box2 };
                        console.log(`✓ box_1 -> gift_box2 (파란색)`);
                        spriteChanged++;
                    } else if (parent._name === 'box_2') {
                        item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_box3 };
                        console.log(`✓ box_2 -> gift_box3 (핑크)`);
                        spriteChanged++;
                    } else if (parent._name === 'box_3') {
                        item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_box4 };
                        console.log(`✓ box_3 -> gift_box4 (노란/보라)`);
                        spriteChanged++;
                    } else if (parent._name === 'box_4') {
                        item._spriteFrame = { "__uuid__": KAKAO_UUIDS.gift_box5 };
                        console.log(`✓ box_4 -> gift_box5 (초록)`);
                        spriteChanged++;
                    }
                }
            }
        }
    }
}

console.log(`\n--- 스프라이트 변경 완료: ${spriteChanged}개 ---\n`);

// 2. Label 폰트 및 색상 변경
for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (item && item.__type__ === 'cc.Label') {
        const nodeId = item.node?.__id__;

        // 폰트 변경
        item._N$file = { "__uuid__": KAKAO_FONT_UUID };
        item._isSystemFontUsed = false;
        fontChanged++;

        // 노드 색상 변경 (흰색)
        if (data[nodeId] && data[nodeId]._color) {
            data[nodeId]._color.r = 255;
            data[nodeId]._color.g = 255;
            data[nodeId]._color.b = 255;
            colorChanged++;
        }
    }

    // 3. LabelOutline 업데이트
    if (item && item.__type__ === 'cc.LabelOutline') {
        item._color = {
            "__type__": "cc.Color",
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 255
        };
        item._width = 2;
        outlineChanged++;
    }
}

console.log(`--- Label 폰트 변경: ${fontChanged}개 ---`);
console.log(`--- 노드 색상 변경: ${colorChanged}개 ---`);
console.log(`--- Outline 업데이트: ${outlineChanged}개 ---\n`);

// 4. 크기 및 위치 조정 (1334x750 기준)
// 메인 컨테이너 "k" 조정
for (let i = 0; i < data.length; i++) {
    const node = data[i];

    if (node && node.__type__ === 'cc.Node') {
        if (node._name === 'k' && node._parent?.__id__ === 1) {
            // 메인 컨테이너
            node._contentSize.width = 980;
            node._contentSize.height = 562;
            console.log(`✓ 메인 컨테이너 (k) 크기: 980x562`);
        }
    }
}

console.log(`\n=== 완료 ===`);
console.log(`스프라이트: ${spriteChanged}개`);
console.log(`폰트: ${fontChanged}개`);
console.log(`색상: ${colorChanged}개`);
console.log(`아웃라인: ${outlineChanged}개`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nUIDrawBox.prefab 업데이트 완료!`);
