/**
 * Language Selector for Cocos Creator web-mobile builds
 * HTML <-> Cocos 통신을 위한 브릿지 스크립트
 *
 * @version 1.0.0
 * @supports Cocos Creator 2.x / 3.x
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================

    const CONFIG = {
        // 지원 언어 목록
        languages: [
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'cn', name: '中文', flag: '🇨🇳' },
            { code: 'key', name: '키값', flag: '🔑' }
        ],

        // localStorage 키
        storageKey: 'game_language',

        // 기본 언어
        defaultLanguage: 'ko',

        // 선택기 위치 (top-right, top-left, bottom-right, bottom-left)
        position: 'top-right',

        // 커스텀 드롭다운 사용 여부 (false면 native select 사용)
        useCustomDropdown: false,

        // 디버그 모드
        debug: false
    };

    // ============================================
    // Utilities
    // ============================================

    function log(...args) {
        if (CONFIG.debug) {
            console.log('[LanguageSelector]', ...args);
        }
    }

    function getStoredLanguage() {
        try {
            return localStorage.getItem(CONFIG.storageKey) || CONFIG.defaultLanguage;
        } catch (e) {
            return CONFIG.defaultLanguage;
        }
    }

    function setStoredLanguage(lang) {
        try {
            localStorage.setItem(CONFIG.storageKey, lang);
        } catch (e) {
            console.warn('[LanguageSelector] localStorage not available');
        }
    }

    // ============================================
    // Native Select Implementation
    // ============================================

    function createNativeSelect() {
        const container = document.createElement('div');
        container.id = 'language-selector-container';

        // 드래그 핸들 추가
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋮⋮';
        dragHandle.title = 'Drag to move';

        const select = document.createElement('select');
        select.id = 'language-select';
        select.setAttribute('aria-label', 'Select Language');

        CONFIG.languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = `${lang.flag} ${lang.name}`;
            select.appendChild(option);
        });

        // 저장된 언어로 초기화
        select.value = getStoredLanguage();

        // 변경 이벤트
        select.addEventListener('change', function() {
            const newLang = this.value;
            log('Language changed to:', newLang);

            setStoredLanguage(newLang);
            notifyCocos(newLang);
        });

        container.appendChild(dragHandle);
        container.appendChild(select);
        return container;
    }

    // ============================================
    // Custom Dropdown Implementation
    // ============================================

    function createCustomDropdown() {
        const container = document.createElement('div');
        container.id = 'language-selector-container';

        const dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';

        const currentLang = CONFIG.languages.find(l => l.code === getStoredLanguage())
            || CONFIG.languages[0];

        // Dropdown button
        const btn = document.createElement('button');
        btn.className = 'lang-dropdown-btn';
        btn.innerHTML = `
            <span class="flag">${currentLang.flag}</span>
            <span class="name">${currentLang.name}</span>
            <span class="arrow">▼</span>
        `;
        btn.setAttribute('aria-haspopup', 'listbox');
        btn.setAttribute('aria-expanded', 'false');

        // Dropdown menu
        const menu = document.createElement('div');
        menu.className = 'lang-dropdown-menu';
        menu.setAttribute('role', 'listbox');

        CONFIG.languages.forEach(lang => {
            const item = document.createElement('div');
            item.className = 'lang-dropdown-item';
            if (lang.code === currentLang.code) {
                item.classList.add('selected');
            }
            item.setAttribute('role', 'option');
            item.setAttribute('data-lang', lang.code);
            item.innerHTML = `
                <span class="flag">${lang.flag}</span>
                <span class="name">${lang.name}</span>
                <span class="check">✓</span>
            `;

            item.addEventListener('click', function() {
                selectLanguage(lang.code, dropdown);
            });

            menu.appendChild(item);
        });

        // Toggle dropdown
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen);
        });

        // Close on outside click
        document.addEventListener('click', function() {
            dropdown.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });

        // Keyboard navigation
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });

        dropdown.appendChild(btn);
        dropdown.appendChild(menu);
        container.appendChild(dropdown);

        return container;
    }

    function selectLanguage(langCode, dropdown) {
        const lang = CONFIG.languages.find(l => l.code === langCode);
        if (!lang) return;

        log('Language selected:', langCode);

        // Update button
        const btn = dropdown.querySelector('.lang-dropdown-btn');
        btn.querySelector('.flag').textContent = lang.flag;
        btn.querySelector('.name').textContent = lang.name;

        // Update selected state
        dropdown.querySelectorAll('.lang-dropdown-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.lang === langCode);
        });

        // Close dropdown
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');

        // Save and notify
        setStoredLanguage(langCode);
        notifyCocos(langCode);
    }

    // ============================================
    // Cocos Communication
    // ============================================

    function notifyCocos(language) {
        // Method 1: postMessage (recommended)
        window.postMessage({
            type: 'LANGUAGE_CHANGE',
            language: language,
            source: 'language-selector'
        }, '*');

        // Method 2: Custom event
        const event = new CustomEvent('languageChange', {
            detail: { language: language }
        });
        window.dispatchEvent(event);

        // Method 3: Direct call if available
        if (window.cc && window.cc.game) {
            // Cocos 2.x
            if (window.LocalizationManager) {
                window.LocalizationManager.setLanguage(language);
            }
        }

        log('Notified Cocos:', language);
    }

    // Listen for Cocos messages (reverse sync)
    window.addEventListener('message', function(event) {
        if (!event.data || event.data.source === 'language-selector') return;

        if (event.data.type === 'LANGUAGE_SYNC') {
            const lang = event.data.language;
            log('Sync from Cocos:', lang);

            // Update UI
            const select = document.getElementById('language-select');
            if (select && select.value !== lang) {
                select.value = lang;
            }

            const dropdown = document.querySelector('.lang-dropdown');
            if (dropdown) {
                const langData = CONFIG.languages.find(l => l.code === lang);
                if (langData) {
                    selectLanguage(lang, dropdown);
                }
            }
        }

        if (event.data.type === 'LANGUAGE_SELECTOR_SHOW') {
            LanguageSelector.show();
        }

        if (event.data.type === 'LANGUAGE_SELECTOR_HIDE') {
            LanguageSelector.hide();
        }
    });

    // ============================================
    // Drag Functionality
    // ============================================

    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // 드래그 핸들 (전체 컨테이너)
        element.style.cursor = 'grab';

        function onMouseDown(e) {
            // select나 button 클릭은 무시
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
            if (e.target.closest('.lang-dropdown-menu')) return;

            isDragging = true;
            element.style.cursor = 'grabbing';
            element.classList.add('dragging');

            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;

            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            e.preventDefault();
        }

        function onMouseMove(e) {
            if (!isDragging) return;

            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            let newX = initialX + deltaX;
            let newY = initialY + deltaY;

            // 화면 경계 체크
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            element.style.right = 'auto';

            e.preventDefault();
        }

        function onMouseUp() {
            if (!isDragging) return;

            isDragging = false;
            element.style.cursor = 'grab';
            element.classList.remove('dragging');

            // 위치 저장
            try {
                localStorage.setItem('lang_selector_pos', JSON.stringify({
                    left: element.style.left,
                    top: element.style.top
                }));
            } catch (e) {}
        }

        // 저장된 위치 복원
        function restorePosition() {
            try {
                const pos = JSON.parse(localStorage.getItem('lang_selector_pos'));
                if (pos) {
                    element.style.left = pos.left;
                    element.style.top = pos.top;
                    element.style.right = 'auto';
                }
            } catch (e) {}
        }

        // 마우스 이벤트
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // 터치 이벤트
        element.addEventListener('touchstart', onMouseDown, { passive: false });
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);

        // 위치 복원
        restorePosition();
    }

    // ============================================
    // Public API
    // ============================================

    const LanguageSelector = {
        /**
         * 언어 선택기 초기화 및 DOM에 추가
         */
        init: function(options = {}) {
            // Merge options
            Object.assign(CONFIG, options);

            // 이미 존재하면 제거
            this.destroy();

            // 선택기 생성
            const selector = CONFIG.useCustomDropdown
                ? createCustomDropdown()
                : createNativeSelect();

            // DOM에 추가
            document.body.appendChild(selector);

            // 드래그 기능 활성화
            makeDraggable(selector);

            log('Initialized with language:', getStoredLanguage());

            // Cocos에 준비 완료 알림
            window.postMessage({
                type: 'LANGUAGE_SELECTOR_READY',
                language: getStoredLanguage()
            }, '*');

            return this;
        },

        /**
         * 언어 선택기 제거
         */
        destroy: function() {
            const existing = document.getElementById('language-selector-container');
            if (existing) {
                existing.remove();
            }
            return this;
        },

        /**
         * 언어 선택기 표시
         */
        show: function() {
            const container = document.getElementById('language-selector-container');
            if (container) {
                container.classList.remove('hidden');
                container.classList.remove('fade-out');
                container.classList.add('fade-in');
            }
            return this;
        },

        /**
         * 언어 선택기 숨김
         */
        hide: function() {
            const container = document.getElementById('language-selector-container');
            if (container) {
                container.classList.add('hidden');
                container.classList.remove('fade-in');
                container.classList.add('fade-out');
            }
            return this;
        },

        /**
         * 현재 선택된 언어 가져오기
         */
        getLanguage: function() {
            return getStoredLanguage();
        },

        /**
         * 프로그래매틱하게 언어 설정
         */
        setLanguage: function(langCode) {
            const lang = CONFIG.languages.find(l => l.code === langCode);
            if (!lang) {
                console.warn('[LanguageSelector] Unknown language:', langCode);
                return this;
            }

            setStoredLanguage(langCode);

            // Update UI
            const select = document.getElementById('language-select');
            if (select) {
                select.value = langCode;
            }

            const dropdown = document.querySelector('.lang-dropdown');
            if (dropdown) {
                selectLanguage(langCode, dropdown);
            }

            // Don't notify Cocos to avoid loop (called from Cocos)
            return this;
        },

        /**
         * 지원 언어 목록
         */
        getLanguages: function() {
            return CONFIG.languages.slice();
        },

        /**
         * 언어 추가
         */
        addLanguage: function(code, name, flag) {
            if (CONFIG.languages.find(l => l.code === code)) {
                console.warn('[LanguageSelector] Language already exists:', code);
                return this;
            }
            CONFIG.languages.push({ code, name, flag });
            return this;
        },

        /**
         * 설정 변경
         */
        configure: function(options) {
            Object.assign(CONFIG, options);
            return this;
        }
    };

    // ============================================
    // Auto-init on DOMContentLoaded
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LanguageSelector.init();
        });
    } else {
        // DOM already loaded
        LanguageSelector.init();
    }

    // Expose to global
    window.LanguageSelector = LanguageSelector;

})();
