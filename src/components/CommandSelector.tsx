/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Character, Skill } from "../types";

interface CommandSelectorProps {
  characters: Character[];
  selections: {
    [charId: string]: {
      skillA: Skill;
      skillB: Skill;
      useUnique: boolean;
    };
  };
  onSelectSkill: (charId: string, slot: "skillA" | "skillB", skill: Skill) => void;
  onToggleUnique: (charId: string) => void;
  onExecuteTurn: () => void;
  battleStatus: "READY" | "RESOLVING" | "GAMEOVER" | "VICTORY";
}

export default function CommandSelector({
  characters,
  selections,
  onSelectSkill,
  onToggleUnique,
  onExecuteTurn,
  battleStatus
}: CommandSelectorProps) {

  const getElementBadgeColor = (el: string) => {
    switch (el) {
      case "FIRE":
        return "text-red-500 bg-red-950/40 border-red-900";
      case "WATER":
        return "text-blue-400 bg-blue-950/40 border-blue-900";
      case "WIND":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-900";
      default:
        return "text-slate-400 bg-slate-950/40 border-slate-900";
    }
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <h4 className="text-xs font-bold font-sans text-amber-500 flex items-center space-x-1.5">
          <span>⚔️ ターン戦略発動コマンドスロット構築</span>
        </h4>
        <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest">TACTICS</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {characters.map((char) => {
          const isDead = char.hp <= 0;
          const charSel = selections[char.id];
          if (!charSel) return null;

          const isStunned = char.statusEffects.some((eff) => eff.type === "STAN");

          return (
            <div
              key={char.id}
              className={`bg-slate-900/40 border border-slate-800 rounded p-2.5 space-y-2 relative transition duration-300 ${
                isDead ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              {isStunned && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-20 rounded">
                  <span className="text-amber-500 font-bold border border-amber-500/50 px-2.5 py-1 bg-slate-900/90 rounded text-xs animate-pulse shadow-md">
                    ⚡ 行動不能
                  </span>
                </div>
              )}

              {/* キャラ識別ヘッダー */}
              <div className="flex justify-between items-center bg-slate-950/40 p-1 px-2 rounded border border-slate-850">
                <span className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                  <span>{char.name}</span>
                  <span className={`text-3xs px-1 py-0.2 border rounded ${getElementBadgeColor(char.element)}`}>
                    {char.element === "FIRE" ? "火" : char.element === "WATER" ? "水" : "風"}
                  </span>
                </span>
                <span className="text-3xs font-mono text-slate-500">
                  COMMAND
                </span>
              </div>

              {/* 技A & B スロットを横並びにして縦空間を大幅に削減 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-3xs text-slate-400 font-mono block">▼ 技A スロット</label>
                  <select
                    value={charSel.skillA.name}
                    onChange={(e) => {
                      const matched = char.skills.find((s) => s.name === e.target.value);
                      if (matched) onSelectSkill(char.id, "skillA", matched);
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded px-1 px-1.5 py-1 text-3xs text-slate-300 focus:outline-hidden focus:border-amber-500 transition cursor-pointer"
                  >
                    {char.skills.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} (MP{s.mpCost})
                      </option>
                    ))}
                  </select>
                  {char.mp < charSel.skillA.mpCost && (
                    <span className="text-3xs text-red-500 block scale-90 origin-left">⚠️MP不足</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <label className="text-3xs text-slate-400 font-mono block">▼ 技B スロット</label>
                  <select
                    value={charSel.skillB.name}
                    onChange={(e) => {
                      const matched = char.skills.find((s) => s.name === e.target.value);
                      if (matched) onSelectSkill(char.id, "skillB", matched);
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded px-1 px-1.5 py-1 text-3xs text-slate-300 focus:outline-hidden focus:border-amber-500 transition cursor-pointer"
                  >
                    {char.skills.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} (MP{s.mpCost})
                      </option>
                    ))}
                  </select>
                  {char.mp < (charSel.skillA.mpCost + charSel.skillB.mpCost) && char.mp >= charSel.skillB.mpCost && (
                    <span className="text-3xs text-red-500 block scale-90 origin-left">⚠️総MP不足</span>
                  )}
                </div>
              </div>

              {/* 固有能力エリア */}
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850 space-y-1">
                <div className="flex justify-between items-center text-3xs">
                  <span className="text-slate-400 font-bold block truncate">
                    🌟 {char.uniqueSkill.name} <span className="text-amber-500">(SP:{char.uniqueSkill.spCost})</span>
                  </span>
                </div>
                <p className="text-3xs text-slate-450 leading-tight block scale-95 origin-left min-h-[14px]">
                  {char.uniqueSkill.description}
                </p>

                <button
                  type="button"
                  disabled={char.sp < char.uniqueSkill.spCost}
                  onClick={() => onToggleUnique(char.id)}
                  className={`w-full py-1 rounded text-3xs font-bold transition flex justify-center items-center space-x-1 ${
                    charSel.useUnique
                      ? "bg-amber-500 hover:bg-amber-450 text-slate-950 shadow-md"
                      : char.sp >= char.uniqueSkill.spCost
                      ? "bg-slate-850 hover:bg-slate-800 text-amber-400 border border-amber-800/20"
                      : "bg-slate-950 text-slate-650 cursor-not-allowed border border-slate-900"
                  }`}
                >
                  <span>{charSel.useUnique ? "固有能力：ON" : "固有能力：OFF"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 発動コントロール */}
      <div className="flex justify-center pt-2 border-t border-slate-800">
        <button
          onClick={onExecuteTurn}
          disabled={battleStatus === "RESOLVING" || battleStatus === "GAMEOVER" || battleStatus === "VICTORY"}
          className={`w-full max-w-md py-2.5 rounded text-xs font-bold tracking-wider font-sans transition duration-300 ${
            battleStatus === "RESOLVING" ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850" :
            battleStatus === "GAMEOVER" ? "bg-red-950/60 text-red-500 border border-red-800/40 cursor-not-allowed" :
            battleStatus === "VICTORY" ? "bg-emerald-950/60 text-emerald-550 border border-emerald-800/40 cursor-not-allowed" :
            "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
          }`}
        >
          {battleStatus === "RESOLVING" ? "戦況処理中..." : "⚡ ターン同時実行 (コマンド発動) ⚡"}
        </button>
      </div>
    </div>
  );
}
