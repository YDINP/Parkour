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
 * CDN 로드 결과 타입
 */
interface CDNLoadResult {
    success: boolean;
    source: 'cdn' | 'cache' | 'local';
    language: string;
    keyCount: number;
    version?: string;
}

/**
 * 로컬라이징 이미지 엔트리
 * Inspector에서 키별로 언어별 이미지를 설정
 */
@ccclass('LocalizedImageEntry')
class LocalizedImageEntry {
    @property({ tooltip: "이미지 키 (예: flag_icon, btn_start)" })
    key: string = "";

    @property({ type: cc.SpriteFrame, tooltip: "한국어 이미지 (기본값으로 사용됨)" })
    ko: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, tooltip: "영어 이미지 (없으면 ko 사용)" })
    en: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, tooltip: "중국어 이미지 (없으면 ko 사용)" })
    cn: cc.SpriteFrame = null;
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

    @property({ type: [LocalizedImageEntry], tooltip: "로컬라이징 이미지 목록" })
    localizedImages: LocalizedImageEntry[] = [];

    // ========== CDN Properties ==========

    @property({ tooltip: "CDN에서 로컬라이징 로드 사용" })
    useCDN: boolean = true;

    @property({ tooltip: "CDN 프로젝트 ID (예: 47FriendsDefense)" })
    cdnProjectId: string = "49FriendsRunner";

    @property({ tooltip: "CDN 베이스 URL" })
    cdnBaseUrl: string = "https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main";

    @property({ tooltip: "CDN 실패 시 로컬 폴백 사용" })
    useFallback: boolean = true;

    @property({ tooltip: "CDN 캐시 사용 (LocalStorage)" })
    useCache: boolean = true;

    @property({ tooltip: "CDN 캐시 만료 시간 (초, 0=무제한)" })
    cacheExpireSeconds: number = 3600;

    @property({ tooltip: "CDN 버전 파일 URL" })
    cdnVersionUrl: string = "https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main/version.json";

    // ========== Static Properties ==========

    private static instance: LocalizationManager | null = null;
    private static _currentLanguage: string = "ko";
    private static _data: LocalizationData | null = null;
    private static _isInitialized: boolean = false;

    // 이미지 캐싱
    private static _imageMap: Map<string, LocalizedImageEntry> = new Map();
    // 이미지 키가 설정된 노드 추적 (언어 변경 시 자동 업데이트용)
    private static _imageNodes: Map<cc.Node, string> = new Map();

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

    // ========== Static Methods - 이미지 로컬라이징 ==========

    /**
     * 키에 해당하는 로컬라이징된 이미지 가져오기
     * @param key 이미지 키
     * @returns 현재 언어에 맞는 SpriteFrame (없으면 ko 폴백, 그것도 없으면 null)
     */
    public static getImage(key: string): cc.SpriteFrame | null {
        const entry = this._imageMap.get(key);
        if (!entry) {
            if (this.instance && this.instance.debugMode) {
                console.warn('[LocalizationManager] 이미지 키를 찾을 수 없습니다:', key);
            }
            return null;
        }

        // 현재 언어의 이미지 가져오기
        const langImage = entry[this._currentLanguage as keyof LocalizedImageEntry] as cc.SpriteFrame;

        // 현재 언어 이미지가 있으면 반환
        if (langImage) {
            return langImage;
        }

        // 없으면 ko를 기본값으로 사용
        if (entry.ko) {
            if (this.instance && this.instance.debugMode) {
                console.log(`[LocalizationManager] ${key}: ${this._currentLanguage} 이미지 없음, ko 사용`);
            }
            return entry.ko;
        }

        return null;
    }

    /**
     * 노드의 Sprite에 로컬라이징 이미지 키 설정
     * 언어 변경 시 자동으로 업데이트됨
     * @param node Sprite가 있는 노드
     * @param key 이미지 키
     */
    public static setImageKey(node: cc.Node, key: string): void {
        if (!node || !node.isValid) return;

        const sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            console.warn('[LocalizationManager] 노드에 Sprite 컴포넌트가 없습니다:', node.name);
            return;
        }

        // 이미지 적용
        const spriteFrame = this.getImage(key);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }

        // 추적 등록 (언어 변경 시 자동 업데이트용)
        this._imageNodes.set(node, key);

        // 노드 파괴 시 추적 목록에서 제거
        node.once('destroy', () => {
            this._imageNodes.delete(node);
        });
    }

    /**
     * 노드의 이미지 키 제거 (추적 해제)
     * @param node 대상 노드
     */
    public static removeImageKey(node: cc.Node): void {
        this._imageNodes.delete(node);
    }

    /**
     * 모든 추적된 이미지 노드 업데이트
     */
    private static updateAllImages(): void {
        let count = 0;

        this._imageNodes.forEach((key, node) => {
            if (node && node.isValid) {
                const sprite = node.getComponent(cc.Sprite);
                if (sprite) {
                    const spriteFrame = this.getImage(key);
                    if (spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                        count++;
                    }
                }
            } else {
                // 유효하지 않은 노드는 제거
                this._imageNodes.delete(node);
            }
        });

        if (this.instance && this.instance.debugMode) {
            console.log(`[LocalizationManager] ${count}개 이미지 업데이트됨`);
        }
    }

    /**
     * 이미지 맵 초기화 (Inspector 데이터를 Map으로 캐싱)
     */
    private static initImageMap(): void {
        this._imageMap.clear();

        if (!this.instance || !this.instance.localizedImages) return;

        for (const entry of this.instance.localizedImages) {
            if (entry.key) {
                this._imageMap.set(entry.key, entry);
            }
        }

        if (this.instance.debugMode) {
            console.log(`[LocalizationManager] ${this._imageMap.size}개 이미지 키 로드됨`);
        }
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

        // 텍스트 업데이트
        this.updateAllLocalizedLabels();

        // 이미지 업데이트
        this.updateAllImages();

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

    // ========== Static Methods - CDN 로딩 ==========

    /**
     * CDN에서 로컬라이징 JSON 로드
     * @param language 언어 코드 (ko, en, cn)
     * @returns Promise<CDNLoadResult>
     */
    public static async loadFromCDN(language: string): Promise<CDNLoadResult> {
        if (!this.instance) {
            console.error('[LocalizationManager] 인스턴스가 없습니다.');
            return { success: false, source: 'local', language, keyCount: 0 };
        }

        const { cdnProjectId, cdnBaseUrl, useCache, useFallback, cacheExpireSeconds, debugMode } = this.instance;

        if (!cdnProjectId) {
            console.error('[LocalizationManager] cdnProjectId가 설정되지 않았습니다.');
            return { success: false, source: 'local', language, keyCount: 0 };
        }

        // 캐시 먼저 확인
        if (useCache) {
            const cached = this.loadFromCache(cdnProjectId, language);
            if (cached) {
                if (debugMode) {
                    console.log(`[LocalizationManager] 캐시에서 로드: ${language}`);
                }

                // 캐시 데이터 병합
                if (!this._data) {
                    this._data = { ko: {}, en: {}, cn: {} };
                }
                this._data[language] = cached.data;

                return {
                    success: true,
                    source: 'cache',
                    language,
                    keyCount: Object.keys(cached.data).length
                };
            }
        }

        // CDN에서 가져오기
        // 타임스탬프를 URL에 추가하여 브라우저/CDN 캐시 방지
        const url = `${cdnBaseUrl}/${cdnProjectId}/${language}.json?t=${Date.now()}`;

        try {
            if (debugMode) {
                console.log(`[LocalizationManager] CDN 로드 시도: ${url}`);
            }

            const response = await this.fetchWithTimeout(url, 10000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const keyCount = Object.keys(data).length;

            // 데이터 병합
            if (!this._data) {
                this._data = { ko: {}, en: {}, cn: {} };
            }
            this._data[language] = data;

            // 캐시에 저장
            if (useCache) {
                this.saveToCache(cdnProjectId, language, data, cacheExpireSeconds);
            }

            if (debugMode) {
                console.log(`[LocalizationManager] CDN 로드 성공: ${language} (${keyCount}개 키)`);
            }

            return { success: true, source: 'cdn', language, keyCount };

        } catch (error) {
            console.warn(`[LocalizationManager] CDN 로드 실패: ${error.message}`);

            // 폴백: 캐시 (만료되었더라도)
            if (useCache) {
                const expiredCache = this.loadFromCache(cdnProjectId, language, true);
                if (expiredCache) {
                    console.log(`[LocalizationManager] 만료된 캐시 사용: ${language}`);

                    if (!this._data) {
                        this._data = { ko: {}, en: {}, cn: {} };
                    }
                    this._data[language] = expiredCache.data;

                    return {
                        success: true,
                        source: 'cache',
                        language,
                        keyCount: Object.keys(expiredCache.data).length
                    };
                }
            }

            // 폴백: 로컬 파일 사용 (이미 mergeJsonFiles에서 로드됨)
            if (useFallback && this._data && this._data[language]) {
                const keyCount = Object.keys(this._data[language]).length;
                console.log(`[LocalizationManager] 로컬 폴백 사용: ${language} (${keyCount}개 키)`);

                return { success: true, source: 'local', language, keyCount };
            }

            return { success: false, source: 'local', language, keyCount: 0 };
        }
    }

    /**
     * 모든 언어를 CDN에서 로드
     * @returns Promise<CDNLoadResult[]>
     */
    public static async loadAllFromCDN(): Promise<CDNLoadResult[]> {
        const languages = ['ko', 'en', 'cn'];
        const results: CDNLoadResult[] = [];

        for (const lang of languages) {
            const result = await this.loadFromCDN(lang);
            results.push(result);
        }

        return results;
    }

    /**
     * 타임아웃이 있는 fetch
     */
    private static async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // ========== Static Methods - 캐시 관리 ==========

    /**
     * 캐시 키 생성
     */
    private static getCacheKey(projectId: string, language: string): string {
        return `loc_${projectId}_${language}`;
    }

    /**
     * 캐시에 저장
     */
    private static saveToCache(
        projectId: string,
        language: string,
        data: { [key: string]: string },
        expireSeconds: number
    ): void {
        try {
            const cacheKey = this.getCacheKey(projectId, language);
            const cacheData = {
                data,
                timestamp: Date.now(),
                expireSeconds
            };

            cc.sys.localStorage.setItem(cacheKey, JSON.stringify(cacheData));

            if (this.instance && this.instance.debugMode) {
                console.log(`[LocalizationManager] 캐시 저장: ${cacheKey}`);
            }
        } catch (error) {
            console.warn('[LocalizationManager] 캐시 저장 실패:', error.message);
        }
    }

    /**
     * 캐시에서 로드
     * @param ignoreExpiry true면 만료된 캐시도 반환
     */
    private static loadFromCache(
        projectId: string,
        language: string,
        ignoreExpiry: boolean = false
    ): { data: { [key: string]: string }, timestamp: number } | null {
        try {
            const cacheKey = this.getCacheKey(projectId, language);
            const cached = cc.sys.localStorage.getItem(cacheKey);

            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // 만료 체크 (ignoreExpiry가 false이고, expireSeconds가 0보다 클 때만)
            if (!ignoreExpiry && cacheData.expireSeconds > 0) {
                const elapsed = (Date.now() - cacheData.timestamp) / 1000;
                if (elapsed > cacheData.expireSeconds) {
                    if (this.instance && this.instance.debugMode) {
                        console.log(`[LocalizationManager] 캐시 만료: ${cacheKey} (${Math.floor(elapsed)}s)`);
                    }
                    return null;
                }
            }

            return { data: cacheData.data, timestamp: cacheData.timestamp };
        } catch (error) {
            console.warn('[LocalizationManager] 캐시 로드 실패:', error.message);
            return null;
        }
    }

    /**
     * 캐시 삭제
     */
    public static clearCache(projectId?: string, language?: string): void {
        try {
            if (projectId && language) {
                // 특정 언어만 삭제
                const cacheKey = this.getCacheKey(projectId, language);
                cc.sys.localStorage.removeItem(cacheKey);
            } else if (projectId) {
                // 프로젝트의 모든 언어 캐시 삭제
                ['ko', 'en', 'cn'].forEach(lang => {
                    const cacheKey = this.getCacheKey(projectId, lang);
                    cc.sys.localStorage.removeItem(cacheKey);
                });
            }

            if (this.instance && this.instance.debugMode) {
                console.log('[LocalizationManager] 캐시 삭제 완료');
            }
        } catch (error) {
            console.warn('[LocalizationManager] 캐시 삭제 실패:', error.message);
        }
    }

    /**
     * CDN에서 새로고침 (캐시 무시하고 다시 로드)
     */
    public static async refreshFromCDN(language?: string): Promise<CDNLoadResult[]> {
        if (!this.instance) {
            return [];
        }

        const { cdnProjectId } = this.instance;

        // 캐시 삭제
        if (language) {
            this.clearCache(cdnProjectId, language);
        } else {
            this.clearCache(cdnProjectId);
        }

        // 다시 로드
        if (language) {
            const result = await this.loadFromCDN(language);
            return [result];
        } else {
            return await this.loadAllFromCDN();
        }
    }

    // ========== Static Methods - 버전 관리 ==========

    /**
     * CDN에서 버전 정보 가져오기
     * @returns Promise<string | null> 버전 문자열 또는 null
     */
    public static async fetchVersion(): Promise<string | null> {
        if (!this.instance) {
            return null;
        }

        const { cdnVersionUrl, cdnProjectId, debugMode } = this.instance;

        if (debugMode) {
            console.log(`[LocalizationManager] 버전 체크: ${cdnVersionUrl}`);
        }

        try {
            const response = await this.fetchWithTimeout(`${cdnVersionUrl}?t=${Date.now()}`, 5000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const versionData = await response.json();
            const version = versionData[cdnProjectId] || null;

            if (debugMode) {
                console.log(`[LocalizationManager] 서버 버전: ${version}`);
            }

            return version;
        } catch (error) {
            console.warn(`[LocalizationManager] 버전 fetch 실패: ${error.message}`);
            return null;
        }
    }

    /**
     * 캐시된 버전 가져오기
     */
    public static getCachedVersion(projectId: string): string | null {
        try {
            const key = `loc_version_${projectId}`;
            return cc.sys.localStorage.getItem(key);
        } catch (error) {
            console.warn('[LocalizationManager] 캐시 버전 로드 실패:', error.message);
            return null;
        }
    }

    /**
     * 버전을 캐시에 저장
     */
    public static saveCachedVersion(projectId: string, version: string): void {
        try {
            const key = `loc_version_${projectId}`;
            cc.sys.localStorage.setItem(key, version);

            if (this.instance && this.instance.debugMode) {
                console.log(`[LocalizationManager] 버전 저장: ${version}`);
            }
        } catch (error) {
            console.warn('[LocalizationManager] 버전 저장 실패:', error.message);
        }
    }

    /**
     * 버전 체크 후 필요시 로드
     * @param language 언어 코드
     * @returns Promise<CDNLoadResult>
     */
    public static async checkVersionAndLoad(language: string): Promise<CDNLoadResult> {
        if (!this.instance) {
            return { success: false, source: 'local', language, keyCount: 0 };
        }

        const { cdnProjectId, debugMode } = this.instance;

        // 1. 서버 버전 가져오기
        const serverVersion = await this.fetchVersion();

        // 버전 fetch 실패 시 캐시 사용
        if (!serverVersion) {
            if (debugMode) {
                console.log('[LocalizationManager] 버전 체크 실패 - 캐시 사용');
            }
            return this.loadFromCacheOrFallback(language);
        }

        // 2. 로컬 캐시 버전과 비교
        const cachedVersion = this.getCachedVersion(cdnProjectId);

        if (debugMode) {
            console.log(`[LocalizationManager] 버전 비교 - 서버: ${serverVersion}, 캐시: ${cachedVersion}`);
        }

        // 3. 버전이 같으면 캐시 사용
        if (cachedVersion === serverVersion) {
            const cached = this.loadFromCache(cdnProjectId, language, true); // 만료 무시
            if (cached) {
                if (debugMode) {
                    console.log('[LocalizationManager] 버전 동일 - 캐시 사용');
                }

                if (!this._data) {
                    this._data = { ko: {}, en: {}, cn: {} };
                }
                this._data[language] = cached.data;

                return {
                    success: true,
                    source: 'cache',
                    language,
                    keyCount: Object.keys(cached.data).length,
                    version: cachedVersion
                };
            }
        }

        // 4. 버전이 다르면 CDN에서 새로 fetch
        if (debugMode) {
            console.log('[LocalizationManager] 버전 변경 - CDN에서 새로 로드');
        }
        return this.fetchFromCDNWithVersion(language, serverVersion);
    }

    /**
     * 캐시에서 로드하거나 폴백
     */
    private static loadFromCacheOrFallback(language: string): CDNLoadResult {
        if (!this.instance) {
            return { success: false, source: 'local', language, keyCount: 0 };
        }

        const { cdnProjectId, useFallback } = this.instance;

        // 캐시에서 로드 (만료 무시)
        const cached = this.loadFromCache(cdnProjectId, language, true);
        if (cached) {
            if (!this._data) {
                this._data = { ko: {}, en: {}, cn: {} };
            }
            this._data[language] = cached.data;

            return {
                success: true,
                source: 'cache',
                language,
                keyCount: Object.keys(cached.data).length
            };
        }

        // 로컬 폴백
        if (useFallback && this._data && this._data[language]) {
            const keyCount = Object.keys(this._data[language]).length;
            return { success: true, source: 'local', language, keyCount };
        }

        return { success: false, source: 'local', language, keyCount: 0 };
    }

    /**
     * CDN에서 직접 fetch (버전 저장 포함)
     */
    private static async fetchFromCDNWithVersion(language: string, serverVersion: string): Promise<CDNLoadResult> {
        if (!this.instance) {
            return { success: false, source: 'local', language, keyCount: 0 };
        }

        const { cdnProjectId, cdnBaseUrl, cacheExpireSeconds, debugMode } = this.instance;

        // 버전을 URL에 추가하여 브라우저/CDN 캐시 방지
        const url = `${cdnBaseUrl}/${cdnProjectId}/${language}.json?v=${serverVersion}`;

        try {
            if (debugMode) {
                console.log(`[LocalizationManager] CDN fetch: ${url}`);
            }

            const response = await this.fetchWithTimeout(url, 10000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const keyCount = Object.keys(data).length;

            if (!this._data) {
                this._data = { ko: {}, en: {}, cn: {} };
            }
            this._data[language] = data;

            // 캐시에 저장 (버전 포함)
            this.saveToCacheWithVersion(cdnProjectId, language, data, serverVersion, cacheExpireSeconds);

            if (debugMode) {
                console.log(`[LocalizationManager] CDN 로드 성공: ${language} (${keyCount}개 키, v${serverVersion})`);
            }

            return {
                success: true,
                source: 'cdn',
                language,
                keyCount,
                version: serverVersion
            };
        } catch (error) {
            console.warn(`[LocalizationManager] CDN 로드 실패: ${error.message}`);
            return this.loadFromCacheOrFallback(language);
        }
    }

    /**
     * 캐시에 저장 (버전 포함)
     */
    private static saveToCacheWithVersion(
        projectId: string,
        language: string,
        data: { [key: string]: string },
        version: string,
        expireSeconds: number
    ): void {
        try {
            const cacheKey = this.getCacheKey(projectId, language);
            const cacheData = {
                data,
                version,
                timestamp: Date.now(),
                expireSeconds
            };

            cc.sys.localStorage.setItem(cacheKey, JSON.stringify(cacheData));

            // 버전 저장
            this.saveCachedVersion(projectId, version);

            if (this.instance && this.instance.debugMode) {
                console.log(`[LocalizationManager] 캐시 저장 (v${version}): ${cacheKey}`);
            }
        } catch (error) {
            console.warn('[LocalizationManager] 캐시 저장 실패:', error.message);
        }
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

        // ========== [CDN 사용으로 비활성화] 로컬 JSON 파일 병합 ==========
        /*
        if (this.localizationJsonFiles && this.localizationJsonFiles.length > 0) {
            this.mergeJsonFiles();
        }
        */

        // 저장된 언어 불러오기
        const savedLanguage = cc.sys.localStorage.getItem('game_language');
        if (savedLanguage && LocalizationManager._data && LocalizationManager._data[savedLanguage]) {
            LocalizationManager._currentLanguage = savedLanguage;
        } else {
            LocalizationManager._currentLanguage = this.defaultLanguage;
        }

        // 이미지 맵 초기화
        LocalizationManager.initImageMap();

        // ========== CDN 로딩 ==========
        if (this.useCDN && this.cdnProjectId) {
            // CDN 로딩 시작 (비동기)
            this.initWithCDN();
        } else {
            // CDN 없이 로컬 파일만 사용
            this.completeInitialization();
        }

        // 씬 전환 시에도 유지
        cc.game.addPersistRootNode(this.node);

        // 씬 로드 이벤트 리스너 등록
        if (this.autoLocalizeOnSceneLoaded) {
            cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this);
        }
    }

    /**
     * CDN을 사용한 초기화 (버전 체크 포함)
     */
    private async initWithCDN(): Promise<void> {
        if (this.debugMode) {
            console.log('[LocalizationManager] CDN 초기화 시작 (버전 체크)...');
            console.log(`  - Project ID: ${this.cdnProjectId}`);
            console.log(`  - Base URL: ${this.cdnBaseUrl}`);
            console.log(`  - Version URL: ${this.cdnVersionUrl}`);
        }

        try {
            // 버전 체크 후 현재 언어 로드
            const result = await LocalizationManager.checkVersionAndLoad(LocalizationManager._currentLanguage);

            if (this.debugMode) {
                const versionInfo = result.version ? ` (v${result.version})` : '';
                console.log(`[LocalizationManager] CDN 로드 결과: ${result.source} (${result.keyCount}개 키)${versionInfo}`);
            }

            // 초기화 완료
            this.completeInitialization();

            // 나머지 언어는 백그라운드에서 로드 (버전 체크 사용)
            this.loadRemainingLanguagesWithVersion();

        } catch (error) {
            console.error('[LocalizationManager] CDN 초기화 실패:', error);

            // 폴백으로 초기화 완료
            this.completeInitialization();
        }
    }

    /**
     * 나머지 언어 백그라운드 로드
     */
    private async loadRemainingLanguages(): Promise<void> {
        const languages = ['ko', 'en', 'cn'];
        const currentLang = LocalizationManager._currentLanguage;

        for (const lang of languages) {
            if (lang !== currentLang) {
                await LocalizationManager.loadFromCDN(lang);
            }
        }

        if (this.debugMode) {
            console.log('[LocalizationManager] 모든 언어 로드 완료');
        }
    }

    /**
     * 나머지 언어 백그라운드 로드 (버전 체크 사용)
     */
    private async loadRemainingLanguagesWithVersion(): Promise<void> {
        const languages = ['ko', 'en', 'cn'];
        const currentLang = LocalizationManager._currentLanguage;

        for (const lang of languages) {
            if (lang !== currentLang) {
                await LocalizationManager.checkVersionAndLoad(lang);
            }
        }

        if (this.debugMode) {
            console.log('[LocalizationManager] 모든 언어 로드 완료 (버전 체크)');
        }
    }

    /**
     * 초기화 완료 처리
     */
    private completeInitialization(): void {
        LocalizationManager._isInitialized = true;

        if (this.debugMode) {
            console.log('[LocalizationManager] 초기화 완료');
            console.log(`  - CDN 사용: ${this.useCDN}`);
            console.log(`  - 현재 언어: ${LocalizationManager._currentLanguage}`);
            console.log(`  - 지원 언어: ${LocalizationManager.getSupportedLanguages().join(', ')}`);
            console.log(`  - 로컬라이징 이미지: ${LocalizationManager._imageMap.size}개`);

            // 각 언어별 키 개수 출력
            if (LocalizationManager._data) {
                for (const lang in LocalizationManager._data) {
                    const keyCount = Object.keys(LocalizationManager._data[lang]).length;
                    console.log(`  - ${lang}: ${keyCount}개 키`);
                }
            }
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

