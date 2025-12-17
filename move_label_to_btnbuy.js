const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== label_amount를 btn_buy의 직접 자식으로 이동 ===\n');

// resIcon (ID 63)
const resIcon = data[63];
// btn_buy (ID 62)
const btnBuy = data[62];
// New Label (ID 70)
const labelNode = data[70];

console.log('현재 상태:');
console.log('  resIcon children:', resIcon._children.map(c => `${data[c.__id__]._name} (${c.__id__})`));
console.log('  btn_buy children:', btnBuy._children.map(c => `${data[c.__id__]._name} (${c.__id__})`));
console.log('  label_amount parent:', data[labelNode._parent.__id__]._name, `(${labelNode._parent.__id__})`);

// resIcon의 children에서 label 제거
const labelIndex = resIcon._children.findIndex(c => c.__id__ === 70);
if (labelIndex !== -1) {
    resIcon._children.splice(labelIndex, 1);
    console.log('\n✓ resIcon에서 label_amount 제거');
}

// btn_buy의 children에 label 추가
btnBuy._children.push({ "__id__": 70 });
console.log('✓ btn_buy에 label_amount 추가');

// label의 parent 변경
labelNode._parent = { "__id__": 62 };
console.log('✓ label_amount의 parent를 btn_buy로 변경');

// label의 위치 조정 (resIcon 옆으로)
labelNode._trs.array[0] = 30; // x position
labelNode._trs.array[1] = 2.185; // y position (resIcon과 같은 높이)

console.log('✓ label_amount 위치 조정: (30, 2.185)');

console.log('\n수정 후 상태:');
console.log('  resIcon children:', resIcon._children.map(c => `${data[c.__id__]._name} (${c.__id__})`));
console.log('  btn_buy children:', btnBuy._children.map(c => `${data[c.__id__]._name} (${c.__id__})`));
console.log('  label_amount parent:', data[labelNode._parent.__id__]._name, `(${labelNode._parent.__id__})`);

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nUIHeroShop.prefab 업데이트 완료!');
