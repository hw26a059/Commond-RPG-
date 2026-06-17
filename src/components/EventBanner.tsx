/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface EventBannerProps {
  currentEvent: string;
  turnsRemaining: number;
}

export default function EventBanner({ currentEvent, turnsRemaining }: EventBannerProps) {
  if (!currentEvent) {
    return (
      <div className="bg-slate-950/60 border border-slate-850 py-1 px-3 rounded-md flex justify-between items-center text-2xs">
        <span className="text-slate-500 font-mono">突発フィールドイベント：</span>
        <span className="text-slate-400 font-bold">未発生 (3ターン目に初回発生します)</span>
      </div>
    );
  }

  const getEventStyle = (name: string) => {
    if (name.includes("昂り")) {
      return "border-amber-600 bg-amber-950/20 text-amber-400";
    }
    if (name.includes("静寂")) {
      return "border-blue-750 bg-blue-950/20 text-blue-400";
    }
    if (name.includes("防御崩壊")) {
      return "border-red-900 bg-red-950/20 text-red-400";
    }
    return "border-yellow-700 bg-yellow-980/10 text-yellow-300";
  };

  return (
    <div className={`border py-1 px-2.5 rounded-md flex flex-row justify-between items-center text-2xs relative overflow-hidden transition duration-500 ${getEventStyle(currentEvent)}`}>
      {/* 点滅マーカー */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-current animate-pulse"></div>

      <div className="flex items-center space-x-2 pl-1.5">
        <span className="text-3xs font-mono uppercase bg-slate-950/40 px-1 py-0.2 border border-current rounded-3xs tracking-wider">
          EVENT
        </span>
        <span className="font-bold text-xs font-sans">「{currentEvent}」発動中</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-3xs text-slate-300 hidden sm:inline">
          詳細: {
            currentEvent === "防御崩壊" ? "全員の物理・魔法防御力が30%低下" :
            currentEvent.includes("昂り") ? `${currentEvent.slice(0, 1)}属性ダメージ1.6倍` :
            currentEvent.includes("静寂") ? `${currentEvent.slice(0, 1)}属性ダメージ半減` :
            "全員の物理・魔法攻撃力35%上昇"
          }
        </span>
        <span className="font-mono text-2xs border border-current bg-slate-950/40 px-1.5 py-0.2 rounded">
          残り {turnsRemaining}T
        </span>
      </div>
    </div>
  );
}
