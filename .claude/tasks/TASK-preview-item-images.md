# TASK: Item Image Path Update

## Overview
Update item image paths to ensure correct images are displayed.

**Note:** After investigation, kakao does NOT have separate item images. The project uses the same items across all platforms from `/assets/resources/item/`.

## Parent PRD
`PRD-LevelPreviewEnhancements.md`

## Priority
Medium

## Complexity
Low

---

## Current Situation

### Item Image Locations
All items are in `/assets/resources/item/`:
```
item/
├── item_002.png (154x148)
├── item_003.png (66x66)
├── item_004.png (66x66)
├── item_005.png (114x114)
├── item_006.png (114x114)
├── item_007.png
├── item_008.png
├── item_009.png
├── item_010.png
├── goldcoin/
│   └── gold_coin0.png (66x66)
├── slivercoin/
│   └── sliver_coin0000.png (66x66)
├── animation_item_heart/
│   └── animation_item_heart001.png (114x114)
└── item_bean/
    └── item_bean_001.png (66x66)
```

### TMX References
TMX files reference items with relative paths:
```xml
<image source="../../item/item_004.png"/>
<image source="../../item/goldcoin/gold_coin0.png"/>
```

---

## Requirements

### 1. Verify Item Loading
- Ensure all item images load correctly in preview
- Handle missing images gracefully
- Log warnings for failed loads

### 2. Item Path Mapping (if needed)
- Create mapping from TMX relative paths to actual paths
- Handle different directory depths

### 3. Future Kakao Support (Optional)
If kakao-specific items are needed later:
- Create `/assets/resources/Textures/kakao/items/` folder
- Add platform detection
- Implement path switching logic

---

## Implementation Steps

### Step 1: Verify Current Image Loading
Check that `loadImage()` function correctly resolves item paths:
```javascript
async function loadImage(src) {
    // Normalize path
    let normalizedSrc = src;

    // Handle relative paths from TMX
    if (src.startsWith('../../')) {
        normalizedSrc = src.replace('../../', '');
    }

    // ... existing load logic
}
```

### Step 2: Add Image Error Handling
```javascript
img.onerror = () => {
    console.warn('Failed to load item image:', src);
    // Return placeholder or null
    resolve(createPlaceholderImage(64, 64, '#ff00ff'));
};
```

### Step 3: Create Placeholder for Missing Images
```javascript
function createPlaceholderImage(width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(2, 2, width-4, height-4);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText('?', width/2-3, height/2+3);
    return canvas;
}
```

---

## Acceptance Criteria

- [ ] All item images load correctly
- [ ] Missing images show placeholder (not broken)
- [ ] Console logs warnings for failed loads
- [ ] No JavaScript errors from image loading

---

## Notes

The user requested "kakao images" but investigation revealed:
1. Kakao folder only contains UI/map assets, not items
2. All items are platform-agnostic
3. If true kakao item variants are needed, they must be created first

This task focuses on ensuring current items work correctly.

---

## Files to Modify
- `tools/level-preview.html`

## Estimated Lines of Code
~30-50 lines
