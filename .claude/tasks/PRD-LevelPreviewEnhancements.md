# PRD: Level Preview Tool Enhancements

## Overview
Enhance the `tools/level-preview.html` tool to include interactive gameplay features, improved map navigation, and proper asset/localization integration.

## Goals
1. Add player character that can move left-right and show jump height prediction
2. Enable map dragging (in addition to scrollbar navigation)
3. Add simple playable mode based on project physics
4. Replace item images with kakao versions
5. Display Korean localized map names

---

## Feature Breakdown

### Feature 1: Player Character with Movement & Jump Preview
**Priority**: High
**Complexity**: Medium

**Requirements**:
- Display player character sprite on the map
- Left/Right arrow keys move the character horizontally
- Show jump height prediction arc/line when pressing space (before actual jump)
- Use project's actual physics constants for accurate prediction

**Acceptance Criteria**:
- [ ] Player sprite visible on map
- [ ] Arrow keys move player left/right
- [ ] Jump preview shows predicted arc height
- [ ] Movement respects platform collision (basic)

---

### Feature 2: Map Drag Navigation
**Priority**: High
**Complexity**: Low

**Requirements**:
- Click and drag on the map canvas to pan the view
- Works alongside existing scrollbar navigation
- Smooth drag experience with proper cursor feedback

**Acceptance Criteria**:
- [ ] Mouse drag pans the map view
- [ ] Cursor changes to grab/grabbing during drag
- [ ] Works on both single segment and full level views

---

### Feature 3: Simple Playable Mode
**Priority**: Medium
**Complexity**: High

**Requirements**:
- "Play" button to enter play mode
- Character moves right automatically (like actual game)
- Player can jump with spacebar
- Collision with platforms (stand on them)
- Collision with obstacles (game over)
- Item collection (visual feedback)
- Simple score display

**Acceptance Criteria**:
- [ ] Play/Stop button toggles play mode
- [ ] Auto-scroll right during play
- [ ] Jump physics match project constants
- [ ] Platform collision works
- [ ] Obstacle collision ends play
- [ ] Items can be collected

---

### Feature 4: Kakao Item Images
**Priority**: Medium
**Complexity**: Low

**Requirements**:
- Replace current item images with kakao versions
- Map old item paths to new kakao item paths
- Ensure all collectible items use correct kakao sprites

**Acceptance Criteria**:
- [ ] All items display kakao sprites
- [ ] No broken/missing item images

---

### Feature 5: Korean Localized Map Names
**Priority**: Low
**Complexity**: Low

**Requirements**:
- Load localization JSON file
- Display Korean level names instead of internal IDs
- Fall back to English/ID if Korean not available

**Acceptance Criteria**:
- [ ] Level selector shows Korean names
- [ ] Level info panel shows Korean names
- [ ] Segment labels show Korean names where applicable

---

## Technical Notes

### Player Physics (from project)
**Jump:**
- `jumpInstantForce`: 640 (initial upward velocity)
- `jumpHoldForce`: 32 (additional force per frame while holding)
- `jumpMax`: 2 (double jump enabled)

**Movement:**
- `speed`: 80 (acceleration per frame)
- `maxSpeed`: 200 (horizontal velocity cap)

**Gravity & Constraints:**
- `gravity`: -1000 (units/s² downward)
- `vy_min`: -250 (terminal velocity)
- `vy_max`: 30 (max upward velocity)

### Item Images
**Note:** Kakao does NOT have separate item images. All items are in `/assets/resources/item/`:
- `item_002.png` through `item_010.png`
- `goldcoin/gold_coin0.png`
- `animation_item_heart/animation_item_heart001.png`
- `item_bean/item_bean_001.png`

Items are platform-agnostic. If kakao-specific items are needed, they must be created.

### Localization
**File:** `assets/resources/Localize/localization.json`

**Key Format:** `map.name.{levelNumber}`

**Korean Level Names:**
| Level | Korean | Theme |
|-------|--------|-------|
| 0 | 초급 레벨 | Beginner |
| 1-4 | 숲 1-4 | Forest |
| 5-7 | 요새 1-3 | Castle |
| 8-9 | 숲 5-6 | Forest |
| 10-11 | 요새 4-5 | Castle |
| 12-13 | 숲 7-8 | Forest |
| 14-15 | 동굴 1-2 | Cave |
| 16 | 화산 1 | Volcano |
| 17 | 마야 1 | Maya |
| 18 | 사막 1 | Desert |
| 19-20 | 빙설 1-2 | Ice |
| 21-23 | 감옥 1-3 | Prison |
| 24 | 암흑 1 | Dark |
| 26-27 | 덤불 1-2 | Bush |

---

## Task Files

| Task File | Feature | Priority | Complexity | Est. LOC |
|-----------|---------|----------|------------|----------|
| `TASK-preview-player-movement.md` | Player + Jump Preview | High | Medium | 200-300 |
| `TASK-preview-map-drag.md` | Map Drag Navigation | High | Low | 50-80 |
| `TASK-preview-playable-mode.md` | Simple Play Mode | Medium | High | 400-600 |
| `TASK-preview-korean-names.md` | Korean Level Names | Low | Low | 50-80 |
| `TASK-preview-item-images.md` | Item Image Handling | Medium | Low | 30-50 |

**Total Estimated Lines:** 730-1110

---

## Implementation Order (Recommended)

1. **TASK-preview-map-drag.md** - Quick win, improves UX immediately
2. **TASK-preview-korean-names.md** - Simple, improves Korean user experience
3. **TASK-preview-item-images.md** - Ensures items display correctly
4. **TASK-preview-player-movement.md** - Core interactive feature
5. **TASK-preview-playable-mode.md** - Most complex, depends on player movement

---

## Status
- [x] PRD Created
- [x] Tasks Defined
- [ ] Implementation Started
- [ ] Testing Complete
