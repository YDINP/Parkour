const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIDrawBox.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Checking bg node ===\n');

// bg is at index 2
const bgNode = data[2];
console.log('bg node name:', bgNode._name);
console.log('bg components:', bgNode._components.map(c => c.__id__));

console.log('\n=== Component details ===');
bgNode._components.forEach(compRef => {
    const comp = data[compRef.__id__];
    console.log(`Component ${compRef.__id__}:`, comp.__type__);
    if (comp.__type__ === 'cc.Widget') {
        console.log('  Widget found! Details:', JSON.stringify(comp, null, 2));
    }
});
