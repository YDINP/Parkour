const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UILIftGift.prefab";
const KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

// Kakao 리소스 UUID (02stagemode 폴더)
const KAKAO_UUIDS = {
    // 메인 배경 및 UI
    upgrade_back: "7279bd07-f406-4222-965b-60a1662dedac",     // 업그레이드 팝업 배경 550x603
    upgrade_title: "8c5327c7-c13f-431a-b2c7-03aed9d53ece",    // 타이틀 배경 190x117
    purple_button: "677acf20-23f5-4a80-9326-33472d5ca5b8",    // 보라 버튼 146x141
    slot_bg: "3447bbb3-0beb-4b9a-97c1-4d742b6abec4",          // 능력 슬롯 183x192
    coin_icon: "d005a680-54b0-4540-a3d0-492f958d6a16",        // 코인 아이콘 67x62
    skill_icon: "677acf20-23f5-4a80-9326-33472d5ca5b8"        // 스킬 아이콘 (보라색 다이아)
};

// 0.72배 스케일 계산
const SCALE = 0.72;
const SIZES = {
    upgrade_back: { width: Math.round(550 * SCALE), height: Math.round(603 * SCALE) },    // 396x434
    upgrade_title: { width: Math.round(190 * SCALE), height: Math.round(117 * SCALE) },   // 137x84
    purple_button: { width: Math.round(146 * SCALE), height: Math.round(141 * SCALE) },   // 105x102
    slot_bg: { width: Math.round(183 * SCALE), height: Math.round(192 * SCALE) },         // 132x138
    coin_icon: { width: Math.round(67 * SCALE), height: Math.round(62 * SCALE) }          // 48x45
};

const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== UILIftGift Kakao 리소스 변경 ===\n');
console.log(`스케일: ${SCALE}배 적용\n`);

let spriteChanged = 0;
let fontChanged = 0;
let colorChanged = 0;
let outlineChanged = 0;
let sizeChanged = 0;

