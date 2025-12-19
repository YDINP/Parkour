# Parkour Hero - Project Overview

## Purpose
Parkour Hero is a 2D endless runner game built for multiple mini-game platforms (WeChat, Alipay, QQ, ByteDance TT).

## Tech Stack
- **Game Engine**: Cocos Creator 2.4.13
- **Language**: TypeScript (ES5 target, CommonJS modules)
- **Physics**: Custom 2D physics engine (fizzx) - not Cocos built-in
- **Data Storage**: CSV files for game configuration, localStorage for player data

## Key Features
- Heroes, pets, and buff systems
- Multiple game modes (Normal, Infinite, Level-based)
- Skill system with cooldowns
- Platform-specific SDK integrations

## Platform Targets
- WeChat Mini-game (`framework/extension/sdks/wxsdk/`)
- Alipay Mini-game (`framework/extension/sdks/aldsdk/`)
- QQ Mini-game (`framework/extension/sdks/qq/`)
- ByteDance TT (`framework/extension/sdks/ttsdk/`)
- Hi5 Platform (newer integration)
