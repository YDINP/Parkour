const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Adjusting All UI Elements ===\n');

let changedCount = 0;

for (let i = 0; i < data.length; i++) {
    const node = data[i];

    if (node && node.__type__ === 'cc.Node') {

        // 1. content (ScrollView 내용) - 카드 5개 배치
        if (node._name === 'content') {
            // 165 * 5 + 간격 = 약 900
            node._contentSize.width = 900;
            console.log(`✓ content width: 900`);
            changedCount++;
        }

        // 2. title - 상단으로 이동
        if (node._name === 'title') {
            node._trs.array[1] = 220; // Y 위치
            console.log(`✓ title Y position: 220`);
            changedCount++;
        }

        // 3. close 버튼 - 우상단
        if (node._name === 'close') {
            node._trs.array[0] = 430; // X 위치
            node._trs.array[1] = 220; // Y 위치
            console.log(`✓ close button position: (430, 220)`);
            changedCount++;
        }

        // 4. ScrollView - 카드 영역
        if (node._name === 'New ScrollView') {
            node._contentSize.height = 400;
            node._trs.array[1] = -30; // Y 위치
            console.log(`✓ ScrollView height: 400, Y: -30`);
            changedCount++;
        }

        // 5. headIcon (캐릭터 이미지) - 카드 내부
        if (node._name === 'headIcon') {
            node._contentSize.width = 140;
            node._contentSize.height = 195;
            node._trs.array[1] = 80; // Y 위치
            console.log(`✓ headIcon size: 140x195, Y: 80 (index ${i})`);
            changedCount++;
        }

        // 6. nameLab (이름) - 카드 내부
        if (node._name === 'nameLab') {
            node._trs.array[1] = 135; // Y 위치
            console.log(`✓ nameLab Y: 135 (index ${i})`);
            changedCount++;
        }

        // 7. lab_k (하트+스탯 영역) - 카드 내부
        if (node._name === 'lab_k') {
            node._trs.array[1] = 10; // Y 위치
            console.log(`✓ lab_k Y: 10 (index ${i})`);
            changedCount++;
        }

        // 8. switcher (버튼 영역) - 카드 내부
        if (node._name === 'switcher') {
            node._trs.array[1] = -110; // Y 위치
            console.log(`✓ switcher Y: -110 (index ${i})`);
            changedCount++;
        }
    }
}

console.log(`\n=== Summary ===`);
console.log(`Elements adjusted: ${changedCount}`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nPrefab file updated successfully!`);
