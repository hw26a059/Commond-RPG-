/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Character, StageData, ElementType } from "../types";

interface EditorProps {
  characters: Character[];
  stages: StageData[];
  onSave: (updatedChars: Character[], updatedStages: StageData[]) => void;
  onClose: () => void;
}

export default function Editor({ characters, stages, onSave, onClose }: EditorProps) {
  const [editedChars, setEditedChars] = useState<Character[]>(() => JSON.parse(JSON.stringify(characters)));
  const [editedStages, setEditedStages] = useState<StageData[]>(() => JSON.parse(JSON.stringify(stages)));
  const [selectedStageTab, setSelectedStageTab] = useState<number>(0);

  // キャラクターの基本ステータス変更
  const handleCharChange = (index: number, field: keyof Character, value: any) => {
    const next = [...editedChars];
    if (field === "hp" || field === "mp" || field === "sp") {
      // 最大値も同期
      const maxField = field === "hp" ? "maxHp" : field === "mp" ? "maxMp" : "maxSp";
      next[index] = {
        ...next[index],
        [field]: Number(value),
        [maxField]: Number(value)
      };
    } else if (typeof value === "number") {
      next[index] = { ...next[index], [field]: Number(value) };
    } else {
      next[index] = { ...next[index], [field]: value };
    }
    setEditedChars(next);
  };

  // 敵の変更
  const handleEnemyChange = (stageIdx: number, enemyIdx: number, field: string, value: any) => {
    const nextStages = [...editedStages];
    const enemy = { ...nextStages[stageIdx].enemies[enemyIdx] };

    if (field === "element") {
      enemy.element = value as ElementType;
    } else if (field === "hp") {
      enemy.hp = Number(value);
      enemy.maxHp = Number(value);
    } else if (typeof enemy[field as keyof typeof enemy] === "number") {
      (enemy as any)[field] = Number(value);
    } else {
      (enemy as any)[field] = value;
    }

    nextStages[stageIdx].enemies[enemyIdx] = enemy;
    setEditedStages(nextStages);
  };

  const handleSaveAll = () => {
    onSave(editedChars, editedStages);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3.5 max-w-5xl mx-auto text-slate-100 shadow-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2">
        <h2 className="text-sm font-bold font-sans text-amber-500">🔧 ゲームデータ調整・エディットモード</h2>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition animate-none"
          >
            閉じる
          </button>
          <button
            onClick={handleSaveAll}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded text-xs font-bold text-slate-950 transition animate-none"
          >
            調整データを反映
          </button>
        </div>
      </div>

      {/* 味方キャラクターの編集 */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold border-l-4 border-amber-500 pl-2">👥 味方初期ステータス</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {editedChars.map((char, index) => (
            <div key={char.id} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 space-y-2">
              <div className="font-bold text-xs text-amber-400 flex justify-between items-center">
                <span>{char.name}</span>
                <span className="text-3xs px-1.5 py-0.2 bg-slate-700 rounded text-slate-300">{char.role}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5 text-3xs">
                <label className="flex flex-col">
                  <span className="text-slate-400">最大HP</span>
                  <input
                    type="number"
                    value={char.hp}
                    onChange={(e) => handleCharChange(index, "hp", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">最大MP</span>
                  <input
                    type="number"
                    value={char.mp}
                    onChange={(e) => handleCharChange(index, "mp", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">最大SP</span>
                  <input
                    type="number"
                    value={char.maxSp}
                    onChange={(e) => handleCharChange(index, "maxSp", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">素早さ</span>
                  <input
                    type="number"
                    value={char.speed}
                    onChange={(e) => handleCharChange(index, "speed", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">物理攻撃</span>
                  <input
                    type="number"
                    value={char.pa}
                    onChange={(e) => handleCharChange(index, "pa", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">魔法攻撃</span>
                  <input
                    type="number"
                    value={char.ma}
                    onChange={(e) => handleCharChange(index, "ma", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">物理防御</span>
                  <input
                    type="number"
                    value={char.pd}
                    onChange={(e) => handleCharChange(index, "pd", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-slate-400">魔法防御</span>
                  <input
                    type="number"
                    value={char.md}
                    onChange={(e) => handleCharChange(index, "md", e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 敵とステージの編集 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold border-l-4 border-amber-500 pl-2">👾 ステージ敵の限界値調整</h3>
          <div className="flex bg-slate-800 rounded p-1 border border-slate-700 text-3xs">
            {editedStages.map((stg, sIndex) => (
              <button
                key={stg.id}
                onClick={() => setSelectedStageTab(sIndex)}
                className={`px-2 py-0.5 rounded transition ${
                  selectedStageTab === sIndex ? "bg-amber-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ST{stg.id}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <h4 className="font-bold text-3xs text-slate-300 mb-2">{editedStages[selectedStageTab].name} 配属構成</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {editedStages[selectedStageTab].enemies.map((enemy, eIndex) => (
              <div key={enemy.id} className="bg-slate-905 p-2.5 rounded border border-slate-750 space-y-2">
                <div className="flex flex-col space-y-0.5 text-3xs">
                  <span className="text-slate-500 text-4xs">名前</span>
                  <input
                    type="text"
                    value={enemy.name}
                    onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "name", e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded p-0.5 text-xs text-yellow-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-3xs">
                  <label className="flex flex-col">
                    <span className="text-slate-400">属性</span>
                    <select
                      value={enemy.element}
                      onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "element", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded p-0.5 mt-0.5 text-center text-amber-400"
                    >
                      <option value="FIRE">火 (FIRE)</option>
                      <option value="WATER">水 (WATER)</option>
                      <option value="WIND">風 (WIND)</option>
                      <option value="NONE">無 (NONE)</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <span className="text-slate-400">最大HP</span>
                    <input
                      type="number"
                      value={enemy.hp}
                      onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "hp", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-slate-400">物理攻撃</span>
                    <input
                      type="number"
                      value={enemy.pa}
                      onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "pa", e.target.value)}
                      className="bg-slate-805 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-slate-400">物理防御</span>
                    <input
                      type="number"
                      value={enemy.pd}
                      onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "pd", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                    />
                  </label>
                  <label className="flex flex-col col-span-2">
                    <span className="text-slate-400">素早さ</span>
                    <input
                      type="number"
                      value={enemy.speed}
                      onChange={(e) => handleEnemyChange(selectedStageTab, eIndex, "speed", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded p-0.5 text-center font-mono mt-0.5"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
