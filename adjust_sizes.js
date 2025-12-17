const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

// 레퍼런스 기준 1334x750 화면에서의 크기 조정

console.log('=== Adjusting UI elements ===\n');

// 1. 메인 컨테이너 "k" 크기 조정 (node index 2)
const kNode = data[2];
if (kNode && kNode._name === 'k') {
    kNode._contentSize.width = 920;
    kNode._contentSize.height = 500;
    console.log('Adjusted "k" container: 920x500');
}

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nPrefab file updated successfully!');
