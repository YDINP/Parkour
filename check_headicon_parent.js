const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIHeroShop.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Checking headIcon parent hierarchy ===\n');

// headIcon is at some index, find it
let headIconIndex = -1;
for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i]._name === 'headIcon') {
        headIconIndex = i;
        break;
    }
}

console.log(`headIcon found at index: ${headIconIndex}`);

if (headIconIndex >= 0) {
    const headIcon = data[headIconIndex];
    let currentNode = headIcon;
    let currentIndex = headIconIndex;
    const hierarchy = [];

    while (currentNode && currentNode._parent) {
        const parentId = currentNode._parent.__id__;
        const parentNode = data[parentId];
        hierarchy.push(`${parentId}: ${parentNode._name}`);
        currentNode = parentNode;
        currentIndex = parentId;

        if (parentNode._name === 'item') {
            break;
        }
    }

    console.log('\nHierarchy from headIcon to item:');
    console.log('headIcon ->');
    hierarchy.forEach(h => console.log(`  -> ${h}`));
}
