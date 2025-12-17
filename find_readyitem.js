const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIReady.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Finding readyItem in UIReady ===\n');

// Find the main component with lay_props_content
const mainComp = data.find(item => item.lay_props_content);
if (mainComp) {
    const layoutId = mainComp.lay_props_content.__id__;
    const layout = data[layoutId];
    const layoutNode = data[layout.node.__id__];
    console.log('Layout node:', layoutNode._name);

    if (layoutNode._children && layoutNode._children.length > 0) {
        console.log('\nChildren (readyItem templates):');
        const child = data[layoutNode._children[0].__id__];
        console.log(`\n"${child._name}" (ID: ${layoutNode._children[0].__id__})`);

        // List all components
        if (child._components) {
            console.log('\nComponents:');
            child._components.forEach((compRef, idx) => {
                const comp = data[compRef.__id__];
                console.log(`  ${idx}. ${comp.__type__} (ID: ${compRef.__id__})`);

                // Check for switcher property
                if (comp.switcher) {
                    console.log(`     → Has switcher property: ID ${comp.switcher.__id__}`);

                    const switcherComp = data[comp.switcher.__id__];
                    const switcherNode = data[switcherComp.node.__id__];
                    console.log(`     Switcher node: "${switcherNode._name}"`);

                    // Find switcher children
                    if (switcherNode._children) {
                        console.log('\n     Switcher children (check states):');
                        switcherNode._children.forEach((swChildRef, swIdx) => {
                            const swChild = data[swChildRef.__id__];
                            console.log(`       ${swIdx}. "${swChild._name}" (ID: ${swChildRef.__id__}, active: ${swChild._active})`);

                            // Check for sprites (check mark)
                            if (swChild._components) {
                                swChild._components.forEach(scRef => {
                                    const sc = data[scRef.__id__];
                                    if (sc.__type__ === 'cc.Sprite' && sc._spriteFrame) {
                                        console.log(`          Sprite UUID: ${sc._spriteFrame.__uuid__}`);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }

        // Also check direct children for check marks
        console.log('\n\nDirect children of buff_1:');
        if (child._children) {
            child._children.forEach(directChildRef => {
                const directChild = data[directChildRef.__id__];
                console.log(`  - "${directChild._name}" (ID: ${directChildRef.__id__})`);
            });
        }
    }
}
