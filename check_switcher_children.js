const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Switcher 구조 분석 ===\n');

// switcher node (id 61)
const switcherNode = data[61];

console.log('Switcher name:', switcherNode._name);
console.log('Switcher children:');

switcherNode._children.forEach((childRef, index) => {
    const child = data[childRef.__id__];
    if (child) {
        console.log(`\n${index}. "${child._name}" (ID: ${childRef.__id__}, active: ${child._active})`);
        console.log(`   Position: (${child._trs.array[0]}, ${child._trs.array[1]})`);

        // 하위 자식들도 확인
        if (child._children && child._children.length > 0) {
            console.log('   Children:');
            child._children.forEach(subChildRef => {
                const subChild = data[subChildRef.__id__];
                if (subChild) {
                    console.log(`      - "${subChild._name}" (ID: ${subChildRef.__id__})`);
                }
            });
        }
    }
});

// lock 노드 확인
console.log('\n\n=== Lock 오브젝트 확인 ===');
const lockNode = data[156];
console.log('Lock name:', lockNode._name);
console.log('Lock active:', lockNode._active);
console.log('Lock position:', `(${lockNode._trs.array[0]}, ${lockNode._trs.array[1]})`);
console.log('Lock size:', `${lockNode._contentSize.width} x ${lockNode._contentSize.height}`);

if (lockNode._children) {
    console.log('Lock children:');
    lockNode._children.forEach(childRef => {
        const child = data[childRef.__id__];
        if (child) {
            console.log(`  - "${child._name}" (ID: ${childRef.__id__})`);
        }
    });
}
