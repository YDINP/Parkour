const fs = require('fs');

const replacements = [
    {
        file: 'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\effects\\prefabs\\loseCoin.prefab',
        old: '2fd8b484-32dd-4c20-bf0f-5d545ef59898', // ui_coin_01
        new: 'd005a680-54b0-4540-a3d0-492f958d6a16', // ui_img_lobby_topmenu_coin
        name: 'loseCoin.prefab (ui_coin_01 → kakao coin)'
    },
    {
        file: 'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\prefabs\\UIEndPage.prefab',
        old: '2fd8b484-32dd-4c20-bf0f-5d545ef59898', // ui_coin_01
        new: 'd005a680-54b0-4540-a3d0-492f958d6a16', // ui_img_lobby_topmenu_coin
        name: 'UIEndPage.prefab (ui_coin_01 → kakao coin)'
    },
    {
        file: 'C:\\Users\\a\\Documents\\Parkour\\assets\\resources\\effects\\prefabs\\loseDiamond.prefab',
        old: '7a98eff5-8304-4f46-8052-a23bb8d0f6d2', // ui_crystal_01
        new: '8d28465c-d0b6-4c43-807f-4eb400dc8486', // ui_img_lobby_topmenu_dia
        name: 'loseDiamond.prefab (ui_crystal_01 → kakao dia)'
    }
];

console.log('=== Replacing old resources with kakao resources ===\n');

replacements.forEach(({ file, old, new: newUuid, name }) => {
    let content = fs.readFileSync(file, 'utf8');
    const count = (content.match(new RegExp(old, 'g')) || []).length;

    if (count > 0) {
        content = content.replace(new RegExp(old, 'g'), newUuid);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✓ ${name}`);
        console.log(`  Replaced ${count} occurrence(s)`);
    } else {
        console.log(`○ ${name}`);
        console.log(`  No occurrences found`);
    }
    console.log();
});

console.log('Done!');
