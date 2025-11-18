import BuffSystem from "../../../../../framework/extension/buffs/BuffSystem";
import GenericBuff from "../../../../../framework/extension/buffs/GenericBuff";
import SkillFire3_3 from "../skill/GeneralSkill";
import SkillFire from "../skill/SkillFire";
import GoldBuff from "./GoldBuff";
import MagnetSuck from "./MagnetSuck";
import RushBuff from "./RushBuff";
import StarBuff from "./StarBuff";
import Stronger from "./Stronger";
import SkillFire3 from "../skill/SkillFire3";
import Skill_Turn from "../skill/Skill_Turn";
import DmgReduce from "../skill/DmgReduce";
import DeadBuff from "../skill/DeadBuff";
import Blackhole from "./Blackhole";
import Invincible from "./Invincible";
import PlayerLoseBuff from "./PlayerLoseHp";
import ReviveBuff from "./ReviveBuff";
import ShieldBuff from "../ShieldBuff";
import GeneralSkill from "../skill/GeneralSkill";

BuffSystem.register("magnet", GenericBuff, MagnetSuck)
BuffSystem.register("strong", GenericBuff, Stronger)
BuffSystem.register("rush", GenericBuff, RushBuff)
BuffSystem.register("star", GenericBuff, StarBuff)
BuffSystem.register("gold", GenericBuff, GoldBuff)

BuffSystem.register("skill", GenericBuff, GeneralSkill)
BuffSystem.register("fire3", GenericBuff, SkillFire3)
BuffSystem.register("fire", GenericBuff, SkillFire)

//生命 值 减少
BuffSystem.register("loseLife", GenericBuff, PlayerLoseBuff)

//伤害减免
BuffSystem.register("damageReduce", GenericBuff, DmgReduce)
//变身
BuffSystem.register("skill_turn", GenericBuff, Skill_Turn)
// 死亡冲刺
BuffSystem.register("the_undead", GenericBuff, DeadBuff);
//变身
// BuffSystem.register("skill_8", GenericBuff, Skill_5)

//黑洞
BuffSystem.register("blackhole", GenericBuff, Blackhole)

BuffSystem.register("invincible", GenericBuff, Invincible)

BuffSystem.register("revive", GenericBuff, ReviveBuff)
BuffSystem.register("shield", GenericBuff, ShieldBuff)