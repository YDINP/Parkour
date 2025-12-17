const fs = require('fs');

const kakaoFontUUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f";

const prefabs = [
    'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\effects\\prefabs\\loseCoin.prefab',
    'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\effects\\prefabs\\loseDiamond.prefab',
    'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIEndPage.prefab'
];

console.log('=== Updating Labels to Kakao Font with Outline ===\n');

prefabs.forEach(prefabPath => {
    const fileName = prefabPath.split('\\').pop();
    console.log(`Processing ${fileName}...`);

    const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));
    let labelCount = 0;
    let outlineCount = 0;

    // Find all cc.Label components
    data.forEach((item, index) => {
        if (item && item.__type__ === 'cc.Label') {
            // Update font
            if (!item._N$file || item._N$file.__uuid__ !== kakaoFontUUID) {
                item._N$file = { "__uuid__": kakaoFontUUID };
                labelCount++;
            }

            // Update color to white
            if (!item._N$horizontalAlign) {
                item._N$horizontalAlign = 1; // CENTER
            }
            if (!item._N$verticalAlign) {
                item._N$verticalAlign = 1; // CENTER
            }

            // Check if LabelOutline already exists for this node
            const nodeId = item.node.__id__;
            const node = data[nodeId];

            if (node && node._components) {
                const hasOutline = node._components.some(compRef => {
                    const comp = data[compRef.__id__];
                    return comp && comp.__type__ === 'cc.LabelOutline';
                });

                if (!hasOutline) {
                    // Create LabelOutline component
                    const outlineId = data.length;
                    const outline = {
                        "__type__": "cc.LabelOutline",
                        "_name": "",
                        "_objFlags": 0,
                        "node": { "__id__": nodeId },
                        "_enabled": true,
                        "_color": {
                            "__type__": "cc.Color",
                            "r": 0,
                            "g": 0,
                            "b": 0,
                            "a": 255
                        },
                        "_width": 2
                    };

                    data.push(outline);
                    node._components.push({ "__id__": outlineId });
                    outlineCount++;
                }
            }
        }
    });

    fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  ✓ Labels updated: ${labelCount}`);
    console.log(`  ✓ Outlines added: ${outlineCount}`);
    console.log();
});

console.log('Done!');
