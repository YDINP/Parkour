// LocalizationManager.ts (Cocos Creator 2.x)
const { ccclass, property } = cc._decorator;

/**
 * 로컬라이제이션 데이터 타입
 */
interface LocalizationData {
    [language: string]: {
        [key: string]: string;
    };
}

/**
 * 다국어 지원을 위한 LocalizationManager
 * Cocos Creator 2.x 버전
 */
@ccclass('LocalizationManager')
export class LocalizationManager extends cc.Component {

    // ========== Properties ==========

    @property({ type: [cc.JsonAsset], tooltip: "다국어 JSON 파일 배열 (여러 파일 가능)" })
    localizationJsonFiles: cc.JsonAsset[] = [];

    @property({ tooltip: "기본 언어 (ko, en, cn)" })
    defaultLanguage: string = "ko";

    @property({ tooltip: "시작 시 자동 로컬라이징" })
    autoLocalizeOnStart: boolean = true;

    @property({ tooltip: "씬 로드 시 자동 로컬라이징" })
    autoLocalizeOnSceneLoaded: boolean = true;

    @property({ tooltip: "로컬라이징 키 접두사" })
    keyPrefix: string = "@";

    @property({ tooltip: "디버그 모드" })
    debugMode: boolean = false;

    @property({ tooltip: "중복 키 경고" })
    warnOnDuplicate: boolean = true;

    // ========== Static Properties ==========

    private static instance: LocalizationManager | null = null;
    private static _currentLanguage: string = "ko";
    private static _data: LocalizationData | null = null;
    private static _isInitialized: boolean = false;

    // ========== Static Methods - 초기화 체크 ==========

    /**
     * 초기화 여부 확인
     */
    public static ensureInitialized(): boolean {
        if (!this._isInitialized || !this._data) {
            console.warn('[LocalizationManager] 아직 초기화되지 않았습니다.');
            return false;
        }
        return true;
    }

    // ========== Static Methods - 텍스트 가져오기 ==========

    /**
     * 키에 해당하는 로컬라이징된 텍스트 가져오기
     * @param key 로컬라이징 키
     * @returns 로컬라이징된 텍스트
     */
    public static getText(key: string): string {
        if (!this.ensureInitialized()) return key;

        if (key.includes('@')) {
            key = key.replace('@', '');
        }

        let text = this._data![this._currentLanguage][key];

        if (!text) {
            if (this.instance && this.instance.debugMode) {
                console.warn('[LocalizationManager] 키를 찾을 수 없습니다:', key);
            }
            return key;
        }

        text = text.replace(/\\n/g, '\n');
        text = text.replace(/\\s/g, ' ');
        return text;
    }

    /**
     * 인자를 포함한 텍스트 가져오기
     * @param key 로컬라이징 키
     * @param args 치환할 인자들
     * @returns 포맷팅된 텍스트
     */
    public static getTextWithArgs(key: string, ...args: any[]): string {
        if (key.includes('@')) {
            key = key.replace('@', '');
        }

        let text = this.getText(key);
        let tmp = [...args];

        for (let i = 0; i < tmp.length; i++) {
            // 정규식을 사용하여 모든 {i} 패턴을 치환
            const regex = new RegExp(`\\{${i}\\}`, 'g');
            text = text.replace(regex, String(tmp[i]));
        }

        return text;
    }

    // ========== Static Methods - Label 로컬라이징 ==========

    /**
     * Label 컴포넌트 로컬라이징
     * @param label Label 컴포넌트
     * @param prefix 키 접두사
     * @returns 로컬라이징 성공 여부
     */
    public static localizeLabel(label: cc.Label, prefix?: string): boolean {
        if (!label || !label.string) return false;
        if (!this.ensureInitialized()) return false;

        const text = label.string.trim();
        const keyPrefix = prefix || (this.instance ? this.instance.keyPrefix : "@");

        if (text.indexOf(keyPrefix) === 0) {
            const key = text.substring(keyPrefix.length);
            const localizedText = this.getText(key);

            label.string = localizedText;
            (label as any)._localizationKey = key;

            return true;
        }

        return false;
    }

    /**
     * 노드와 모든 자식 노드의 Label 로컬라이징
     * @param node 대상 노드
     * @param prefix 키 접두사
     * @returns 로컬라이징된 Label 개수
     */
    public static localizeNode(node: cc.Node, prefix?: string): number {
        if (!node || !node.isValid) return 0;
        if (!this.ensureInitialized()) return 0;

        let count = 0;
        const keyPrefix = prefix || (this.instance ? this.instance.keyPrefix : "@");

        const label = node.getComponent(cc.Label);
        if (label && this.localizeLabel(label, keyPrefix)) {
            count++;
        }

        for (let i = 0; i < node.children.length; i++) {
            count += this.localizeNode(node.children[i], keyPrefix);
        }

        return count;
    }

