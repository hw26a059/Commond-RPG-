/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StageData, Character } from "../types";

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "char_a",
    name: "キャラクターA",
    element: "FIRE",
    role: "物理アタッカー / 壁役",
    hp: 200,
    maxHp: 200,
    mp: 50,
    maxMp: 50,
    sp: 0,
    maxSp: 100,
    speed: 90,
    pa: 200,
    ma: 80,
    pd: 150,
    md: 150,
    skills: [
      {
        name: "物理攻撃",
        type: "PHYSICAL",
        element: "NONE",
        target: "SINGLE_ENEMY",
        mpCost: 0,
        spRecover: 15,
        description: "敵単体に基本物理ダメージを与える。"
      },
      {
        name: "唐竹割",
        type: "PHYSICAL",
        element: "NONE",
        target: "SINGLE_ENEMY",
        mpCost: 10,
        spRecover: 15,
        description: "敵単体に強力な物理ダメージを与え、一定確率で防御力低下を付与。"
      },
      {
        name: "火払い",
        type: "ELEMENTAL",
        element: "FIRE",
        target: "ALL_ENEMIES",
        mpCost: 12,
        spRecover: 10,
        description: "敵全体に火属性の薙ぎ払い物理ダメージを与える。"
      },
      {
        name: "熱破",
        type: "ELEMENTAL",
        element: "FIRE",
        target: "SINGLE_ENEMY",
        mpCost: 15,
        spRecover: 10,
        description: "敵単体に高火力の火属性魔法ダメージを与え、一定確率で火傷を付与。"
      }
    ],
    uniqueSkill: {
      name: "追撃",
      spCost: 40,
      description: "自身の攻撃（技A・技Bなど）を行った後、与えた総ダメージの80%分の追加ダメージを対象に与える。"
    },
    statusEffects: []
  },
  {
    id: "char_b",
    name: "キャラクターB",
    element: "WATER",
    role: "バランス / バフ・デバフ",
    hp: 120,
    maxHp: 120,
    mp: 160,
    maxMp: 160,
    sp: 0,
    maxSp: 110,
    speed: 85,
    pa: 100,
    ma: 170,
    pd: 100,
    md: 170,
    skills: [
      {
        name: "物理攻撃",
        type: "PHYSICAL",
        element: "NONE",
        target: "SINGLE_ENEMY",
        mpCost: 0,
        spRecover: 15,
        description: "敵単体に基本物理ダメージを与える。"
      },
      {
        name: "急流",
        type: "ELEMENTAL",
        element: "WATER",
        target: "SINGLE_ENEMY",
        mpCost: 12,
        spRecover: 10,
        description: "敵単体に水属性魔法ダメージを与え、一定確率で攻撃力低下を付与。"
      },
      {
        name: "静水",
        type: "HEAL",
        element: "NONE",
        target: "SINGLE_ALLY",
        mpCost: 15,
        spRecover: 10,
        description: "味方単体のHPを大きく回復する。"
      },
      {
        name: "霧散",
        type: "SUPPORT",
        element: "NONE",
        target: "ALL_ALLIES",
        mpCost: 18,
        spRecover: 10,
        description: "味方全体の受けているデバフ・マイナス効果（スタン以外）を洗い流し、回復する。"
      }
    ],
    uniqueSkill: {
      name: "トレース",
      spCost: 60,
      description: "自身の攻撃、もしくはスキル（技）発動後に、全く同じ行動をさらに1回繰り返す。"
    },
    statusEffects: []
  },
  {
    id: "char_c",
    name: "キャラクターC",
    element: "WIND",
    role: "魔法アタッカー / 回復役",
    hp: 100,
    maxHp: 100,
    mp: 200,
    maxMp: 200,
    sp: 0,
    maxSp: 100,
    speed: 70,
    pa: 90,
    ma: 200,
    pd: 90,
    md: 140,
    skills: [
      {
        name: "物理攻撃",
        type: "PHYSICAL",
        element: "NONE",
        target: "SINGLE_ENEMY",
        mpCost: 0,
        spRecover: 15,
        description: "敵単体に基本物理ダメージを与える。"
      },
      {
        name: "旋風",
        type: "ELEMENTAL",
        element: "WIND",
        target: "ALL_ENEMIES",
        mpCost: 15,
        spRecover: 10,
        description: "敵全体に激しい竜巻を起こす風属性魔法ダメージを与え、高確率で風化を付与。"
      },
      {
        name: "暴風",
        type: "ELEMENTAL",
        element: "WIND",
        target: "SINGLE_ENEMY",
        mpCost: 20,
        spRecover: 10,
        description: "敵単体に超強力な風属性魔法ダメージを与え、低確率でスタン（1ターン）を付与。"
      },
      {
        name: "癒風",
        type: "HEAL",
        element: "NONE",
        target: "ALL_ALLIES",
        mpCost: 25,
        spRecover: 10,
        description: "優しき癒しの風ですべての味方のHPを全体回復する。"
      }
    ],
    uniqueSkill: {
      name: "集中",
      spCost: 90,
      description: "そのターンに自身が与えるダメージが必ず「超会心」となる（超会心は、通常の会心ダメージの2倍の威力を発揮する）。"
    },
    statusEffects: []
  }
];

