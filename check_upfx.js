const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIReady.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== up_fx (ID 131) ===\n');
const fx = data[131];
console.log('Type:', fx.__type__);
console.log('Name:', fx._name || data[fx.node.__id__]._name);

if (fx.node) {
    const node = data[fx.node.__id__];
    console.log('\nNode ID:', fx.node.__id__);
    console.log('Node name:', node._name);
    console.log('Node children:', node._children ? node._children.length : 0);

    if (node._children) {
        console.log('\nChildren:');
        node._children.forEach(childRef => {
            const child = data[childRef.__id__];
            console.log(`  - "${child._name}" (ID: ${childRef.__id__})`);

            // Check for sprites
            if (child._components) {
                child._components.forEach(compRef => {
                    const comp = data[compRef.__id__];
                    if (comp.__type__ === 'cc.Sprite' && comp._spriteFrame) {
                        console.log(`    Sprite UUID: ${comp._spriteFrame.__uuid__}`);
                    }
                });
            }
        });
    }
}
