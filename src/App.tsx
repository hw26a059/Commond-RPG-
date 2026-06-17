/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character, Enemy, StageData, LogEntry, Skill, ElementType, StatusEffect } from "./types";
import { INITIAL_CHARACTERS, DEFAULT_STAGES } from "./data/defaultStages";
import Editor from "./components/Editor";
import Battlefield from "./components/Battlefield";
import CommandSelector from "./components/CommandSelector";
import EventBanner from "./components/EventBanner";
import LogView from "./components/LogView";

export default function App() {
  // ステート。エディターで編集・保存できるように、ローカルストレージに保持する
  const [characters, setCharacters] = useState<Character[]>(() => {
    const local = localStorage.getItem("rpg_edited_chars");
    return local ? JSON.parse(local) : JSON.parse(JSON.stringify(INITIAL_CHARACTERS));
  });

  const [stages, setStages] = useState<StageData[]>(() => {
    const local = localStorage.getItem("rpg_edited_stages");
    return local ? JSON.parse(local) : JSON.parse(JSON.stringify(DEFAULT_STAGES));
  });

  // 戦闘用の現在ステータス（進行型ステート）
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [liveCharacters, setLiveCharacters] = useState<Character[]>([]);
  const [liveEnemies, setLiveEnemies] = useState<Enemy[]>([]);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>("");

  // 現在のターン
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [currentEvent, setCurrentEvent] = useState<string>("");
  const [eventTurnsRemaining, setEventTurnsRemaining] = useState<number>(0);

  // コマンド選択状態
  const [selections, setSelections] = useState<{
    [charId: string]: {
      skillA: Skill;
      skillB: Skill;
      useUnique: boolean;
    };
  }>({});

  // ログ (最大5件)
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // ポップアップエフェクト
  const [damageEffects, setDamageEffects] = useState<{
    [key: string]: { amount: number; isCrit: boolean; id: string };
  }>({});

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [battleStatus, setBattleStatus] = useState<"READY" | "RESOLVING" | "GAMEOVER" | "VICTORY">("READY");

  // 戦闘ステージ開始時のロード
  useEffect(() => {
    initializeBattleForStage(activeStageIdx);
  }, [activeStageIdx, stages]);

  const initializeBattleForStage = (stageIdx: number) => {
    if (stageIdx >= stages.length) {
      setBattleStatus("VICTORY");
      return;
    }

    // プレイヤーのHP・MP・SPなどを初期化または引き継ぎ
    // ステージ1のときは全回復、以降は引き継ぐ（デッド状態であっても、次ステージで小回復する安全仕様）
    const nextChars = characters.map((c) => {
      const match = liveCharacters.find((lc) => lc.id === c.id);
      if (match && match.hp > 0 && stageIdx > 0) {
        // ステージ間の引き継ぎ。ただしSPは引き継ぎ、MPも持続
        return {
          ...c,
          hp: match.hp,
          mp: match.mp,
          sp: Math.min(c.maxSp, match.sp + 15), // 次ステージボーナスでSP少し回復
          statusEffects: []
        };
      }
      return {
        ...c,
        hp: c.maxHp,
        mp: c.maxMp,
        sp: 0,
        statusEffects: []
      };
    });

    const targetStage = stages[stageIdx];
    const nextEnemies = JSON.parse(JSON.stringify(targetStage.enemies)) as Enemy[];

    setLiveCharacters(nextChars);
    setLiveEnemies(nextEnemies);
    
    // 生きている敵を選択
    const firstAlive = nextEnemies.find(e => e.hp > 0);
    if (firstAlive) {
      setSelectedEnemyId(firstAlive.id);
    }

    // コマンド初期化
    const nextSels: typeof selections = {};
    nextChars.forEach((c) => {
      // 技A: 物理攻撃, 技B: 各自の2番目の技
      nextSels[c.id] = {
        skillA: c.skills[0],
        skillB: c.skills[1] || c.skills[0],
        useUnique: false
      };
    });
    setSelections(nextSels);

    setCurrentTurn(1);
    setCurrentEvent("");
    setEventTurnsRemaining(0);
    setBattleStatus("READY");

    const stgText = `「${targetStage.name}」戦闘ロード完了！コマンドを選択して下さい。`;
    addLog(stgText, "SYSTEM");
  };

  // ログ追加関数 (直近5行制限)
  const addLog = (text: string, type: LogEntry["type"]) => {
    const newEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      text,
      type
    };
    setLogs((prev) => {
      const updated = [...prev, newEntry];
      if (updated.length > 5) {
        return updated.slice(updated.length - 5);
      }
      return updated;
    });
  };

  // エディターから保存
  const handleSaveEditorData = (updatedChars: Character[], updatedStages: StageData[]) => {
    localStorage.setItem("rpg_edited_chars", JSON.stringify(updatedChars));
    localStorage.setItem("rpg_edited_stages", JSON.stringify(updatedStages));
    setCharacters(updatedChars);
    setStages(updatedStages);
    setIsEditorOpen(false);
    
    // 現在のステージを初期化
    setTimeout(() => {
      initializeBattleForStage(activeStageIdx);
    }, 100);
  };

  // プリセットデータの完全リセット・初期設定
  const handleResetPresets = () => {
    localStorage.removeItem("rpg_edited_chars");
    localStorage.removeItem("rpg_edited_stages");
    setCharacters(JSON.parse(JSON.stringify(INITIAL_CHARACTERS)));
    setStages(JSON.parse(JSON.stringify(DEFAULT_STAGES)));
    setIsEditorOpen(false);

    setTimeout(() => {
      initializeBattleForStage(0);
    }, 100);
  };

  // スキル選択反映
  const handleSelectSkill = (charId: string, slot: "skillA" | "skillB", skill: Skill) => {
    setSelections((prev) => ({
      ...prev,
      [charId]: {
        ...prev[charId],
        [slot]: skill
      }
    }));
  };

  // 固有スキル切り替え
  const handleToggleUnique = (charId: string) => {
    setSelections((prev) => {
      const current = prev[charId];
      if (!current) return prev;
      return {
        ...prev,
        [charId]: {
          ...current,
          useUnique: !current.useUnique
        }
      };
    });
  };

  // 属性相性判定(火＜水、 水＜風、 風＜火)
  const getElementalMultiplier = (atkEl: ElementType, defEl: ElementType): number => {
    if (atkEl === "NONE" || defEl === "NONE") return 1.0;

    if (atkEl === "FIRE" && defEl === "WIND") return 1.6;
    if (atkEl === "WIND" && defEl === "WATER") return 1.6;
    if (atkEl === "WATER" && defEl === "FIRE") return 1.6;

    if (atkEl === "FIRE" && defEl === "WATER") return 0.6;
    if (atkEl === "WATER" && defEl === "WIND") return 0.6;
    if (atkEl === "WIND" && defEl === "FIRE") return 0.6;

    return 1.0;
  };

  // ダメージ演出ポップアップ登録
  const triggerDamagePop = (targetId: string, amount: number, isCrit: boolean) => {
    setDamageEffects((prev) => ({
      ...prev,
      [targetId]: { amount, isCrit, id: `${Date.now()}_${Math.random()}` }
    }));

    setTimeout(() => {
      setDamageEffects((prev) => {
        const next = { ...prev };
        delete next[targetId];
        return next;
      });
    }, 1500);
  };

  // 突発イベントの決定
  const triggerRandomEvent = () => {
    const events = [
      "防御崩壊",
      "火の昂り（属性活性）",
      "水の昂り（属性活性）",
      "風の昂り（属性活性）",
      "火の静寂（属性減退）",
      "水の静寂（属性減退）",
      "風の静寂（属性減退）",
      "力、集いし時"
    ];
    const chosen = events[Math.floor(Math.random() * events.length)];
    setCurrentEvent(chosen);
    setEventTurnsRemaining(3);

    addLog(`📢 【突発フィールドイベント発生!!】：『${chosen}』が戦場を包む！（3ターン持続）`, "EVENT");
  };

  // ターン同時発動・処理ロジック
  const handleExecuteTurn = () => {
    if (battleStatus !== "READY") return;
    setBattleStatus("RESOLVING");

    // 3の倍数ターン時のイベント処理
    let activeEventNow = currentEvent;
    let eventTurnsLeft = eventTurnsRemaining;

    if (currentTurn > 1 && currentTurn % 3 === 0) {
      triggerRandomEvent();
      // これをローカル変数でも同期
      const events = [
        "防御崩壊",
        "火の昂り（属性活性）",
        "水の昂り（属性活性）",
        "風の昂り（属性活性）",
        "火の静寂（属性減退）",
        "水の静寂（属性減退）",
        "風の静寂（属性減退）",
        "力、集いし時"
      ];
      activeEventNow = events[Math.floor(Math.random() * events.length)];
      eventTurnsLeft = 3;
      setCurrentEvent(activeEventNow);
      setEventTurnsRemaining(eventTurnsLeft);
    } else if (eventTurnsLeft > 0) {
      eventTurnsLeft -= 1;
      setEventTurnsRemaining(eventTurnsLeft);
      if (eventTurnsLeft === 0) {
        setCurrentEvent("");
        addLog("📢 フィールド特性イベントの効果が消失しました。", "SYSTEM");
        activeEventNow = "";
      }
    }

    // 処理中の生存アクターをコピー
    const currentChars = [...liveCharacters];
    const currentEnemies = [...liveEnemies];

    // キャラクターたちの行動構築および消費コストのバリデーションチェック
    // 順番を決めるためにスピード順に並べる
    const turnOrder: { id: string; type: "CHAR" | "ENEMY"; speed: number }[] = [];

    // 生きていてスタンされていないキャラ
    currentChars.forEach((c) => {
      if (c.hp > 0) {
        turnOrder.push({ id: c.id, type: "CHAR", speed: c.speed });
      }
    });

    currentEnemies.forEach((e) => {
      if (e.hp > 0) {
        turnOrder.push({ id: e.id, type: "ENEMY", speed: e.speed });
      }
    });

    // スピード順降順
    turnOrder.sort((a, b) => b.speed - a.speed);

    // キャラクターごとのログを一挙に出力するために溜めておく
    let actionLogLines: { text: string; type: LogEntry["type"] }[] = [];

    turnOrder.forEach((actor) => {
      // 途中で全滅しているか判定
      const aliveChars = currentChars.filter(c => c.hp > 0);
      const aliveEnemies = currentEnemies.filter(e => e.hp > 0);
      if (aliveChars.length === 0 || aliveEnemies.length === 0) return;

      if (actor.type === "CHAR") {
        const charIdx = currentChars.findIndex(c => c.id === actor.id);
        const char = currentChars[charIdx];
        if (char.hp <= 0) return;

        // スタンの確認
        const isStunned = char.statusEffects.some(ef => ef.type === "STAN");
        if (isStunned) {
          actionLogLines.push({
            text: `💤 【${char.name}】はスタン状態のため、コマンドを実行できなかった。`,
            type: "NORMAL"
          });
          return;
        }

        const sel = selections[char.id];
        if (!sel) return;

        // MP制限チェック
        let totalMpCost = 0;
        let chosenA = sel.skillA;
        let chosenB = sel.skillB;

        if (char.mp < chosenA.mpCost) {
          // 技Aすら発動できない場合：通常「物理攻撃」にフォールバック
          chosenA = char.skills[0]; 
        }
        totalMpCost += chosenA.mpCost;

        if (char.mp < totalMpCost + chosenB.mpCost) {
          // 技Bが発動できない場合：通常「物理攻撃」にフォールバック
          chosenB = char.skills[0];
        }
        totalMpCost += chosenB.mpCost;

        // MP消費
        char.mp = Math.max(0, char.mp - totalMpCost);

        // 使用する技を確定
        const turnSkills = [chosenA, chosenB];

        // 固有能力SPチェック
        let useUniqueNow = sel.useUnique && char.sp >= char.uniqueSkill.spCost;
        if (useUniqueNow) {
          char.sp -= char.uniqueSkill.spCost;
        }

        // 行動の実行
        let totalDamageThisTurn = 0;
        let actionNamesUsed: string[] = [];
        let statusApplied: string[] = [];
        let healAmountApplied = 0;

        // 攻撃ターゲット決定：現在選択されている敵、または残っている生存敵
        let primaryTargetIdx = currentEnemies.findIndex(e => e.id === selectedEnemyId && e.hp > 0);
        if (primaryTargetIdx === -1) {
          primaryTargetIdx = currentEnemies.findIndex(e => e.hp > 0);
        }

        if (primaryTargetIdx === -1) return; // 敵がいない

        // 技を順次発動
        const applySkillEffects = (skill: Skill, isTrace = false) => {
          actionNamesUsed.push(skill.name);

          // 回復技の場合、または補助
          if (skill.type === "HEAL" || skill.type === "SUPPORT") {
            if (skill.target === "SINGLE_ALLY") {
              // HPが1番低くなっている味方を回復
              const sortedByHp = [...currentChars].filter(c => c.hp > 0).sort((x, y) => x.hp - y.hp);
              if (sortedByHp.length > 0) {
                const targetCharIdx = currentChars.findIndex(c => c.id === sortedByHp[0].id);
                const target = currentChars[targetCharIdx];
                const heal = char.ma + (useUniqueNow && char.id === "char_c" ? 100 : 50); // 集中で回復確定極大
                target.hp = Math.min(target.maxHp, target.hp + heal);
                healAmountApplied += heal;
                triggerDamagePop(target.id, heal, true);
              }
            } else if (skill.target === "ALL_ALLIES") {
              // 味方全員
              currentChars.forEach((target) => {
                if (target.hp > 0) {
                  let heal = Math.floor(char.ma * 0.5) + 30;
                  if (useUniqueNow && char.id === "char_c") {
                    heal = heal * 2; // 集中超会心による２倍ヒール
                  }
                  target.hp = Math.min(target.maxHp, target.hp + heal);
                  healAmountApplied += heal;
                  triggerDamagePop(target.id, heal, true);

                  // デバフの治療（霧散等）
                  if (skill.name === "霧散") {
                    target.statusEffects = target.statusEffects.filter(ef => ef.type === "STAN"); // スタン以外治療
                  }
                }
              });
            }
          } else {
            // 攻撃技の場合
            const targetId = currentEnemies[primaryTargetIdx].id;
            const enemy = currentEnemies[primaryTargetIdx];

            // 攻撃・防御力補正倍率
            let atkMultiplier = 1.0;
            let defMultiplier = 1.0;

            // 状態異常補正
            if (char.statusEffects.some(ef => ef.type === "ATK_DOWN")) {
              atkMultiplier *= 0.7; // 30%低下
            }
            if (enemy.statusEffects.some(ef => ef.type === "DEF_DOWN")) {
              defMultiplier *= 1.3; // 30%被ダメ上昇
            }
            if (enemy.statusEffects.some(ef => ef.type === "DECAY")) {
              defMultiplier *= 1.5; // 風化で1.5倍に激化
            }

            // フィールドイベント補正
            if (activeEventNow === "力、集いし時") {
              atkMultiplier *= 1.35;
            }
            if (activeEventNow === "防御崩壊") {
              defMultiplier *= 1.43; // 防御低下補正
            }

            // 属性相性計算
            let elemMultiplier = 1.0;
            if (skill.type === "ELEMENTAL") {
              elemMultiplier = getElementalMultiplier(skill.element, enemy.element);

              // 活性・減退フィールド
              if (activeEventNow === "火の昂り（属性活性）" && skill.element === "FIRE") {
                elemMultiplier *= 1.6;
              }
              if (activeEventNow === "水の昂り（属性活性）" && skill.element === "WATER") {
                elemMultiplier *= 1.6;
              }
              if (activeEventNow === "風の昂り（属性活性）" && skill.element === "WIND") {
                elemMultiplier *= 1.6;
              }

              if (activeEventNow === "火の静寂（属性減退）" && skill.element === "FIRE") {
                elemMultiplier *= 0.5;
              }
              if (activeEventNow === "水の静寂（属性減退）" && skill.element === "WATER") {
                elemMultiplier *= 0.5;
              }
              if (activeEventNow === "風の静寂（属性減退）" && skill.element === "WIND") {
                elemMultiplier *= 0.5;
              }
            }

            // 超会心（集中発動中）
            let isCrit = false;
            let critMultiplier = 1.0;
            if (useUniqueNow && char.id === "char_c") {
              isCrit = true;
              critMultiplier = 2.0; // 会心の2倍（基本の超会心）
            }

            // 敵全体か単体か
            if (skill.target === "ALL_ENEMIES") {
              currentEnemies.forEach((targetEnemy) => {
                if (targetEnemy.hp > 0) {
                  let individualDefMultiplier = defMultiplier;
                  if (targetEnemy.statusEffects.some(ef => ef.type === "DEF_DOWN")) individualDefMultiplier *= 1.3;
                  if (targetEnemy.statusEffects.some(ef => ef.type === "DECAY")) individualDefMultiplier *= 1.5;

                  const baseStat = skill.type === "PHYSICAL" ? char.pa : char.ma;
                  let dmg = Math.floor(
                    (baseStat * 0.4 - targetEnemy.pd * 0.1) * elemMultiplier * atkMultiplier * individualDefMultiplier * critMultiplier
                  );
                  dmg = Math.max(12, dmg + Math.floor(Math.random() * 5)); // 乱数と最低保障

                  targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
                  totalDamageThisTurn += dmg;
                  triggerDamagePop(targetEnemy.id, dmg, isCrit);
                }
              });
            } else {
              // 単体攻撃
              const baseStat = skill.type === "PHYSICAL" ? char.pa : char.ma;
              const enemyDef = skill.type === "PHYSICAL" ? enemy.pd : enemy.pd * 0.8; // 魔法は少し防御減算
              let dmg = Math.floor(
                (baseStat * 0.8 - enemyDef * 0.2) * elemMultiplier * atkMultiplier * defMultiplier * critMultiplier
              );
              dmg = Math.max(20, dmg + Math.floor(Math.random() * 8)); // 乱数と最低保障

              enemy.hp = Math.max(0, enemy.hp - dmg);
              totalDamageThisTurn += dmg;
              triggerDamagePop(enemy.id, dmg, isCrit);

              // 状態異常付与確率
              const roll = Math.random();
              if (skill.name === "唐竹割" && roll < 0.3) {
                const already = enemy.statusEffects.some(ef => ef.type === "DEF_DOWN");
                if (!already) {
                  enemy.statusEffects.push({ type: "DEF_DOWN", turns: 3 });
                  statusApplied.push("防御低下");
                }
              }
              if (skill.name === "急流" && roll < 0.3) {
                const already = enemy.statusEffects.some(ef => ef.type === "ATK_DOWN");
                if (!already) {
                  enemy.statusEffects.push({ type: "ATK_DOWN", turns: 3 });
                  statusApplied.push("攻撃力低下");
                }
              }
              if (skill.name === "熱破" && roll < 0.4) {
                const already = enemy.statusEffects.some(ef => ef.type === "BURN");
                if (!already) {
                  enemy.statusEffects.push({ type: "BURN", turns: 3 });
                  statusApplied.push("火傷");
                }
              }
              if (skill.name === "旋風" && roll < 0.6) {
                // 全体だが、ヒットした単体判定
                const already = enemy.statusEffects.some(ef => ef.type === "DECAY");
                if (!already) {
                  enemy.statusEffects.push({ type: "DECAY", turns: 3 });
                  statusApplied.push("風化");
                }
              }
              if (skill.name === "暴風" && roll < 0.25) {
                const already = enemy.statusEffects.some(ef => ef.type === "STAN");
                if (!already) {
                  enemy.statusEffects.push({ type: "STAN", turns: 3 });
                  statusApplied.push("スタン");
                }
              }
            }
          }
        };

        // 技A、技Bの適用
        turnSkills.forEach((sk) => applySkillEffects(sk, false));

        // トレース発動（キャラBの固有能力）：同じ行動をもう1回繰り返す
        if (useUniqueNow && char.id === "char_b") {
          actionNamesUsed.push(`[トレース発動]`);
          turnSkills.forEach((sk) => applySkillEffects(sk, true));
        }

        // 追撃発動（キャラAの固有能力）：総ダメージの80%
        let chaseDmg = 0;
        if (useUniqueNow && char.id === "char_a" && totalDamageThisTurn > 0) {
          chaseDmg = Math.floor(totalDamageThisTurn * 0.8);
          // 生きている敵に追撃
          const aliveEnemiesList = currentEnemies.filter(e => e.hp > 0);
          if (aliveEnemiesList.length > 0) {
            const chaseTarget = aliveEnemiesList[Math.floor(Math.random() * aliveEnemiesList.length)];
            chaseTarget.hp = Math.max(0, chaseTarget.hp - chaseDmg);
            triggerDamagePop(chaseTarget.id, chaseDmg, false);
            actionNamesUsed.push(`追撃`);
          }
        }

        // SPの蓄積・回復処理（1行動に依存：物理+15、属性/魔法/回復/補助+10）
        const getRecoverSp = (skill: Skill) => skill.type === "PHYSICAL" ? 15 : 10;
        const spEarned = getRecoverSp(chosenA) + getRecoverSp(chosenB);
        char.sp = Math.min(char.maxSp, char.sp + spEarned);

        // 1つのキャラクター行動結果を1行にまとめて一括表示
        let logText = `🛡️ [${char.name}] の行動：${actionNamesUsed.join(" ＋ ")}`;
        if (totalDamageThisTurn > 0) {
          logText += ` ➔ 敵に計 ${totalDamageThisTurn}ダメージ！`;
        }
        if (chaseDmg > 0) {
          logText += ` (追撃: ${chaseDmg}Dmg!)`;
        }
        if (healAmountApplied > 0) {
          logText += ` ➔ 味方を ${healAmountApplied} 回復！`;
        }
        if (statusApplied.length > 0) {
          logText += ` [${statusApplied.join(", ")}付与]`;
        }
        logText += ` (SP+${spEarned})`;

        actionLogLines.push({ text: logText, type: healAmountApplied > 0 ? "HEAL" : "DAMAGE" });

      } else {
        // 敵モンスターの行動
        const enemyIdx = currentEnemies.findIndex(e => e.id === actor.id);
        const enemy = currentEnemies[enemyIdx];
        if (enemy.hp <= 0) return;

        // スタンチェック
        const isStunned = enemy.statusEffects.some(ef => ef.type === "STAN");
        if (isStunned) {
          actionLogLines.push({
            text: `💤 【${enemy.name}】はスタン中で動けない！`,
            type: "NORMAL"
          });
          return;
        }

        // 攻撃するターゲットをランダムな生存味方から決定
        const aliveChars = currentChars.filter(c => c.hp > 0);
        if (aliveChars.length === 0) return;
        const targetChar = aliveChars[Math.floor(Math.random() * aliveChars.length)];

        // 敵の属性
        const enemyElement = enemy.element;
        // 味方の属性
        const targetElement = targetChar.element;

        // 属性相性判定
        let elemMultiplier = 1.0;
        if ((enemyElement === "FIRE" && targetElement === "WIND") || 
            (enemyElement === "WATER" && targetElement === "FIRE") || 
            (enemyElement === "WIND" && targetElement === "WATER")) {
          elemMultiplier = 1.5;
        } else if ((targetElement === "FIRE" && enemyElement === "WIND") || 
                   (targetElement === "WATER" && enemyElement === "FIRE") || 
                   (targetElement === "WIND" && enemyElement === "WATER")) {
          elemMultiplier = 0.5;
        }

        // アクティブイベントによる特定属性の昂り/静寂
        if (activeEventNow) {
          if (activeEventNow.includes("昂り") && activeEventNow.startsWith(enemyElement === "FIRE" ? "火" : enemyElement === "WATER" ? "水" : "風")) {
            elemMultiplier *= 1.6;
          }
          if (activeEventNow.includes("静寂") && activeEventNow.startsWith(enemyElement === "FIRE" ? "火" : enemyElement === "WATER" ? "水" : "風")) {
            elemMultiplier *= 0.5;
          }
        }

        // バフ・デバフ効果
        let atkMultiplier = 1.0;
        let defMultiplier = 1.0;

        // イベント効果
        if (activeEventNow === "防御崩壊") {
          defMultiplier *= 0.7;
        }
        if (activeEventNow === "激昂") {
          atkMultiplier *= 1.35;
        }

        // プレイヤー防御デバフ
        if (targetChar.statusEffects.some(ef => ef.type === "DEF_DOWN")) {
          defMultiplier *= 0.7;
        }
        if (targetChar.statusEffects.some(ef => ef.type === "DECAY")) {
          defMultiplier *= 0.5;
        }

        // 敵攻撃低下デバフ
        if (enemy.statusEffects.some(ef => ef.type === "ATK_DOWN")) {
          atkMultiplier *= 0.7;
        }

        // ダメージ計算
        const damageBase = (enemy.pa * atkMultiplier * 0.5) - (targetChar.pd * defMultiplier * 0.1);
        let dmg = Math.floor(damageBase * elemMultiplier);
        dmg = Math.max(10, dmg + Math.floor(Math.random() * 5));

        // ダメージ適用
        targetChar.hp = Math.max(0, targetChar.hp - dmg);
        triggerDamagePop(targetChar.id, dmg, false);

        let effectAppliedStr = "";
        if (enemy.name === "嵐翼の有翼獣" && Math.random() < 0.3) {
          const already = targetChar.statusEffects.some(ef => ef.type === "DECAY");
          if (!already) {
            targetChar.statusEffects.push({ type: "DECAY", turns: 3 });
            effectAppliedStr = " (風化付与)";
          }
        }
        if (enemy.name.includes("タイダル") && Math.random() < 0.15) {
          const already = targetChar.statusEffects.some(ef => ef.type === "STAN");
          if (!already) {
            targetChar.statusEffects.push({ type: "STAN", turns: 1 });
            effectAppliedStr = " (スタン付与)";
          }
        }

        actionLogLines.push({
          text: `💀 【${enemy.name}】の攻撃：${targetChar.name} に ${dmg} の属性相性・物理ダメージ！${effectAppliedStr}`,
          type: "NORMAL"
        });
      }
    });

    // 状態異常スリップダメージ（火傷など）と持続ターンの減少処理
    // プレイヤー側
    currentChars.forEach((c) => {
      if (c.hp > 0) {
        // 火傷スリップ (最大HPの10%か)
        if (c.statusEffects.some(ef => ef.type === "BURN")) {
          const burnDmg = Math.floor(c.maxHp * 0.1);
          c.hp = Math.max(1, c.hp - burnDmg);
          actionLogLines.push({ text: `🔥 ${c.name} は火傷により ${burnDmg} スリップダメージを受けた！`, type: "NORMAL" });
        }

        // デバフのターン進行
        c.statusEffects = c.statusEffects
          .map((ef) => ({ ...ef, turns: ef.turns - 1 }))
          .filter((ef) => ef.turns > 0);
      }
    });

    // 敵側
    currentEnemies.forEach((e) => {
      if (e.hp > 0) {
        if (e.statusEffects.some(ef => ef.type === "BURN")) {
          const burnDmg = Math.floor(e.maxHp * 0.1);
          e.hp = Math.max(0, e.hp - burnDmg);
          actionLogLines.push({ text: `🔥 敵 ${e.name} は火傷により ${burnDmg} スリップダメージを受けた！`, type: "NORMAL" });
        }

        // ターン減少
        e.statusEffects = e.statusEffects
          .map((ef) => ({ ...ef, turns: ef.turns - 1 }))
          .filter((ef) => ef.turns > 0);
      }
    });

    // ログにプッシュ
    actionLogLines.forEach((line) => {
      addLog(line.text, line.type);
    });

    // 生存判定
    const nextAliveChars = currentChars.filter(c => c.hp > 0);
    const nextAliveEnemies = currentEnemies.filter(e => e.hp > 0);

    setLiveCharacters(currentChars);
    setLiveEnemies(currentEnemies);

    // 勝利・敗北判定
    if (nextAliveChars.length === 0) {
      setBattleStatus("GAMEOVER");
      addLog("❌ 全員が戦闘不能になりました。ゲームオーバー！エディターからステータスを補正して再挑戦できます。", "SYSTEM");
    } else if (nextAliveEnemies.length === 0) {
      if (activeStageIdx === stages.length - 1) {
        setBattleStatus("VICTORY");
        addLog("🎉 混沌の支配者を討伐しました！完全勝利です！すべてのステージをクリアしました！", "EVENT");
      } else {
        setBattleStatus("VICTORY");
        addLog("🏁 ステージのすべての敵を倒しました！次のエリアへ進めます。", "EVENT");
      }
    } else {
      // 継続。次ターンへ
      setCurrentTurn(prev => prev + 1);
      setBattleStatus("READY");

      // 死んだターゲット解除と自動再選択
      const isCurrentTargetAlive = nextAliveEnemies.some(e => e.id === selectedEnemyId);
      if (!isCurrentTargetAlive && nextAliveEnemies.length > 0) {
        setSelectedEnemyId(nextAliveEnemies[0].id);
      }
    }
  };

  // 次のステージに進む
  const handleNextStage = () => {
    if (activeStageIdx < stages.length - 1) {
      setActiveStageIdx(prev => prev + 1);
    }
  };

  // 最初からやり直す
  const handleRestartBattle = () => {
    setActiveStageIdx(0);
    initializeBattleForStage(0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/30">
      {/* 最小ヘッダー：エディット切り替え、リセット */}
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-1.5 flex justify-between items-center shadow-md relative z-30">
        <div className="flex items-center space-x-2">
          <span className="text-amber-500 text-xs">✦</span>
          <h1 className="text-xs font-bold tracking-tight text-slate-300">
            ３すくみ戦略コマンドRPG 
          </h1>
          <span className="text-4xs font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
            SPEC V1.0
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-755 text-amber-400 border border-amber-800/20 rounded text-3xs transition duration-200 shadow-sm flex items-center space-x-0.5 animate-none"
          >
            <span>🔧 パラメータ調整</span>
          </button>
          <button
            onClick={handleResetPresets}
            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-red-800/50 hover:text-red-400 text-slate-400 rounded text-3xs transition duration-200 animate-none"
          >
            初期化
          </button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 py-2 space-y-3">
        {isEditorOpen ? (
          <Editor
            characters={characters}
            stages={stages}
            onSave={handleSaveEditorData}
            onClose={() => setIsEditorOpen(false)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            
            {/* 左・中側：戦闘ステージと攻撃司令塔 */}
            <div className="lg:col-span-2 space-y-2">
              {/* アクティブ突発イベント */}
              <EventBanner currentEvent={currentEvent} turnsRemaining={eventTurnsRemaining} />

              {/* ビジュアル・ステージ */}
              <Battlefield
                stageName={stages[activeStageIdx]?.name || "最終エリア"}
                characters={liveCharacters}
                enemies={liveEnemies}
                selectedEnemyId={selectedEnemyId}
                onSelectEnemy={setSelectedEnemyId}
                damageEffects={damageEffects}
              />

              {/* スロット構築システム */}
              <CommandSelector
                characters={liveCharacters}
                selections={selections}
                onSelectSkill={handleSelectSkill}
                onToggleUnique={handleToggleUnique}
                onExecuteTurn={handleExecuteTurn}
                battleStatus={battleStatus}
              />
            </div>

            {/* 右側：戦闘ログ、ステータス、進行コントローラー */}
            <div className="space-y-3">
              
              {/* 情報ログビュー */}
              <LogView logs={logs} />

              {/* 面クリア時のプログレッション */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                  <span className="text-4xs font-mono text-slate-500 uppercase tracking-widest">TURN PROGRESS</span>
                  <span className="text-3xs font-bold text-slate-300">バトル進行盤</span>
                </div>

                <div className="flex justify-between text-3xs items-center font-mono">
                  <span className="text-slate-400">現在の戦闘ターン</span>
                  <span className="text-amber-500 font-bold border border-amber-900/35 px-2 py-0.5 bg-slate-900 rounded">
                    第 {currentTurn} ターン
                  </span>
                </div>

                {battleStatus === "GAMEOVER" && (
                  <div className="p-2.5 bg-red-950/30 border border-red-800/40 rounded text-center space-y-2.5">
                    <p className="text-3xs text-red-400 font-sans leading-relaxed">
                      味方が全滅しました。エディットモードで味方のパラメータを増大させてセーブ・ロードするか、最初から再挑戦してリベンジしてください！
                    </p>
                    <button
                      onClick={handleRestartBattle}
                      className="w-full bg-red-800 hover:bg-red-700 text-slate-100 font-bold py-1.5 rounded text-xs transition shadow-md"
                    >
                      リトライする
                    </button>
                  </div>
                )}

                {battleStatus === "VICTORY" && (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded text-center space-y-2.5">
                    <p className="text-3xs text-emerald-400 font-medium">
                      {activeStageIdx < stages.length - 1 ? "ステージをクリアしました！" : "すべての敵を打倒しました！クリアおめでとうございます！"}
                    </p>
                    {activeStageIdx < stages.length - 1 ? (
                      <button
                        onClick={handleNextStage}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded text-xs transition duration-200"
                      >
                        次のステージに進む ➔
                      </button>
                    ) : (
                      <button
                        onClick={handleRestartBattle}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded text-xs transition duration-200"
                      >
                        最初からやり直す（周回） ↺
                      </button>
                    )}
                  </div>
                )}

                {battleStatus === "READY" && (
                  <div className="text-3xs text-slate-500 leading-normal font-sans border-t border-slate-900 pt-2 bg-slate-950/40 rounded p-2">
                    💡 **攻略ヒント**: 3ターンごとの突発イベントを確認し、相性を活かしましょう。
                    SPゲージが溜まったら**固有能力トグル**を押して、大ダメージを狙えます。
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ミニフッター */}
      <footer className="border-t border-slate-850 bg-slate-950 py-1.5 text-center text-4xs text-slate-550 font-mono tracking-wider">
        THE 3-WAY ATTRIBUTE STRATEGY SYSTEM • SPECIFICATION SIMULATION RUNTIME • PREVIEW
      </footer>
    </div>
  );
}
