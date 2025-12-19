# Codebase Structure

## Root Directory
```
Parkour/
├── assets/              # Main game assets and code
├── build/               # Build output directory
├── extensions/          # Cocos Creator extensions
├── library/             # Cocos Creator library (generated)
├── local/               # Local settings
├── packages/            # Editor packages
├── settings/            # Project settings
├── temp/                # Temporary files
├── tools/               # Build and utility scripts
├── typings/             # TypeScript type definitions
├── CLAUDE.md            # Project documentation
├── package.json         # NPM configuration
├── tsconfig.json        # TypeScript configuration
└── creator.d.ts         # Cocos Creator type definitions
```

## Assets Structure
```
assets/
├── Game/Script/              # Game logic (~107 files)
│   ├── common/               # Game configs, loading, persistent nodes
│   │   ├── configs/          # Platform-specific configs
│   │   ├── ServerConfig.ts   # Server configuration
│   │   └── Unity.ts          # Unity compatibility layer
│   ├── data/                 # Player and game data
│   │   ├── PlayerInfo.ts     # Player persistent data (@dc decorator)
│   │   └── GameInfo.ts       # Game session data
│   ├── game/                 # Core gameplay
│   │   ├── Player.ts         # Main player class
│   │   ├── Game.ts           # Game manager
│   │   ├── Home.ts           # Home screen logic
│   │   ├── behaviors/        # FSM behaviors
│   │   │   ├── player/       # Player buffs (Invincible, MagnetSuck, etc.)
│   │   │   ├── pet/          # Pet buffs
│   │   │   └── skill/        # Skill effects
│   │   ├── effects/          # Visual effects
│   │   ├── model/            # Data models (HeroData, PetData, etc.)
│   │   ├── objects/          # Game objects (Item, Pet, Obstacle)
│   │   └── views/            # In-game UI elements
│   ├── ui/                   # UI components
│   │   ├── UIHeroShop.ts     # Hero shop
│   │   ├── UIRevive.ts       # Revive screen
│   │   ├── UIReady.ts        # Ready screen
│   │   └── ...               # Other UI screens
│   ├── Controller/           # Animation controllers
│   │   ├── SkeletonComponent.ts
│   │   └── SkinManager.ts
│   └── view/                 # View helpers
│
├── framework/                # Engine extensions (~144 files)
│   ├── core/                 # Core utilities
│   │   ├── FSM.ts            # Finite State Machine
│   │   ├── PoolManager.ts    # Object pooling
│   │   ├── Signal.ts         # Event system
│   │   ├── DataCenter.ts     # Data persistence (@dc, @field)
│   │   └── Device.ts         # Device detection
│   ├── extension/            # Extended systems
│   │   ├── buffs/            # Buff system
│   │   ├── fxplayer/         # Effect player
│   │   ├── input/            # Input handling
│   │   ├── shooter/          # Shooting mechanics
│   │   ├── sdks/             # Platform SDKs
│   │   │   ├── wxsdk/        # WeChat
│   │   │   ├── aldsdk/       # Alipay
│   │   │   ├── qq/           # QQ
│   │   │   └── ttsdk/        # ByteDance
│   │   └── tilemap/          # Tilemap utilities
│   ├── fizzx/                # Custom 2D physics engine
│   │   ├── fizz.ts           # Physics core
│   │   ├── shapes.ts         # Collision shapes
│   │   └── components/       # Physics components
│   │       ├── FizzBody.ts   # Physics body
│   │       ├── FizzManager.ts
│   │       └── Common/       # Common physics behaviors
│   │           └── PlayerController.ts
│   ├── ui/                   # UI framework
│   │   ├── ListView.ts       # List view component
│   │   ├── MessageBoxManager.ts
│   │   └── controller/       # UI controllers
│   ├── Hi5/                  # Hi5 platform integration
│   │   └── Localization/     # Localization system
│   └── utils/                # Utility functions
│
└── resources/                # Game assets
    ├── Config/csv/           # CSV data files
    │   ├── HeroInfo.csv      # Hero definitions
    │   ├── PetInfo.csv       # Pet definitions
    │   ├── Level.csv         # Level data
    │   ├── Item.csv          # Item definitions
    │   └── ...               # Other data
    ├── heros/                # Hero prefabs (hero001-008)
    ├── pets/                 # Pet prefabs
    └── prefabs/              # UI prefabs
```

## Key Files
- `assets/Game/Script/game/Player.ts` - Main player class with FSM and buff system
- `assets/Game/Script/data/PlayerInfo.ts` - Persistent player data
- `assets/framework/core/FSM.ts` - State machine implementation
- `assets/framework/extension/buffs/BuffSystem.ts` - Buff management
- `assets/framework/fizzx/components/Common/PlayerController.ts` - Physics control