    /**
     * 현재 씬의 모든 Label 로컬라이징
     * @returns 로컬라이징된 Label 개수
     */
    public static localizeScene(): number {
        if (!this.ensureInitialized()) return 0;

        const canvas = cc.find("Canvas");
        if (!canvas) {
            if (this.instance && this.instance.debugMode) {
                console.warn('[LocalizationManager] Canvas를 찾을 수 없습니다.');
            }
            return 0;
        }

        const startTime = Date.now();
        const count = this.localizeNode(canvas);
        const elapsed = Date.now() - startTime;

        if (this.instance && this.instance.debugMode) {
            console.log(`[LocalizationManager] ${count}개 Label 로컬라이징 (${elapsed}ms)`);
        }

        return count;
    }

    // ========== Static Methods - 프리펩 인스턴스화 헬퍼 ==========

    /**
     * 프리펩을 인스턴스화하고 자동으로 로컬라이징
     * @param prefab 프리펩
     * @returns 생성된 노드
     */
    public static instantiatePrefab(prefab: cc.Node | cc.Prefab): cc.Node | null {
        if (prefab instanceof cc.Node) {
            this.localizeNode(prefab);
            return prefab;
        }
        if (!prefab) {
            console.error('[LocalizationManager] prefab이 null입니다.');
            return null;
        }

        const node = cc.instantiate(prefab);

        // 생성 즉시 로컬라이징
        this.localizeNode(node);

        return node;
    }

    /**
     * 노드를 부모에 추가하고 자동으로 로컬라이징
     * @param node 추가할 노드
     * @param parent 부모 노드
     */
    public static addChildWithLocalization(node: cc.Node, parent: cc.Node): void {
        if (!node || !parent) return;

        parent.addChild(node);

        // 추가 후 로컬라이징
        this.localizeNode(node);
    }

    // ========== Static Methods - 언어 변경 ==========

    /**
     * 언어 변경
     * @param language 변경할 언어 코드
     */
    public static setLanguage(language: string): void {
        if (!this.ensureInitialized()) return;

        if (this._currentLanguage === language) return;

        if (!this._data || !this._data[language]) {
            console.error(`[LocalizationManager] ${language} 데이터가 없습니다.`);
            return;
        }

        this._currentLanguage = language;

        this.updateAllLocalizedLabels();

        cc.sys.localStorage.setItem('game_language', language);

        console.log('[LocalizationManager] 언어 변경:', language);
    }

    /**
     * 모든 로컬라이징된 Label 업데이트
     */
    private static updateAllLocalizedLabels(): void {
        const canvas = cc.find("Canvas");
        if (!canvas) return;

        const startTime = Date.now();
        const count = this.updateNodeLabels(canvas);
        const elapsed = Date.now() - startTime;

        if (this.instance && this.instance.debugMode) {
            console.log(`[LocalizationManager] ${count}개 Label 업데이트 (${elapsed}ms)`);
        }
    }

    /**
     * 노드의 Label 업데이트
     */
    private static updateNodeLabels(node: cc.Node): number {
        if (!node || !node.isValid) return 0;

        let count = 0;

        const label = node.getComponent(cc.Label);
        if (label && (label as any)._localizationKey) {
            label.string = this.getText((label as any)._localizationKey);
            count++;
        }

        for (let i = 0; i < node.children.length; i++) {
            count += this.updateNodeLabels(node.children[i]);
        }

        return count;
    }

    /**
     * 현재 언어 가져오기
     */
    public static getLanguage(): string {
        return this._currentLanguage;
    }

    /**
     * 지원하는 언어 목록 가져오기
     */
    public static getSupportedLanguages(): string[] {
        if (!this._data) return [];
        return Object.keys(this._data);
    }

    // ========== Static Methods - 동적 JSON 추가 ==========

    /**
     * 런타임에 JSON 데이터 추가
     * @param jsonData 추가할 JSON 데이터
     * @param overwrite 기존 키 덮어쓰기 여부
     * 
     * @example
     * LocalizationManager.addJsonData({
     *   ko: { "custom.key": "커스텀 텍스트" },
     *   en: { "custom.key": "Custom Text" }
     * });
     */
    public static addJsonData(jsonData: LocalizationData, overwrite: boolean = false): void {
        if (!jsonData) return;

        if (!this._data) {
            this._data = {
                ko: {},
                en: {},
                cn: {}
            };
        }

        for (const lang in jsonData) {
            if (!this._data[lang]) {
                this._data[lang] = {};
            }

            const langData = jsonData[lang];
            for (const key in langData) {
                // 덮어쓰기 모드가 아니고 키가 이미 존재하면 스킵
                if (!overwrite && this._data[lang][key]) {
                    if (this.instance && this.instance.debugMode) {
                        console.warn('[LocalizationManager] 키가 이미 존재합니다:', key);
                    }
                    continue;
                }

                this._data[lang][key] = langData[key];
            }
        }

        if (this.instance && this.instance.debugMode) {
            console.log('[LocalizationManager] JSON 데이터 추가 완료');
        }
    }

