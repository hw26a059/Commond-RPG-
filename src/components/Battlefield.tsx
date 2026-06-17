/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Character, Enemy } from "../types";

interface BattlefieldProps {
  stageName: string;
  characters: Character[];
  enemies: Enemy[];
  selectedEnemyId: string;
  onSelectEnemy: (id: string) => void;
  damageEffects: { [key: string]: { amount: number; isCrit: boolean; id: string } };
}

export default function Battlefield({
  stageName,
  characters,
  enemies,
  selectedEnemyId,
  onSelectEnemy,
  damageEffects
}: BattlefieldProps) {

  const getElementColor = (el: string) => {
    switch (el) {
      case "FIRE":
        return "text-red-500 bg-red-950/40 border-red-800";
      case "WATER":
        return "text-blue-400 bg-blue-950/40 border-blue-900";
      case "WIND":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-900";
      default:
        return "text-slate-400 bg-slate-950/40 border-slate-800";
    }
  };

  const getEffectTag = (type: string, turns: number) => {
    switch (type) {
      case "STAN":
        return <span className="bg-amber-500 text-slate-950 rounded px-1.5 py-0.5 text-2xs font-bold animate-pulse">スタン ({turns})</span>;
      case "BURN":
        return <span className="bg-red-600 text-white rounded px-1.5 py-0.5 text-2xs font-bold">火傷 ({turns})</span>;
      case "DECAY":
        return <span className="bg-purple-600 text-white rounded px-1.5 py-0.5 text-2xs font-bold">風化 ({turns})</span>;
      case "ATK_DOWN":
        return <span className="bg-blue-600 text-white rounded px-1.5 py-0.5 text-2xs font-bold">攻撃撃低下 ({turns})</span>;
      case "DEF_DOWN":
        return <span className="bg-orange-600 text-white rounded px-1.5 py-0.5 text-2xs font-bold">防御低下 ({turns})</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-3 relative overflow-hidden">
      {/* 宇宙背景のようなドット・グリッド効果 */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

      {/* ステージタイトル */}
      <div className="flex justify-between items-center relative z-10 border-b border-slate-800 pb-1">
        <span className="text-3xs font-mono text-slate-500 tracking-widest uppercase">Stage Stage Stage</span>
        <h3 className="text-xs font-bold text-slate-300 font-sans">{stageName}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {/* レフト陣営: プレイヤーキャラクターたち */}
        <div className="space-y-2">
          <div className="text-3xs font-mono text-slate-500 border-l-2 border-slate-700 pl-1.5">PARTY MEMBERS (ALLY)</div>
          <div className="space-y-1.5">
            {characters.map((char) => {
              const hpPct = Math.max(0, Math.min(100, (char.hp / char.maxHp) * 100));
              const mpPct = Math.max(0, Math.min(100, (char.mp / char.maxMp) * 100));
              const spPct = Math.max(0, Math.min(100, (char.sp / char.maxSp) * 100));
              const activeEffect = damageEffects[char.id];

              return (
                <div
                  key={char.id}
                  className={`bg-slate-900/90 border border-slate-800 rounded p-1.5 px-2.5 space-y-1 relative transition duration-300 ${
                    char.hp <= 0 ? "opacity-40 grayscale" : ""
                  }`}
                >
                  {/* ダメージポップアップ */}
                  {activeEffect && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <span className={`text-lg font-extrabold font-mono tracking-wider animate-bounce block drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${
                        activeEffect.isCrit ? "text-amber-400 text-xl scale-110" : "text-red-500"
                      }`}>
                        {activeEffect.isCrit ? "🔥超会心!! " : ""}-{activeEffect.amount}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center space-x-1.5 text-slate-200">
                      <span>{char.name}</span>
                      <span className={`text-3xs px-1.5 py-0.2 px-1 font-mono border rounded ${getElementColor(char.element)}`}>
                        {char.element === "FIRE" ? "火" : char.element === "WATER" ? "水" : "風"}
                      </span>
                    </span>
                    <span className="text-3xs text-slate-500 font-mono italic">{char.role}</span>
                  </div>

                  {/* ステータス異常表示 */}
                  {char.statusEffects.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {char.statusEffects.map((eff, i) => (
                        <span key={i}>{getEffectTag(eff.type, eff.turns)}</span>
                      ))}
                    </div>
                  )}

                  {/* HP/MP/SPバー */}
                  <div className="space-y-0.5 text-3xs font-mono">
                    {/* HPバー */}
                    <div>
                      <div className="flex justify-between text-slate-400 scale-95 origin-left">
                        <span>HP: {char.hp} / {char.maxHp}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850">
                        <div
                          className="bg-emerald-500 transition-all duration-500 h-full"
                          style={{ width: `${hpPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* MPバー */}
                    <div>
                      <div className="flex justify-between text-slate-400 scale-95 origin-left">
                        <span>MP: {char.mp} / {char.maxMp}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 transition-all duration-500 h-full"
                          style={{ width: `${mpPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* SPバー */}
                    <div>
                      <div className="flex justify-between text-slate-400 scale-95 origin-left">
                        <span>SP: {char.sp} / {char.maxSp} (必要:{char.uniqueSkill.spCost})</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden relative">
                        {/* 固有能力発動に必要な位置にしきい値を描写 */}
                        <div 
                          className="absolute top-0 bottom-0 bg-amber-500 w-0.5 z-10"
                          style={{ left: `${(char.uniqueSkill.spCost / char.maxSp) * 100}%` }}
                        ></div>
                        <div
                          className={`transition-all duration-300 h-full ${
                            char.sp >= char.uniqueSkill.spCost ? "bg-amber-500 animate-pulse" : "bg-yellow-600"
                          }`}
                          style={{ width: `${spPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ライト陣営: 敵モンスターたち */}
        <div className="space-y-2">
          <div className="text-3xs font-mono text-slate-500 border-l-2 border-slate-700 pl-1.5">HOSTILE TARGETS (ENEMY) ※クリックで対象選択</div>
          <div className="space-y-1.5">
            {enemies.map((enemy) => {
              const isSelected = selectedEnemyId === enemy.id;
              const hpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
              const activeEffect = damageEffects[enemy.id];

              return (
                <div
                  key={enemy.id}
                  onClick={() => enemy.hp > 0 && onSelectEnemy(enemy.id)}
                  className={`bg-slate-900 border rounded p-1.5 px-2.5 space-y-1 relative cursor-pointer group transition duration-300 ${
                    enemy.hp <= 0 ? "opacity-30 grayscale cursor-not-allowed border-slate-950 bg-slate-950" : 
                    isSelected ? "border-amber-500 ring-1 ring-amber-500/20 shadow-md" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* ダメージポップアップ */}
                  {activeEffect && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <span className={`text-lg font-extrabold font-mono tracking-wider animate-bounce block drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${
                        activeEffect.isCrit ? "text-amber-400 text-xl scale-110" : "text-red-500"
                      }`}>
                        {activeEffect.isCrit ? "🔥超会心!! " : ""}-{activeEffect.amount}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center space-x-1.5 text-slate-100">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-500 animate-ping" : "bg-transparent"}`}></span>
                      <span>{enemy.name}</span>
                      <span className={`text-3xs px-1.5 py-0.2 px-1 font-mono border rounded ${getElementColor(enemy.element)}`}>
                        {enemy.element === "FIRE" ? "火" : enemy.element === "WATER" ? "水" : enemy.element === "WIND" ? "風" : "無"}
                      </span>
                    </span>
                    <span className="text-3xs font-mono text-slate-400 bg-slate-950 px-1 rounded-sm border border-slate-850 scale-90">
                      SPD {enemy.speed}
                    </span>
                  </div>

                  {/* ステータス異常表示 */}
                  {enemy.statusEffects.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {enemy.statusEffects.map((eff, i) => (
                        <span key={i}>{getEffectTag(eff.type, eff.turns)}</span>
                      ))}
                    </div>
                  )}

                  {/* HPバー */}
                  <div className="space-y-0.5 text-3xs font-mono">
                    <div className="flex justify-between text-slate-400 scale-95 origin-left">
                      <span>HP: {enemy.hp} / {enemy.maxHp}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded overflow-hidden border border-slate-850">
                      <div
                        className="bg-red-500 transition-all duration-300 h-full"
                        style={{ width: `${hpPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
