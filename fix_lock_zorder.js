const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== UIHeroShop item z-order 수정 ===\n');

// item node (id 27)
const itemNode = data[27];

console.log('현재 children 순서:');
itemNode._children.forEach((childRef, index) => {
    const child = data[childRef.__id__];
    console.log(`${index}. ${child._name} (ID: ${childRef.__id__})`);
});

// lock을 switcher 앞으로 이동
// 현재: [0,1,2,3,4,5,6, switcher(7), 8,9,10,11,12, lock(13)]
// 목표: [0,1,2,3,4,5,6, lock(13), switcher(7), 8,9,10,11,12]

const lockIndex = itemNode._children.findIndex(c => c.__id__ === 156); // lock
const switcherIndex = itemNode._children.findIndex(c => c.__id__ === 61); // switcher

console.log(`\n현재 위치:`);
console.log(`  switcher: 인덱스 ${switcherIndex}`);
console.log(`  lock: 인덱스 ${lockIndex}`);

if (lockIndex > switcherIndex) {
    // lock을 제거하고 switcher 바로 앞에 삽입
    const lockRef = itemNode._children.splice(lockIndex, 1)[0];
    itemNode._children.splice(switcherIndex, 0, lockRef);

    console.log(`\n✓ lock을 switcher 앞으로 이동`);
    console.log(`  새 위치: lock(인덱스 ${switcherIndex}), switcher(인덱스 ${switcherIndex + 1})`);
} else {
    console.log('\n○ 이미 올바른 순서입니다.');
}

console.log('\n수정 후 children 순서:');
itemNode._children.forEach((childRef, index) => {
    const child = data[childRef.__id__];
    console.log(`${index}. ${child._name} (ID: ${childRef.__id__})`);
});

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nUIHeroShop.prefab 업데이트 완료!');
