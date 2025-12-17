const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIReady.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== lab_upgrade_price (ID 168) ===\n');

// Find the component reference in the main component
const mainComp = data.find(item => item.lab_upgrade_price);
if (mainComp) {
    const labelCompId = mainComp.lab_upgrade_price.__id__;
    console.log('Label component ID:', labelCompId);

    const labelComp = data[labelCompId];
    console.log('Label type:', labelComp.__type__);

    const labelNode = data[labelComp.node.__id__];
    console.log('Label node:', labelNode._name);

    // Check parent
    if (labelNode._parent) {
        const parent = data[labelNode._parent.__id__];
        console.log('\nParent:', parent._name, '(ID:', labelNode._parent.__id__ + ')');

        // Check siblings
        if (parent._children) {
            console.log('\nSiblings:');
            parent._children.forEach(childRef => {
                const child = data[childRef.__id__];
                console.log(`  - "${child._name}" (ID: ${childRef.__id__})`);

                // Check for sprites with zuanshi or silvercoin
                if (child._components) {
                    child._components.forEach(compRef => {
                        const comp = data[compRef.__id__];
                        if (comp.__type__ === 'cc.Sprite' && comp._spriteFrame) {
                            const uuid = comp._spriteFrame.__uuid__;
                            if (uuid === 'e6b448aa-f4f6-4c85-bf0c-526c1deea0a3' ||
                                uuid === 'f5b2eb39-5bc5-4bfb-9103-6799f651d972') {
                                console.log(`    *** FOUND: ${uuid === 'e6b448aa-f4f6-4c85-bf0c-526c1deea0a3' ? 'zuanshi' : 'ui_silvercoin'} ***`);
                            }
                            console.log(`    Sprite UUID: ${uuid}`);
                        }
                    });
                }
            });
        }
    }
}
