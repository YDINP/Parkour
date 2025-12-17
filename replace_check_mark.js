const fs = require('fs');

const prefabPath = "C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIReady.prefab";
const oldCheckUUID = "7cb4a352-1986-4e7b-83e5-e2dd625bd169"; // button_invite_yes_01
const newCheckUUID = "2938937a-2b02-445d-8528-ab45c784b48e"; // ui_img_friends_check

console.log('=== Replacing check mark in UIReady ===\n');

let content = fs.readFileSync(prefabPath, 'utf8');
const count = (content.match(new RegExp(oldCheckUUID, 'g')) || []).length;

if (count > 0) {
    content = content.replace(new RegExp(oldCheckUUID, 'g'), newCheckUUID);
    fs.writeFileSync(prefabPath, content, 'utf8');
    console.log(`✓ Replaced ${count} occurrence(s)`);
    console.log(`  Old: button_invite_yes_01`);
    console.log(`  New: ui_img_friends_check (kakao)`);
} else {
    console.log('○ No occurrences found');
}

console.log('\nDone!');
