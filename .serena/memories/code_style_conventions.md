# Code Style and Conventions

## TypeScript Configuration
- Target: ES5
- Module: CommonJS
- Experimental decorators enabled
- No strict type checking

## Naming Conventions
- **Classes**: PascalCase (e.g., `Player`, `BuffSystem`, `HeroData`)
- **Variables/Properties**: camelCase (e.g., `isSlide`, `buffSystem`, `playinglv`)
- **Enums**: PascalCase for enum name, PascalCase for values (e.g., `State.Normal`, `SkillState.CD`)
- **Files**: PascalCase for classes, camelCase for utilities

## Cocos Creator Patterns
```typescript
const { ccclass, property } = cc._decorator;

@ccclass
export default class MyComponent extends cc.Component {
    @property(cc.Node)
    someNode: cc.Node = null;

    onLoad() { }
    start() { }
    update(dt) { }
}
```

## FSM (Finite State Machine) Usage
```typescript
// Create FSM
this.fsm = this.addComponent(FSM);
this.fsm.init(this, StateEnum);
this.fsm.enterState(StateEnum.Normal);

// State class approach
this.fsm.add("StateName", new State({
    onEnter: (params) => { },
    onExit: () => { },
    onUpdate: (dt) => { }
}));
this.fsm.switch("StateName");
```

## Buff System Registration
```typescript
// Register buff class
BuffSystem.reg("buffName", BuffClassName);

// Add buff to entity
this.buffSystem.add("buffName", duration);
```

## Signal Events
```typescript
// Add listener
signal.add(callback, this);
signal.on(callback, this);  // Same as add but removes first

// Fire event
signal.fire(params);

// Remove listener
signal.remove(callback, this);
signal.off(callback, this);
```

## Data Persistence (DataCenter)
```typescript
@dc("pdata")  // Decorator with namespace
export default class PlayerInfoDC extends DataCenter {
    @field()   // Marks as persistent field
    level: number = 1;
    
    @field({ persistent: false })  // Non-persistent
    tempValue: number = 0;
}
```

## Comments
- Chinese comments are common in this codebase
- Korean comments appear in newer code (Hi5 integration)
- JSDoc style comments used occasionally
