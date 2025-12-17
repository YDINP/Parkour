const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIDrawBox.prefab";
const data = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));

console.log('=== Disabling bg Widget ===\n');

// bg is at index 2, Widget is at index 11
const widgetComponent = data[11];

if (widgetComponent && widgetComponent.__type__ === 'cc.Widget') {
    widgetComponent._enabled = false;
    console.log('✓ bg Widget disabled');
    console.log('  Previous state: enabled');
    console.log('  New state: disabled');
} else {
    console.log('✗ Widget component not found or wrong type');
}

// 파일 저장
fs.writeFileSync(prefabPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nUIDrawBox.prefab updated!');
