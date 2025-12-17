const fs = require('fs');

const tsxPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\map\\bg_forest_block.tsx";

console.log('=== Replacing bg_forest_block_up_01 with Kakao version ===\n');

let content = fs.readFileSync(tsxPath, 'utf8');

// Replace the path for bg_forest_block_up_01
const oldPath = 'source="forest/bg_forest_block_up_01.png"';
const newPath = 'source="../../Textures/kakao/map/bg_forest_block_up_01.png"';

if (content.includes(oldPath)) {
    content = content.replace(oldPath, newPath);
    fs.writeFileSync(tsxPath, content, 'utf8');
    console.log('✓ Updated bg_forest_block_up_01 to kakao version');
    console.log(`  Old: forest/bg_forest_block_up_01.png`);
    console.log(`  New: ../../Textures/kakao/map/bg_forest_block_up_01.png`);
} else {
    console.log('○ bg_forest_block_up_01 path not found or already updated');
}

console.log('\nDone!');
