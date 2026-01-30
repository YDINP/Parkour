# TASK: Simple Playable Mode

## Overview
Add a "Play" mode that allows basic gameplay simulation - auto-scroll right, jump, platform collision, and item collection.

## Parent PRD
`PRD-LevelPreviewEnhancements.md`

## Priority
Medium

## Complexity
High

---

## Requirements

### 1. Play/Stop Toggle
- "Play" button to enter play mode
- "Stop" button to exit and return to preview mode
- Clear visual indication of current mode

### 2. Auto-Scroll
- Camera automatically moves right during play
- Speed similar to game (~200-300 px/s)
- Player stays centered horizontally

### 3. Jump Mechanics
- Spacebar to jump
- Double jump enabled (max 2 jumps)
- Uses project physics constants:
  - Jump force: 640
  - Hold force: 32/frame
  - Gravity: -1000/s²

### 4. Platform Collision
- Player stands on platform layer tiles
- One-way platforms (can jump through from below)
- Solid ground collision

### 5. Obstacle Collision
- Hitting obstacle ends play mode
- Show "Game Over" message
- Display distance traveled

### 6. Item Collection
- Collecting items shows visual feedback
- Simple score/count display
- Items from object_item layer

### 7. UI During Play
- Score display
- Distance display
- Play/Stop button

---

## Implementation Steps

### Step 1: Play Mode State
```javascript
let playMode = {
    active: false,
    score: 0,
    distance: 0,
    cameraX: 0,
    startTime: 0
};
```

### Step 2: Game Loop
```javascript
function gameLoop(timestamp) {
    if (!playMode.active) return;

    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Auto-scroll
    playMode.cameraX += SCROLL_SPEED * dt;

    // Update player physics
    updatePlayerPhysics(dt);

    // Check collisions
    checkPlatformCollision();
    checkObstacleCollision();
    checkItemCollision();

    // Render
    renderPlayMode();

    requestAnimationFrame(gameLoop);
}
```

### Step 3: Jump Implementation
```javascript
function jump() {
    if (player.jumpCount >= JUMP_MAX) return;
    player.vy = JUMP_INSTANT;
    player.jumpCount++;
    player.onGround = false;
}

function updateJump() {
    if (keys.space && player.vy > 0) {
        player.vy += JUMP_HOLD;
    }
}
```

### Step 4: Collision Detection
```javascript
function checkPlatformCollision() {
    // Get tiles under player
    const tiles = getTilesAtPosition(player.x, player.y);

    // Check platform layer
    for (const tile of tiles) {
        if (isPlatformTile(tile)) {
            // Land on platform
            player.y = tile.top;
            player.vy = 0;
            player.onGround = true;
            player.jumpCount = 0;
        }
    }
}
```

### Step 5: Play Mode UI
```html
<div id="playModeUI" style="display:none;">
    <div class="score">Score: <span id="playScore">0</span></div>
    <div class="distance">Distance: <span id="playDistance">0</span>m</div>
    <button id="stopBtn" onclick="stopPlay()">Stop</button>
</div>
```

---

## Physics Constants

| Constant | Value | Usage |
|----------|-------|-------|
| SCROLL_SPEED | 250 | Auto-scroll speed |
| JUMP_INSTANT | 640 | Initial jump velocity |
| JUMP_HOLD | 32 | Additional force per frame |
| JUMP_MAX | 2 | Max air jumps |
| GRAVITY | 1000 | Downward acceleration |
| VY_MIN | -250 | Terminal velocity |

---

## Acceptance Criteria

- [ ] Play/Stop button toggles play mode
- [ ] Map auto-scrolls right during play
- [ ] Spacebar triggers jump
- [ ] Double jump works correctly
- [ ] Player lands on platforms
- [ ] Obstacle collision ends play
- [ ] Items can be collected
- [ ] Score and distance displayed
- [ ] Game over shows final stats

---

## Files to Modify
- `tools/level-preview.html`

## Estimated Lines of Code
~400-600 lines
