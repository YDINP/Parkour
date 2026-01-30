const fs = require('fs');
const path = require('path');

const mapDir = 'C:/Users/a/Documents/Parkour/assets/resources/map';
const themes = ['forest', 'castle', 'cave', 'volcano', 'desert', 'cell', 'maya', 'bush', 'ice', 'dark'];

let issues = [];

themes.forEach(theme => {
    const themeDir = path.join(mapDir, theme);
    try {
        const files = fs.readdirSync(themeDir).filter(f => f.endsWith('.tmx'));

        files.forEach(file => {
            const filePath = path.join(themeDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Check tileset references
            const tilesetMatches = content.match(/source="[^"]*_block\.tsx"/g) || [];

            tilesetMatches.forEach(match => {
                const tilesetName = match.match(/bg_(\w+)_block/);
                if (tilesetName) {
                    const usedTheme = tilesetName[1];
                    if (usedTheme !== theme) {
                        issues.push({
                            file: theme + '/' + file,
                            type: 'tileset',
                            expected: theme,
                            found: usedTheme
                        });
                    }
                }
            });

            // Check action references (monsters)
            const actionMatches = content.match(/property name="action" value="([^"]+)"/g) || [];
            actionMatches.forEach(match => {
                const actionName = match.match(/value="([^"]+)"/)[1];
                // action_* monsters are shared across themes, so just log them
            });
        });
    } catch(e) {
        // Directory doesn't exist
    }
});

if (issues.length === 0) {
    console.log('✅ 모든 TMX 파일이 올바른 테마의 block 타일셋을 사용합니다.');
} else {
    console.log('❌ 테마 불일치 발견:\n');
    issues.forEach(i => {
        console.log(`파일: ${i.file}`);
        console.log(`  - 타입: ${i.type}`);
        console.log(`  - 예상: ${i.expected}`);
        console.log(`  - 실제: ${i.found}\n`);
    });
}

// Action (monster) analysis per theme
console.log('\n=== 테마별 action(몬스터) 사용 현황 ===');
const actionUsage = {};
themes.forEach(theme => {
    actionUsage[theme] = {};
    const themeDir = path.join(mapDir, theme);
    try {
        const files = fs.readdirSync(themeDir).filter(f => f.endsWith('.tmx') && !f.endsWith('.bak'));
        files.forEach(file => {
            const filePath = path.join(themeDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Find action references
            const actionMatches = content.match(/action_\d+/g) || [];
            actionMatches.forEach(action => {
                actionUsage[theme][action] = (actionUsage[theme][action] || 0) + 1;
            });
        });
    } catch(e) {}
});

Object.keys(actionUsage).forEach(theme => {
    const actions = Object.keys(actionUsage[theme]);
    if (actions.length > 0) {
        console.log(`\n${theme}:`);
        actions.sort().forEach(action => {
            console.log(`  ${action}: ${actionUsage[theme][action]}회`);
        });
    }
});

console.log('\n=== 추가 분석: 각 테마별 TMX 파일 수 ===');
themes.forEach(theme => {
    const themeDir = path.join(mapDir, theme);
    try {
        const files = fs.readdirSync(themeDir).filter(f => f.endsWith('.tmx') && !f.endsWith('.bak'));
        console.log(`${theme}: ${files.length}개 TMX 파일`);
    } catch(e) {
        console.log(`${theme}: 폴더 없음`);
    }
});
