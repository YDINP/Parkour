const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== UIHeroShop item 구조 분석 ===\n');

// item node (id 27)
const itemNode = data[27];

console.log('Item children order (앞에서부터 뒤로):');
itemNode._children.forEach((childRef, index) => {
    const child = data[childRef.__id__];
    if (child) {
        console.log(`${index}. ID ${childRef.__id__}: "${child._name}" (active: ${child._active})`);

        // lock_mask 찾기
        if (child._name === 'lock_mask' || child._name === 'lock') {
            console.log(`   -> 잠금 오브젝트 발견!`);
        }

        // 구매 관련 노드 찾기
        if (child._name.includes('buy') || child._name.includes('btn') || child._name.includes('select')) {
            console.log(`   -> 버튼 관련 오브젝트`);

            // 자식들 확인
            if (child._children && child._children.length > 0) {
                child._children.forEach(subChild => {
                    const subNode = data[subChild.__id__];
                    if (subNode) {
                        console.log(`      - ${subNode._name}`);
                    }
                });
            }
        }
    }
});

// label_amount와 buyResSwitch 찾기
console.log('\n=== 구매 관련 컴포넌트 찾기 ===');
for (let i = 0; i < data.length; i++) {
    const node = data[i];
    if (node && node.__type__ === 'cc.Node') {
        if (node._name === 'label_amount' || node._name === 'buyResSwitch' || node._name === 'amount') {
            console.log(`Found: "${node._name}" at index ${i}`);
            console.log(`  Parent: ${data[node._parent?.__id__]?._name || 'unknown'}`);
            console.log(`  Active: ${node._active}`);
            console.log(`  Position: (${node._trs.array[0]}, ${node._trs.array[1]})`);
        }
    }
}
