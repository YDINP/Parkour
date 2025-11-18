import BuffSystem from "../../../../../framework/extension/buffs/BuffSystem";
import GenericBuff from "../../../../../framework/extension/buffs/GenericBuff";
import Meteorilite from "../skill/Meteorilite";
import ItemStrengthBuff from "./ItemStrengthBuff";
import LifeLoseReduceBuff from "./LifeLoseReduceBuff";
import MakeItemBuff from "./MakeItemBuff";
import SpeedupBuff from "./SpeedupBuff";

BuffSystem.register("makeItem", GenericBuff, MakeItemBuff)
BuffSystem.register("itemStrength", GenericBuff, ItemStrengthBuff)
BuffSystem.register("lifeLoseReduce", GenericBuff, LifeLoseReduceBuff)
BuffSystem.register("speedup", GenericBuff, SpeedupBuff)

BuffSystem.register("meteor", GenericBuff, Meteorilite)