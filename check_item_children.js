const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Checking item node children ===\n');

// Find item node (id 27)
const itemNode = data[27];
console.log('Item node children IDs:', itemNode._children.map(c => c.__id__));

console.log('\n=== Item children details ===');
itemNode._children.forEach(childRef => {
    const child = data[childRef.__id__];
    if (child) {
        console.log(`ID ${childRef.__id__}: ${child._name} (active: ${child._active})`);
    }
});
