# TASK: Player Character with Movement & Jump Preview

## Overview
Add a player character to the level preview that can move left-right and shows jump height prediction.

## Parent PRD
`PRD-LevelPreviewEnhancements.md`

## Priority
High

## Complexity
Medium

---

## Requirements

### 1. Player Sprite
- Display player character sprite on the map canvas
- Position at a reasonable starting point (left side of visible area)
- Use a simple placeholder or extract a frame from hero spine

### 2. Movement Controls
- **Left Arrow / A**: Move player left
- **Right Arrow / D**: Move player right
- Movement speed: `80` pixels/frame acceleration, max `200` px/s
- Respect canvas boundaries

### 3. Jump Height Preview
- **Space key (hold)**: Show predicted jump arc
- Draw dotted arc showing predicted trajectory
- Arc calculated using:
  - Initial velocity: 640
  - Gravity: -1000
  - Hold force: 32 per frame (estimate max hold time)
- Show peak height marker

### 4. Basic Collision
- Player stands on platform tiles
- Cannot walk through solid tiles
- Uses platform layer collision data

---

## Implementation Steps

### Step 1: Add Player State
```javascript
let player = {
    x: 200,
    y: 400,
    vx: 0,
    vy: 0,
    onGround: false,
    sprite: null // Load from hero asset
};
```

### Step 2: Add Keyboard Listeners
```javascript
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
```

### Step 3: Physics Update Loop
```javascript
function updatePlayer(dt) {
    // Apply gravity
    player.vy -= GRAVITY * dt;
    player.vy = Math.max(player.vy, VY_MIN);

    // Apply movement
    if (keys.left) player.vx -= SPEED;
    if (keys.right) player.vx += SPEED;
    player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);

    // Update position
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Collision check
    checkPlatformCollision();
}
```

### Step 4: Jump Arc Preview
```javascript
function drawJumpPreview(ctx) {
    if (!keys.space) return;

    const points = calculateJumpArc();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
}
```

---

## Physics Constants

| Constant | Value | Source |
|----------|-------|--------|
| JUMP_INSTANT | 640 | PlayerController.ts:44 |
| JUMP_HOLD | 32 | PlayerController.ts:47 |
| GRAVITY | 1000 | FizzManager.ts:22 |
| SPEED | 80 | PlayerController.ts:35 |
| MAX_SPEED | 200 | PlayerController.ts:38 |
| VY_MIN | -250 | fizz.ts:19 |

---

## Acceptance Criteria

- [ ] Player sprite visible on map
- [ ] Arrow keys (or A/D) move player horizontally
- [ ] Player respects platform collision
- [ ] Holding space shows jump arc preview
- [ ] Arc accurately reflects physics constants
- [ ] Peak height clearly marked

---

## Files to Modify
- `tools/level-preview.html`

## Estimated Lines of Code
~200-300 lines
