/**
 * Post-Build Inject Script for FriendsRunner (Cocos Creator 2.x)
 * 빌드 후 index.html에 언어 선택기 자동 주입 + 타이틀 수정
 *
 * 사용법:
 *   node post-build-inject.js <빌드경로>
 *   node post-build-inject.js "./build/web-mobile"
 *
 * Cocos Creator 빌드 후 자동 실행 설정:
 *   프로젝트 설정 > 빌드 > 빌드 후 스크립트에 등록
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Game Version Configuration
// ============================================

const GAME_VERSION = {
    projectName: "49FriendsRunner",
    version: "0.0.1"
};

// GameVersion.ts 파일에서 버전 정보 읽기
function loadGameVersion() {
    const possiblePaths = [
        path.join(__dirname, 'assets/Game/Script/common/GameVersion.ts'),
        path.join(__dirname, 'assets/script/config/GameVersion.ts'),
        path.join(__dirname, 'assets/scripts/config/GameVersion.ts')
    ];

    for (const versionPath of possiblePaths) {
        if (fs.existsSync(versionPath)) {
            try {
                const content = fs.readFileSync(versionPath, 'utf8');
                const versionMatch = content.match(/version:\s*["']([^"']+)["']/);
                const projectMatch = content.match(/projectName:\s*["']([^"']+)["']/);

                if (versionMatch) GAME_VERSION.version = versionMatch[1];
                if (projectMatch) GAME_VERSION.projectName = projectMatch[1];

                console.log('[Info] Loaded GameVersion:', GAME_VERSION);
                return;
            } catch (e) {
                console.warn('[Warn] Failed to parse GameVersion.ts:', e.message);
            }
        }
    }
    console.log('[Info] Using default GameVersion:', GAME_VERSION);
}

// ============================================
// Configuration
// ============================================

// CSS 주입 위치 (여러 패턴 시도)
const CSS_INJECT_PATTERNS = [
    '<link rel="icon"',
    '<link rel="stylesheet"',
    '</head>'
];

// JS 주입 위치 (Cocos 2.x 빌드 패턴)
const JS_INJECT_PATTERNS = [
    /(<script src="main\.[^"]+\.js"[^>]*><\/script>\s*\n)/,                // Cocos 2.x main.js
    /(<script src="[^"]*cocos2d-js[^"]*\.js"[^>]*><\/script>\s*\n)/,       // Cocos 2.x engine
    /(<script src="[^"]*application\.[^"]+\.js"[^>]*><\/script>\s*\n)/,    // Cocos 3.x (fallback)
    /<\/body>/                                                               // Fallback
];

// HTML 브릿지 코드 (Cocos 2.x 호환)
const HTML_BRIDGE_CODE = `
<!-- Language Selector - Auto Injected -->
<script src="__JS_FILE__"></script>
<script type="text/javascript">
// HTML -> Cocos 언어 변경 이벤트 리스너
// LocalizationManager.ts에서 이미 수신 처리하므로 추가 브릿지 불필요
// 디버그용 로그만 추가
window.addEventListener('message', function(event) {
    if (!event.data) return;
    if (event.data.type === 'LANGUAGE_CHANGE' && event.data.source === 'language-selector') {
        console.log('[Localization] HTML -> Cocos: Language changed to:', event.data.language);
    }
});
</script>

`;

// ============================================
// Main
// ============================================

function main() {
    const buildPath = process.argv[2];

    if (!buildPath) {
        console.log('Usage: node post-build-inject.js <build-path>');
        console.log('Example: node post-build-inject.js "./build/web-mobile"');
        process.exit(1);
    }

    // GameVersion.ts에서 버전 정보 로드
    loadGameVersion();

    const indexPath = path.join(buildPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.error('[Error] index.html not found:', indexPath);
        process.exit(1);
    }

    // 빌드된 파일에서 해시된 파일명 찾기
    const files = fs.readdirSync(buildPath);
    const cssFile = files.find(f => /^language-selector(\.[a-f0-9]+)?\.css$/.test(f));
    const jsFile = files.find(f => /^language-selector(\.[a-f0-9]+)?\.js$/.test(f));

    if (!cssFile) {
        console.error('[Error] language-selector.css not found in build folder');
        console.log('Available files:', files.filter(f => f.includes('language') || f.endsWith('.css')).join(', '));
        process.exit(1);
    }

    if (!jsFile) {
        console.error('[Error] language-selector.js not found in build folder');
        console.log('Available files:', files.filter(f => f.includes('language') || f.endsWith('.js')).join(', '));
        process.exit(1);
    }

    console.log('[Info] Found CSS:', cssFile);
    console.log('[Info] Found JS:', jsFile);

    let html = fs.readFileSync(indexPath, 'utf8');

    // 이미 적용되어 있는지 확인
    if (html.includes('language-selector')) {
        console.log('[Skip] Language selector already injected.');
        process.exit(0);
    }

    // CSS 주입
    let cssInjected = false;
    for (const pattern of CSS_INJECT_PATTERNS) {
        if (html.includes(pattern)) {
            html = html.replace(
                pattern,
                `<link rel="stylesheet" type="text/css" href="${cssFile}"/>\n  ${pattern}`
            );
            console.log('[OK] CSS injected before:', pattern.substring(0, 30) + '...');
            cssInjected = true;
            break;
        }
    }
    if (!cssInjected) {
        console.warn('[Warn] Could not find injection point for CSS');
    }

    // JS 주입
    const jsCode = HTML_BRIDGE_CODE.replace('__JS_FILE__', jsFile);
    let jsInjected = false;

    for (const pattern of JS_INJECT_PATTERNS) {
        if (pattern instanceof RegExp) {
            if (pattern.test(html)) {
                html = html.replace(pattern, '$1' + jsCode);
                console.log('[OK] JS injected after regex pattern');
                jsInjected = true;
                break;
            }
        } else if (typeof pattern === 'string') {
            if (html.includes(pattern)) {
                html = html.replace(pattern, jsCode + pattern);
                console.log('[OK] JS injected before:', pattern);
                jsInjected = true;
                break;
            }
        }
    }

    if (!jsInjected) {
        console.warn('[Warn] Could not find injection point for JS');
    }

    // 타이틀 수정
    const newTitle = `${GAME_VERSION.projectName} v${GAME_VERSION.version}`;
    const titleRegex = /<title>[^<]*<\/title>/i;
    if (titleRegex.test(html)) {
        html = html.replace(titleRegex, `<title>${newTitle}</title>`);
        console.log('[OK] Title updated to:', newTitle);
    } else {
        console.warn('[Warn] Could not find <title> tag');
    }

    // 저장
    fs.writeFileSync(indexPath, html, 'utf8');

    console.log('[Success] Post-build processing complete!');
    console.log('[Info] Build path:', buildPath);
    console.log('[Info] Game:', GAME_VERSION.projectName, 'v' + GAME_VERSION.version);
}

// ============================================
// Cocos Creator Build Hook (2.x)
// ============================================

/**
 * Cocos Creator 2.x 빌드 후 훅
 * packages/localization-plugin/main.js 에서 호출
 */
function onBuildFinish(options, callback) {
    // web-mobile 플랫폼만 처리
    if (options.platform !== 'web-mobile' && options.platform !== 'web-desktop') {
        callback && callback();
        return;
    }

    const buildPath = options.dest;
    console.log('[Localization] Post-build processing:', buildPath);

    try {
        process.argv[2] = buildPath;
        main();
    } catch (e) {
        console.error('[Localization] Post-build error:', e);
    }

    callback && callback();
}

// Export for Cocos Creator plugin
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inject: main,
        onBuildFinish: onBuildFinish
    };
}

// CLI 실행
if (require.main === module) {
    main();
}
