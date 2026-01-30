# TASK: Korean Localized Map Names

## Overview
Load localization data and display Korean level names instead of internal IDs.

## Parent PRD
`PRD-LevelPreviewEnhancements.md`

## Priority
Low

## Complexity
Low

---

## Requirements

### 1. Load Localization Data
- Load `assets/resources/Localize/localization.json`
- Parse Korean (ko) translations
- Store in accessible map structure

### 2. Level Selector
- Display Korean names in dropdown
- Format: "Level X: 숲 1" instead of "Level 1: forest_01"

### 3. Level Info Panel
- Show Korean name in level title
- Keep theme badge in English for clarity

### 4. Segment Labels (Optional)
- If segment has Korean name, display it
- Otherwise fall back to abbreviation

---

## Implementation Steps

### Step 1: Load Localization JSON
```javascript
let localization = {};

async function loadLocalization() {
    try {
        const resp = await fetch('../assets/resources/Localize/localization.json');
        const data = await resp.json();
        localization = data;
    } catch (e) {
        console.warn('Failed to load localization:', e);
    }
}
```

### Step 2: Get Korean Text Helper
```javascript
function getKoreanText(key) {
    if (!localization.ko) return null;
    return localization.ko[key] || null;
}

function getLevelName(levelId) {
    const koreanName = getKoreanText(`map.name.${levelId}`);
    return koreanName || `Level ${levelId}`;
}
```

### Step 3: Update Level Selector
```javascript
function populateLevelSelect() {
    const select = document.getElementById('levelSelect');
    select.innerHTML = '';

    levelData.forEach(level => {
        const opt = document.createElement('option');
        opt.value = level.level;
        const koreanName = getLevelName(level.level);
        const theme = level.segs.split('+')[0];
        opt.textContent = `Level ${level.level}: ${koreanName} (${theme})`;
        select.appendChild(opt);
    });
}
```

### Step 4: Update Level Info Display
```javascript
function displayLevelInfo(level, theme, segments) {
    const koreanName = getLevelName(level.level);

    document.getElementById('levelTitle').innerHTML = `
        Level ${level.level}: ${koreanName}
        <span class="theme-badge theme-${theme}">${theme.toUpperCase()}</span>
    `;
    // ... rest of display
}
```

---

## Localization Key Mapping

| Level ID | Key | Korean |
|----------|-----|--------|
| 0 | map.name.0 | 초급 레벨 |
| 1 | map.name.1 | 숲 1 |
| 2 | map.name.2 | 숲 2 |
| 3 | map.name.3 | 숲 3 |
| 4 | map.name.4 | 숲 4 |
| 5 | map.name.5 | 요새 1 |
| ... | ... | ... |

---

## Acceptance Criteria

- [ ] Localization JSON loaded successfully
- [ ] Level dropdown shows Korean names
- [ ] Level info panel shows Korean name
- [ ] Fallback to English/ID if Korean unavailable
- [ ] No errors when localization fails to load

---

## Files to Modify
- `tools/level-preview.html`

## Estimated Lines of Code
~50-80 lines
