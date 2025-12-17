const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Adjusting Card Layout ===\n');

// item 노드 찾기 및 크기 조정
for (let i = 0; i < data.length; i++) {
    const node = data[i];

    if (node && node.__type__ === 'cc.Node') {
        // 1. item (카드) 크기 조정
        if (node._name === 'item') {
            // 레퍼런스 기준: 약 165x300
            node._contentSize.width = 165;
            node._contentSize.height = 300;
            console.log(`Adjusted "item" card size: 165x300 (index ${i})`);
        }

        // 2. ScrollView content 영역 찾기
        if (node._name === 'content') {
            // ScrollView의 content 영역 - 카드 5개를 담을 수 있도록
            console.log(`Found "content" node at index ${i}`);
            console.log(`  Current size: ${node._contentSize.width}x${node._contentSize.height}`);
        }

        // 3. title 위치 조정
        if (node._name === 'title') {
            console.log(`Found "title" node at index ${i}`);
            console.log(`  Current position Y: ${node._trs.array[1]}`);
        }

        // 4. close 버튼 찾기
        if (node._name === 'close') {
            console.log(`Found "close" button at index ${i}`);
            console.log(`  Current position: X=${node._trs.array[0]}, Y=${node._trs.array[1]}`);
        }
    }
}

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nPrefab file updated successfully!');
