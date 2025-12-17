const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Checking switcher node ===\n');

// Find item node (id 27)
console.log('Element 27 (should be item parent):');
console.log(JSON.stringify(data[27], null, 2));

console.log('\n\n=== Element 110 (switcher component) ===');
console.log(JSON.stringify(data[110], null, 2));

// Find switcher node by name
for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i]._name === 'switcher') {
        console.log(`\n\n=== Found switcher node at index ${i} ===`);
        console.log(JSON.stringify(data[i], null, 2));

        // Check components
        if (data[i]._components) {
            console.log('\n=== Switcher components ===');
            data[i]._components.forEach(comp => {
                const compData = data[comp.__id__];
                console.log(`Component at ${comp.__id__}:`);
                console.log(JSON.stringify(compData, null, 2));
            });
        }
    }
}
