// LocalizationManager.js (완전판)
var LocalizationManager = cc.Class({
  extends: cc.Component,
  
  properties: {
    localizationJsonFiles: {
      default: [],
      type: [cc.JsonAsset],
      tooltip: "다국어 JSON 파일 배열 (여러 파일 가능)"
    },
    
    defaultLanguage: {
      default: "ko",
      tooltip: "기본 언어 (ko, en, cn)"
    },
    
    autoLocalizeOnStart: {
      default: true,
      tooltip: "시작 시 자동 로컬라이징"
    },
    
    autoLocalizeOnSceneLoaded: {
      default: true,
      tooltip: "씬 로드 시 자동 로컬라이징"
    },
    
    keyPrefix: {
      default: "@",
      tooltip: "로컬라이징 키 접두사"
    },
    
    debugMode: {
      default: false,
      tooltip: "디버그 모드"
    },
    
    warnOnDuplicate: {
      default: true,
      tooltip: "중복 키 경고"
    }
  },
  
  statics: {
    instance: null,
    _currentLanguage: "ko",
    _data: null,
    _isInitialized: false,
    
    // ========== 초기화 체크 ==========
    
    ensureInitialized: function() {
      if (!this._isInitialized || !this._data) {
        console.warn('[LocalizationManager] 아직 초기화되지 않았습니다.');
        return false;
      }
      return true;
    },
    
    // ========== 텍스트 가져오기 ==========
    
    getText: function(key) {
      if (!this.ensureInitialized()) return key;      
      
      if(key.includes('@')){
        key = key.replace('@', '');
      }

      var text = this._data[this._currentLanguage][key];

      if (!text) {
        if (this.instance && this.instance.debugMode) {
          console.warn('[LocalizationManager] 키를 찾을 수 없습니다:', key);
        }
        return key;
      }
      
      text = text.replace(/\\n/g, '\n');
      text = text.replace(/\\s/g, ' ');
      return text;
    },

    getTextWithArgs: function(key) {
      if(key.includes('@')){
        key = key.replace('@', '');
      }
      
      var text = this.getText(key);
      
      for (var i = 1; i < arguments.length; i++) {
        text = text.replace('{' + (i - 1) + '}', arguments[i]);
      }
      
      return text;
    },
    
    // ========== Label 로컬라이징 ==========
    
    localizeLabel: function(label, prefix) {
      if (!label || !label.string) return false;
      if (!this.ensureInitialized()) return false;
      
      var text = label.string.trim();
      prefix = prefix || (this.instance ? this.instance.keyPrefix : "@");
      
      if (text.indexOf(prefix) === 0) {
        var key = text.substring(prefix.length);
        var localizedText = this.getText(key);
        
        label.string = localizedText;
        label._localizationKey = key;
        
        return true;
      }
      
      return false;
    },
    
    localizeNode: function(node, prefix) {
      if (!node || !node.isValid) return 0;
      if (!this.ensureInitialized()) return 0;
      
      var count = 0;
      prefix = prefix || (this.instance ? this.instance.keyPrefix : "@");
      
      var label = node.getComponent(cc.Label);
      if (label && this.localizeLabel(label, prefix)) {
        count++;
      }
      
      for (var i = 0; i < node.children.length; i++) {
        count += this.localizeNode(node.children[i], prefix);
      }
      
      return count;
    },
    
    localizeScene: function() {
      if (!this.ensureInitialized()) return 0;
      
      var canvas = cc.find("Canvas");
      if (!canvas) {
        if (this.instance && this.instance.debugMode) {
          console.warn('[LocalizationManager] Canvas를 찾을 수 없습니다.');
        }
        return 0;
      }
      
      var startTime = Date.now();
      var count = this.localizeNode(canvas);
      var elapsed = Date.now() - startTime;
      
      if (this.instance && this.instance.debugMode) {
        console.log('[LocalizationManager] ' + count + '개 Label 로컬라이징 (' + elapsed + 'ms)');
      }
      
      return count;
    },
    
    // ========== 프리펩 인스턴스화 헬퍼 ==========
    
    /**
     * 프리펩을 인스턴스화하고 자동으로 로컬라이징
     * @param {cc.Prefab} prefab - 프리펩
     * @returns {cc.Node} 생성된 노드
     */
    instantiatePrefab: function(prefab) {
      if (!prefab) {
        console.error('[LocalizationManager] prefab이 null입니다.');
        return null;
      }
      
      var node = cc.instantiate(prefab);
      
      // 생성 즉시 로컬라이징
      this.localizeNode(node);
      
      return node;
    },
    
    /**
     * 노드를 부모에 추가하고 자동으로 로컬라이징
     * @param {cc.Node} node - 추가할 노드
     * @param {cc.Node} parent - 부모 노드
     */
    addChildWithLocalization: function(node, parent) {
      if (!node || !parent) return;
      
      parent.addChild(node);
      
      // 추가 후 로컬라이징
      this.localizeNode(node);
    },
    
    // ========== 언어 변경 ==========
    
    setLanguage: function(language) {
      if (!this.ensureInitialized()) return;
      
      if (this._currentLanguage === language) return;

      if (!this._data || !this._data[language]) {
        console.error('[LocalizationManager] ' + language + ' 데이터가 없습니다.');
        return;
      }
      
      this._currentLanguage = language;
      
      this.updateAllLocalizedLabels();
      
      cc.sys.localStorage.setItem('game_language', language);
      
      console.log('[LocalizationManager] 언어 변경:', language);
    },
    
    updateAllLocalizedLabels: function() {
      var canvas = cc.find("Canvas");
      if (!canvas) return;
      
      var startTime = Date.now();
      var count = this.updateNodeLabels(canvas);
      var elapsed = Date.now() - startTime;
      
      if (this.instance && this.instance.debugMode) {
        console.log('[LocalizationManager] ' + count + '개 Label 업데이트 (' + elapsed + 'ms)');
      }
    },
    
    updateNodeLabels: function(node) {
      if (!node || !node.isValid) return 0;
      
      var count = 0;
      
      var label = node.getComponent(cc.Label);
      if (label && label._localizationKey) {
        label.string = this.getText(label._localizationKey);
        count++;
      }
      
      for (var i = 0; i < node.children.length; i++) {
        count += this.updateNodeLabels(node.children[i]);
      }
      
      return count;
    },
    
    getLanguage: function() {
      return this._currentLanguage;
    },
    
    getSupportedLanguages: function() {
      if (!this._data) return [];
      return Object.keys(this._data);
    },
    
    // ========== 동적 JSON 추가 ==========
    
    /**
     * 런타임에 JSON 데이터 추가
     * @param {object} jsonData - 추가할 JSON 데이터
     * @param {boolean} overwrite - 기존 키 덮어쓰기 여부
     * 
     * @example
     * LocalizationManager.addJsonData({
     *   ko: { "custom.key": "커스텀 텍스트" },
     *   en: { "custom.key": "Custom Text" }
     * });
     */
    addJsonData: function(jsonData, overwrite) {
      if (!jsonData) return;
      
      overwrite = overwrite !== undefined ? overwrite : false;
      
      if (!this._data) {
        this._data = {
          ko: {},
          en: {},
          cn: {}
        };
      }
      
      for (var lang in jsonData) {
        if (!this._data[lang]) {
          this._data[lang] = {};
        }
        
        var langData = jsonData[lang];
        for (var key in langData) {
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
    },
    
    /**
     * JsonAsset을 런타임에 병합
     * @param {cc.JsonAsset} jsonAsset - 추가할 JsonAsset
     * @param {boolean} overwrite - 기존 키 덮어쓰기
     */
    mergeJsonAsset: function(jsonAsset, overwrite) {
      if (!jsonAsset || !jsonAsset.json) {
        console.error('[LocalizationManager] 유효하지 않은 JsonAsset');
        return;
      }
      
      this.addJsonData(jsonAsset.json, overwrite);
    }
  },
  
  // ========== 라이프사이클 ==========
  
  onLoad: function() {
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
      var savedLanguage = cc.sys.localStorage.getItem('game_language');
      if (savedLanguage && LocalizationManager._data[savedLanguage]) {
        LocalizationManager._currentLanguage = savedLanguage;
      } else {
        LocalizationManager._currentLanguage = this.defaultLanguage;
      }
      
      LocalizationManager._isInitialized = true;
      
      if (this.debugMode) {
        console.log('[LocalizationManager] 초기화 완료');
        console.log('  - 로드된 파일:', this.localizationJsonFiles.length + '개');
        console.log('  - 현재 언어:', LocalizationManager._currentLanguage);
        console.log('  - 지원 언어:', LocalizationManager.getSupportedLanguages().join(', '));
        
        // 각 언어별 키 개수 출력
        for (var lang in LocalizationManager._data) {
          var keyCount = Object.keys(LocalizationManager._data[lang]).length;
          console.log('  - ' + lang + ': ' + keyCount + '개 키');
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
  },
  
  // ========== JSON 파일 병합 ==========
  
  /**
   * 여러 JSON 파일을 하나로 병합
   */
  mergeJsonFiles: function() {
    var self = this;
    
    // 초기화
    LocalizationManager._data = {
      ko: {},
      en: {},
      cn: {}
    };
    
    // 각 JSON 파일을 순서대로 병합
    this.localizationJsonFiles.forEach(function(jsonAsset, index) {
      if (!jsonAsset || !jsonAsset.json) {
        console.error('[LocalizationManager] JSON 파일이 유효하지 않습니다 (index: ' + index + ')');
        return;
      }
      
      var jsonData = jsonAsset.json;
      var fileName = jsonAsset.name || 'file_' + index;
      
      if (self.debugMode) {
        console.log('[LocalizationManager] 병합 중: ' + fileName);
      }
      
      // 각 언어별로 병합
      for (var lang in jsonData) {
        if (!LocalizationManager._data[lang]) {
          LocalizationManager._data[lang] = {};
        }
        
        var langData = jsonData[lang];
        var duplicateCount = 0;
        
        for (var key in langData) {
          // 중복 키 체크
          if (LocalizationManager._data[lang][key] && self.warnOnDuplicate) {
            console.warn('[LocalizationManager] 중복 키 발견: ' + key + ' (파일: ' + fileName + ', 언어: ' + lang + ')');
            duplicateCount++;
          }
          
          // 병합 (나중에 로드된 것이 우선)
          LocalizationManager._data[lang][key] = langData[key];
        }
        
        if (self.debugMode) {
          var keyCount = Object.keys(langData).length;
          console.log('  - ' + lang + ': ' + keyCount + '개 키 추가' + (duplicateCount > 0 ? ' (중복: ' + duplicateCount + '개)' : ''));
        }
      }
    });
    
    if (this.debugMode) {
      console.log('[LocalizationManager] 병합 완료');
    }
  },
  
  start: function() {
    if (this.autoLocalizeOnStart) {
      this.scheduleOnce(function() {
        LocalizationManager.localizeScene();
      }, 0);
    }
  },
  
  // ========== 씬 로드 이벤트 ==========
  
  onSceneLoaded: function() {
    if (this.debugMode) {
      console.log('[LocalizationManager] 씬 로드됨 - 자동 로컬라이징 시작');
    }
    
    // 씬이 완전히 로드된 후 로컬라이징
    this.scheduleOnce(function() {
      LocalizationManager.localizeScene();
    }, 0.1);
  },
  
  onDestroy: function() {
    // 이벤트 리스너 제거
    cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this);
    
    if (LocalizationManager.instance === this) {
      LocalizationManager.instance = null;
      LocalizationManager._isInitialized = false;
    }
  }
});

// 전역 접근
cc.pvz = cc.pvz || {};
cc.pvz.LocalizationManager = LocalizationManager;

module.exports = LocalizationManager;