    /**
     * JsonAsset을 런타임에 병합
     * @param jsonAsset 추가할 JsonAsset
     * @param overwrite 기존 키 덮어쓰기
     */
    public static mergeJsonAsset(jsonAsset: cc.JsonAsset, overwrite: boolean = false): void {
        if (!jsonAsset || !jsonAsset.json) {
            console.error('[LocalizationManager] 유효하지 않은 JsonAsset');
            return;
        }

        this.addJsonData(jsonAsset.json as LocalizationData, overwrite);
    }

    // ========== Instance Methods - 라이프사이클 ==========

    onLoad(): void {
        if (LocalizationManager.instance) {
            if (this.debugMode) {
                console.warn('[LocalizationManager] 이미 인스턴스가 존재합니다.');
            }
            this.node.destroy();
            return;
        }

        LocalizationManager.instance = this;

        // ========== 여러 JSON 파일 병합 ==========
        if (this.localizationJsonFiles && this.localizationJsonFiles.length > 0) {
            this.mergeJsonFiles();

            // 저장된 언어 불러오기
            const savedLanguage = cc.sys.localStorage.getItem('game_language');
            if (savedLanguage && LocalizationManager._data![savedLanguage]) {
                LocalizationManager._currentLanguage = savedLanguage;
            } else {
                LocalizationManager._currentLanguage = this.defaultLanguage;
            }

            LocalizationManager._isInitialized = true;

            if (this.debugMode) {
                console.log('[LocalizationManager] 초기화 완료');
                console.log(`  - 로드된 파일: ${this.localizationJsonFiles.length}개`);
                console.log(`  - 현재 언어: ${LocalizationManager._currentLanguage}`);
                console.log(`  - 지원 언어: ${LocalizationManager.getSupportedLanguages().join(', ')}`);

                // 각 언어별 키 개수 출력
                for (const lang in LocalizationManager._data) {
                    const keyCount = Object.keys(LocalizationManager._data[lang]).length;
                    console.log(`  - ${lang}: ${keyCount}개 키`);
                }
            }
        } else {
            console.error('[LocalizationManager] localizationJsonFiles가 비어있습니다!');
        }

        // 씬 전환 시에도 유지
        cc.game.addPersistRootNode(this.node);

        // 씬 로드 이벤트 리스너 등록
        if (this.autoLocalizeOnSceneLoaded) {
            cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this);
        }
    }

    // ========== JSON 파일 병합 ==========

    /**
     * 여러 JSON 파일을 하나로 병합
     */
    private mergeJsonFiles(): void {
        // 초기화
        LocalizationManager._data = {
            ko: {},
            en: {},
            cn: {}
        };

        // 각 JSON 파일을 순서대로 병합
        this.localizationJsonFiles.forEach((jsonAsset, index) => {
            if (!jsonAsset || !jsonAsset.json) {
                console.error(`[LocalizationManager] JSON 파일이 유효하지 않습니다 (index: ${index})`);
                return;
            }

            const jsonData = jsonAsset.json as LocalizationData;
            const fileName = jsonAsset.name || `file_${index}`;

            if (this.debugMode) {
                console.log(`[LocalizationManager] 병합 중: ${fileName}`);
            }

            // 각 언어별로 병합
            for (const lang in jsonData) {
                if (!LocalizationManager._data![lang]) {
                    LocalizationManager._data![lang] = {};
                }

                const langData = jsonData[lang];
                let duplicateCount = 0;

                for (const key in langData) {
                    // 중복 키 체크
                    if (LocalizationManager._data![lang][key] && this.warnOnDuplicate) {
                        console.warn(`[LocalizationManager] 중복 키 발견: ${key} (파일: ${fileName}, 언어: ${lang})`);
                        duplicateCount++;
                    }

                    // 병합 (나중에 로드된 것이 우선)
                    LocalizationManager._data![lang][key] = langData[key];
                }

                if (this.debugMode) {
                    const keyCount = Object.keys(langData).length;
                    console.log(`  - ${lang}: ${keyCount}개 키 추가${duplicateCount > 0 ? ` (중복: ${duplicateCount}개)` : ''}`);
                }
            }
        });

        if (this.debugMode) {
            console.log('[LocalizationManager] 병합 완료');
        }
    }

    start(): void {
        if (this.autoLocalizeOnStart) {
            this.scheduleOnce(() => {
                LocalizationManager.localizeScene();
            }, 0);
        }
    }

    // ========== 씬 로드 이벤트 ==========

    private onSceneLoaded(): void {
        if (this.debugMode) {
            console.log('[LocalizationManager] 씬 로드됨 - 자동 로컬라이징 시작');
        }

        // 씬이 완전히 로드된 후 로컬라이징
        this.scheduleOnce(() => {
            LocalizationManager.localizeScene();
        }, 0.1);
    }

    onDestroy(): void {
        // 이벤트 리스너 제거
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this);

        if (LocalizationManager.instance === this) {
            LocalizationManager.instance = null;
            LocalizationManager._isInitialized = false;
        }
    }
}

