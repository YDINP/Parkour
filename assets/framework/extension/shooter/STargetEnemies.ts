import MoveBase from "../movement/SMoveBase";
import ShootManager from "./ShootManager";

const {ccclass, property ,requireComponent} = cc._decorator;

@ccclass
export default class STargetEnemies extends cc.Component
{
    @property
    targetInterval:number = 0.2;

    moveEntity:MoveBase;
    onLoad()
    {
        this.moveEntity = this.getComponent(MoveBase);
    }

    set interval(v)
    {
        this.targetInterval = v
        this.onDisable();
        this.onEnable();
    }

    private random(length)
    {
        return Math.floor(Math.random() * length)
    }

    seekTarget()
    {
        if(!this.moveEntity.target || !this.moveEntity.target.activeInHierarchy)
        {
            let enemies = ShootManager.instance.allEnemies;
            
            let idx = this.random(enemies.length);
            this.moveEntity.target = enemies[idx];
        }
        // all enemies
    }

    onEnable()
    {
        this.schedule(this.seekTarget, this.targetInterval)
    }

    onDisable()
    {
        this.unschedule(this.seekTarget);
    }

}