export const DEFAULT_STAGES: StageData[] = [
  {
    id: 1,
    name: "ステージ1: 雑魚敵エリア",
    enemies: [
      {
        id: "s1_slime_fire",
        name: "火のスライム",
        element: "FIRE",
        hp: 120,
        maxHp: 120,
        pa: 25,
        pd: 25,
        speed: 40,
        statusEffects: [],
        skills: [{ name: "物理攻撃", description: "火傷を誘発しうる物理攻撃" }]
      },
      {
        id: "s1_slime_water",
        name: "水のスライム",
        element: "WATER",
        hp: 120,
        maxHp: 120,
        pa: 20,
        pd: 35,
        speed: 35,
        statusEffects: [],
        skills: [{ name: "物理攻撃", description: "防御低下を誘発しうる物理攻撃" }]
      },
      {
        id: "s1_slime_wind",
        name: "風のスライム",
        element: "WIND",
        hp: 120,
        maxHp: 120,
        pa: 22,
        pd: 22,
        speed: 55,
        statusEffects: [],
        skills: [{ name: "全体引き裂き", description: "素早さ低下を誘発しうる全体物理攻撃" }]
      }
    ]
  },
  {
    id: 2,
    name: "ステージ2: 中ボスエリア",
    enemies: [
      {
        id: "s2_mech_fire",
        name: "赤蓮の機甲兵",
        element: "FIRE",
        hp: 450,
        maxHp: 450,
        pa: 55,
        pd: 80,
        speed: 50,
        statusEffects: [],
        skills: [
          { name: "物理連撃", description: "高威力の物理二段攻撃" },
          { name: "爆炎破", description: "強力な火属性の魔法攻撃" }
        ]
      },
      {
        id: "s2_beast_wind",
        name: "嵐翼の有翼獣",
        element: "WIND",
        hp: 380,
        maxHp: 380,
        pa: 45,
        pd: 40,
        speed: 95,
        statusEffects: [],
        skills: [
          { name: "烈風爪", description: "素早い風爪攻撃" },
          { name: "ダウンバースト", description: "全体風魔法、「風化」を誘発しうる" }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "ステージ3: ボスエリア",
    enemies: [
      {
        id: "s3_boss_tidal",
        name: "混沌の支配者（タイダル）",
        element: "WATER",
        hp: 1500,
        maxHp: 1500,
        pa: 80,
        pd: 90,
        speed: 75,
        statusEffects: [],
        skills: [
          { name: "タイダルウェーブ", description: "超強力な水属性の全体攻撃" },
          { name: "混沌の槍", description: "無属性の単体魔法攻撃" }
        ]
      },
      {
        id: "s3_minion_fire",
        name: "従者A「深紅の障壁」",
        element: "FIRE",
        hp: 300,
        maxHp: 300,
        pa: 30,
        pd: 120,
        speed: 60,
        statusEffects: [],
        skills: [
          { name: "防護障壁", description: "ボスや味方にダメージバリアを付与。または防御力上昇バフ" }
        ]
      },
      {
        id: "s3_minion_wind",
        name: "従者B「疾風の歌い手」",
        element: "WIND",
        hp: 300,
        maxHp: 300,
        pa: 35,
        pd: 60,
        speed: 110,
        statusEffects: [],
        skills: [
          { name: "疾風の歌", description: "敵全体の攻撃・素早さバフ。デバフ解除" }
        ]
      }
    ]
  }
];
