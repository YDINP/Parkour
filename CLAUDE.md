# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Parkour Hero is a 2D endless runner game built with **Cocos Creator 2.4.13**. The game features heroes, pets, buffs, and various game modes across multiple platforms (WeChat, Alipay, QQ mini-games).

## Development Commands

```bash
# Generate TypeScript types from CSV data files
npm run csv-dts

# Convert JSON to CSV format
npm run tocsv

# Generate enum definitions
npm run gen-enums
```

Build and run the game through **Cocos Creator Editor** (no CLI build commands available).

## Architecture Overview

### Directory Structure

```
assets/
├── Game/Script/          # Game logic (107 files)
│   ├── common/           # Game configs, loading, persistent nodes
│   ├── data/             # PlayerInfo, GameInfo
│   ├── game/             # Core gameplay (Player.ts, Game.ts, behaviors/)
│   ├── ui/               # UI components (UIHeroShop, UIRevive, etc.)
│   └── Controller/       # SkeletonComponent, SkinManager
├── framework/            # Engine extensions (144 files)
│   ├── core/             # FSM, PoolManager, Signal, DataCenter
│   ├── extension/        # buffs/, fxplayer/, input/, shooter/, tilemap/
│   ├── fizzx/            # Custom 2D physics engine
│   └── ui/               # MVC views, ListView, MessageBox
└── resources/            # Game assets
    ├── Config/csv/       # CSV data files (balancing, items, levels)
    ├── heros/            # Hero prefabs (hero001-008)
    ├── pets/             # Pet prefabs
    └── prefabs/          # UI prefabs
```

### Core Systems

**Player System** (`assets/Game/Script/game/Player.ts`)
- Implements `FizzCollideInterface` for physics
- Uses FSM for states (Normal, Scaling) and skill states (CD, Ready)
- Components: `PlayerController`, `SkeletonComponent`, `SFireAgent`, `BuffSystem`

**Buff System** (`assets/framework/extension/buffs/`)
- `BuffSystem` manages active buffs per entity
- Register buffs in `PlayerBuffs.ts` or `PetBuffs.ts`
- Lifecycle: `onEnabled()` → `step()` → `onTimeLeftChanged()` → `onDisabled()`

**Physics** (`assets/framework/fizzx/`)
- Custom 2D physics engine (not Cocos built-in)
- `FizzBody` for physics bodies, `PlayerController` for player physics
- Collision via `FizzCollideInterface`

**Data Management**
- Game data stored in CSV files (`resources/Config/csv/`)
- `DataCenter` decorator (`@dc`) for persistent player data
- Localization in `assets/Localization/*.json`

### Key Patterns

**FSM Usage:**
```typescript
this.fsm.add("StateName", new State({
    onEnter: (params) => { },
    onExit: () => { },
    onUpdate: (dt) => { }
}));
this.fsm.switch("StateName");
```

**Buff Registration:**
```typescript
BuffSystem.reg("buffName", BuffClassName);
this.buffSystem.add("buffName", duration);
```

**Signal Events:**
```typescript
signal.add(callback, this);
signal.fire(params);
signal.remove(callback, this);
```

## Platform Support

The game targets multiple mini-game platforms with SDK integrations:
- WeChat (`framework/extension/sdks/wxsdk/`)
- Alipay (`framework/extension/sdks/aldsdk/`)
- QQ (`framework/extension/sdks/qq/`)
- ByteDance TT (`framework/extension/sdks/ttsdk/`)

## Prefab Editing

Prefab files (`.prefab`) are JSON. Key fields:
- `__id__`: Component reference index in the JSON array
- `_components`: Array of component IDs attached to a node
- `_spriteFrame.__uuid__`: Sprite frame asset UUID
- `_N$file.__uuid__`: Font file UUID for labels

To replace sprites, update the UUID in `_spriteFrame` to the new texture's `subMetas` UUID from its `.meta` file.

## MCP Servers

### Puppeteer MCP
브라우저 자동화 및 테스트를 위한 Puppeteer MCP 서버가 설정되어 있습니다.

**설정 방법** (`~/.claude.json`에 추가):
```json
"puppeteer": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-puppeteer"],
  "env": {}
}
```

**게임 테스트 URL**: `http://localhost:7458` (Cocos Creator 에디터에서 실행 시)

**주요 기능**:
- 브라우저 자동화 테스트
- 스크린샷 캡처
- 터치/클릭 이벤트 시뮬레이션
- 전체화면 기능 테스트
