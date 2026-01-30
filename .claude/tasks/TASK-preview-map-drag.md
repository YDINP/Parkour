# TASK: Map Drag Navigation

## Overview
Enable click-and-drag to pan the map view, in addition to existing scrollbar navigation.

## Parent PRD
`PRD-LevelPreviewEnhancements.md`

## Priority
High

## Complexity
Low

---

## Requirements

### 1. Drag to Pan
- Click and hold on map canvas to start dragging
- Move mouse to pan the view
- Release to stop dragging

### 2. Cursor Feedback
- Default: `grab` cursor over map
- While dragging: `grabbing` cursor
- Return to `grab` on release

### 3. Smooth Experience
- No lag during drag
- Works on both segment preview and full level view
- Does not interfere with existing scrollbar

---

## Implementation Steps

### Step 1: Add Drag State
```javascript
let dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0
};
```

### Step 2: Mouse Event Handlers
```javascript
canvas.addEventListener('mousedown', (e) => {
    dragState.isDragging = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.scrollLeft = wrapper.scrollLeft;
    dragState.scrollTop = wrapper.scrollTop;
    canvas.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!dragState.isDragging) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    wrapper.scrollLeft = dragState.scrollLeft - dx;
    wrapper.scrollTop = dragState.scrollTop - dy;
});

document.addEventListener('mouseup', () => {
    dragState.isDragging = false;
    canvas.style.cursor = 'grab';
});
```

### Step 3: CSS for Cursor
```css
.canvas-wrapper canvas {
    cursor: grab;
}
.canvas-wrapper canvas.dragging {
    cursor: grabbing;
}
```

---

## Acceptance Criteria

- [ ] Click and drag pans the map view
- [ ] Cursor shows `grab` when hovering over map
- [ ] Cursor shows `grabbing` while dragging
- [ ] Works on segment preview canvas
- [ ] Works on full level canvas
- [ ] Does not conflict with scrollbar

---

## Files to Modify
- `tools/level-preview.html`

## Estimated Lines of Code
~50-80 lines