// 1. 스프라이트 UUID 교체 및 크기 조정
for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (item && item.__type__ === 'cc.Node') {
        // 메인 배경 (New Sprite - 첫 번째)
        if (item._name === 'New Sprite' && item._parent?.__id__ === 2 && item._contentSize?.width === 456) {
            item._contentSize.width = SIZES.upgrade_back.width;
            item._contentSize.height = SIZES.upgrade_back.height;
            console.log(`✓ 메인 배경 크기: ${SIZES.upgrade_back.width}x${SIZES.upgrade_back.height}`);
            sizeChanged++;

            // 배경 스프라이트 찾기
            const spriteComponent = item._components?.find(c => {
                const comp = data[c.__id__];
                return comp && comp.__type__ === 'cc.Sprite';
            });
            if (spriteComponent) {
                const sprite = data[spriteComponent.__id__];
                if (sprite) {
                    sprite._spriteFrame = { "__uuid__": KAKAO_UUIDS.upgrade_back };
                    console.log(`✓ 메인 배경 스프라이트 -> upgrade_back`);
                    spriteChanged++;
                }
            }
        }

        // 타이틀 (title_skillupgrade_01_ch 또는 두 번째 New Sprite)
        if ((item._name === 'title_skillupgrade_01_ch' ||
             (item._name === 'New Sprite' && item._parent?.__id__ === 3 && item._contentSize?.width === 116)) &&
            item._active !== undefined) {
            // 타이틀 스프라이트 찾기
            const spriteComponent = item._components?.find(c => {
                const comp = data[c.__id__];
                return comp && comp.__type__ === 'cc.Sprite';
            });
            if (spriteComponent) {
                const sprite = data[spriteComponent.__id__];
                if (sprite) {
                    sprite._spriteFrame = { "__uuid__": KAKAO_UUIDS.upgrade_title };
                    console.log(`✓ 타이틀 스프라이트 -> upgrade_title`);
                    spriteChanged++;
                }
            }
            item._contentSize.width = SIZES.upgrade_title.width;
            item._contentSize.height = SIZES.upgrade_title.height;
            console.log(`✓ 타이틀 크기: ${SIZES.upgrade_title.width}x${SIZES.upgrade_title.height}`);
            sizeChanged++;
        }

        // 업그레이드 버튼 (btn_upgrade)
        if (item._name === 'btn_upgrade') {
            item._contentSize.width = SIZES.purple_button.width;
            item._contentSize.height = SIZES.purple_button.height;
            console.log(`✓ 업그레이드 버튼 크기: ${SIZES.purple_button.width}x${SIZES.purple_button.height}`);
            sizeChanged++;
        }

        // 코인 아이콘 (img_gold)
        if (item._name === 'img_gold') {
            item._contentSize.width = SIZES.coin_icon.width;
            item._contentSize.height = SIZES.coin_icon.height;
            console.log(`✓ 코인 아이콘 크기: ${SIZES.coin_icon.width}x${SIZES.coin_icon.height}`);
            sizeChanged++;

            // 코인 스프라이트 교체
            const spriteComponent = item._components?.find(c => {
                const comp = data[c.__id__];
                return comp && comp.__type__ === 'cc.Sprite';
            });
            if (spriteComponent) {
                const sprite = data[spriteComponent.__id__];
                if (sprite) {
                    sprite._spriteFrame = { "__uuid__": KAKAO_UUIDS.coin_icon };
                    console.log(`✓ 코인 아이콘 스프라이트 -> coin_icon`);
                    spriteChanged++;
                }
            }
        }

        // Toggle 배경 (Background - 능력 슬롯)
        if (item._name === 'Background' && item._contentSize?.width === 100 && item._contentSize?.height === 100) {
            item._contentSize.width = SIZES.slot_bg.width;
            item._contentSize.height = SIZES.slot_bg.height;
            console.log(`✓ 능력 슬롯 크기: ${SIZES.slot_bg.width}x${SIZES.slot_bg.height} (index ${i})`);
            sizeChanged++;

            // 슬롯 배경 스프라이트 교체
            const spriteComponent = item._components?.find(c => {
                const comp = data[c.__id__];
                return comp && comp.__type__ === 'cc.Sprite';
            });
            if (spriteComponent) {
                const sprite = data[spriteComponent.__id__];
                if (sprite) {
                    sprite._spriteFrame = { "__uuid__": KAKAO_UUIDS.slot_bg };
                    console.log(`✓ 능력 슬롯 스프라이트 -> slot_bg (index ${i})`);
                    spriteChanged++;
                }
            }
        }

        // 스킬 아이콘 (icon)
        if (item._name === 'icon' && item._contentSize) {
            // 스킬 아이콘 스프라이트 교체
            const spriteComponent = item._components?.find(c => {
                const comp = data[c.__id__];
                return comp && comp.__type__ === 'cc.Sprite';
            });
            if (spriteComponent) {
                const sprite = data[spriteComponent.__id__];
                if (sprite) {
                    sprite._spriteFrame = { "__uuid__": KAKAO_UUIDS.skill_icon };
                    console.log(`✓ 스킬 아이콘 스프라이트 -> skill_icon (index ${i})`);
                    spriteChanged++;
                }
            }
        }
    }

    // 2. 버튼 스프라이트 교체
    if (item && item.__type__ === 'cc.Sprite') {
        const node = data[item.node?.__id__];
        if (node && node._name === 'btn_upgrade') {
            item._spriteFrame = { "__uuid__": KAKAO_UUIDS.purple_button };
            console.log(`✓ 버튼 스프라이트 -> purple_button`);
            spriteChanged++;
        }
    }
}

console.log(`\n--- 스프라이트 변경 완료: ${spriteChanged}개 ---`);
console.log(`--- 크기 조정 완료: ${sizeChanged}개 ---\n`);

// 3. Label 폰트 및 색상 변경
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

    // 4. LabelOutline 업데이트
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

console.log(`=== 완료 ===`);
console.log(`스프라이트: ${spriteChanged}개`);
console.log(`크기: ${sizeChanged}개`);
console.log(`폰트: ${fontChanged}개`);
console.log(`색상: ${colorChanged}개`);
console.log(`아웃라인: ${outlineChanged}개`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nUILIftGift.prefab 업데이트 완료!`);
