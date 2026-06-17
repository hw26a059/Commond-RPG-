/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LogEntry } from "../types";

interface LogViewProps {
  logs: LogEntry[];
}

export default function LogView({ logs }: LogViewProps) {
  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "DAMAGE":
        return "text-red-400 border-l-2 border-red-600 bg-red-950/10";
      case "HEAL":
        return "text-emerald-400 border-l-2 border-emerald-600 bg-emerald-950/10";
      case "EVENT":
        return "text-amber-400 border-l-2 border-amber-500 bg-amber-950/10 font-bold";
      case "SYSTEM":
        return "text-indigo-400 border-l-2 border-indigo-500 bg-indigo-950/10";
      default:
        return "text-slate-300 border-l-2 border-slate-700 bg-slate-900/10";
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-2">
      <div className="flex justify-between items-center text-3xs text-slate-500 border-b border-slate-850 pb-1 mb-1">
        <span className="font-mono uppercase tracking-wider">Battle Chronology</span>
        <span className="font-sans font-medium">戦闘ログ</span>
      </div>

      <div className="space-y-1 min-h-[90px] flex flex-col justify-end">
        {logs.length === 0 ? (
          <div className="text-3xs text-slate-650 italic text-center py-4">
            ログがありません。コマンドを発動すると戦闘推移が出力されます。
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-1 px-2 rounded text-3xs select-none break-all font-sans leading-tight transition-all duration-300 ${getLogTypeColor(
                log.type
              )}`}
            >
              {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
