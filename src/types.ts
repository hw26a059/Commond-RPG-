/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = "FIRE" | "WATER" | "WIND" | "NONE";

export interface StatusEffect {
  type: "STAN" | "BURN" | "DECAY" | "ATK_DOWN" | "DEF_DOWN";
  turns: number; // 基本3ターン
}

export interface Skill {
  name: string;
  type: "PHYSICAL" | "ELEMENTAL" | "HEAL" | "SUPPORT";
  element: ElementType;
  target: "SINGLE_ENEMY" | "ALL_ENEMIES" | "SINGLE_ALLY" | "ALL_ALLIES";
  mpCost: number;
  spRecover: number;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  element: ElementType;
  role: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sp: number;
  maxSp: number;
  speed: number;
  pa: number; // 物理攻撃力
  ma: number; // 魔法攻撃力
  pd: number; // 物理防御力
  md: number; // 魔法防御力
  skills: Skill[];
  uniqueSkill: {
    name: string;
    spCost: number;
    description: string;
  };
  statusEffects: StatusEffect[];
}

export interface Enemy {
  id: string;
  name: string;
  element: ElementType;
  hp: number;
  maxHp: number;
  pa: number;
  pd: number;
  speed: number;
  statusEffects: StatusEffect[];
  skills: {
    name: string;
    description: string;
  }[];
}

export interface StageData {
  id: number;
  name: string;
  enemies: Enemy[];
}

export interface LogEntry {
  id: string;
  text: string;
  type: "DAMAGE" | "HEAL" | "EVENT" | "NORMAL" | "SYSTEM";
}
