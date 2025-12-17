const fs = require('fs');
const path = require('path');

const uuids = {
    'ui_game_up_01': '87f103fc-bc55-4cc1-aa87-4bd25461c758',
    'ui_coin_01': '2fd8b484-32dd-4c20-bf0f-5d545ef59898',
    'ui_crystal_01': '7a98eff5-8304-4f46-8052-a23bb8d0f6d2',
    'card_crystal_01': '2a0a6e4e-96e7-4ae2-b10b-cc4ebb55882b'
};

console.log('=== Searching for old resource UUIDs ===\n');

function searchInDirectory(dir, extensions) {
    const results = {};

    function walkDir(currentDir) {
        const files = fs.readdirSync(currentDir);

        files.forEach(file => {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('temp')) {
                    walkDir(filePath);
                }
            } else if (extensions.some(ext => file.endsWith(ext))) {
                const content = fs.readFileSync(filePath, 'utf8');

                Object.entries(uuids).forEach(([name, uuid]) => {
                    if (content.includes(uuid)) {
                        if (!results[name]) {
                            results[name] = [];
                        }
                        const relativePath = path.relative('C:\\Users\\a\\Documents\\Parkour', filePath);
                        results[name].push(relativePath);
                    }
                });
            }
        });
    }

    walkDir(dir);
    return results;
}

// Search in prefabs and scenes
const assetsDir = 'C:\\Users\\a\\Documents\\Parkour\\assets';
const results = searchInDirectory(assetsDir, ['.prefab', '.fire']);

Object.entries(results).forEach(([name, files]) => {
    console.log(`${name} (UUID: ${uuids[name]}):`);
    files.forEach(file => {
        console.log(`  - ${file}`);
    });
    console.log();
});

if (Object.keys(results).length === 0) {
    console.log('No files found using these resources.');
}
