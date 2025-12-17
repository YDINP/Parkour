const fs = require('fs');
const path = require('path');

const prefabsDir = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs";
const zuanshiUUID = "e6b448aa-f4f6-4c85-bf0c-526c1deea0a3";
const silvercoinUUID = "f5b2eb39-5bc5-4bfb-9103-6799f651d972";

console.log('=== Searching for old icons in prefabs ===\n');

const files = fs.readdirSync(prefabsDir).filter(f => f.endsWith('.prefab'));

files.forEach(file => {
    const filePath = path.join(prefabsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const hasZuanshi = content.includes(zuanshiUUID);
    const hasSilvercoin = content.includes(silvercoinUUID);

    if (hasZuanshi || hasSilvercoin) {
        console.log(`${file}:`);
        if (hasZuanshi) console.log('  - zuanshi.png');
        if (hasSilvercoin) console.log('  - ui_silvercoin.png');
    }
});

console.log('\nDone.');
