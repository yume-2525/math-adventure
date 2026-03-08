import React from 'react';
import type { StageConfig, ScoreData } from '../types';
import { getRankColor } from '../utils/styleHelper';

interface StageSelectScreenProps {
  stages: StageConfig[];
  onStageSelect: (stage: StageConfig) => void;
  onBackToAreaSelect: () => void;
  bestScores: Record<string, ScoreData>;
  /** 今日のミッションに含まれるステージID一覧（バッジ・枠線表示用） */
  todayMissionStageIds?: number[];
  /** 今日のミッションのうちクリア済みのステージID一覧（クリア表示用） */
  completedMissionStageIds?: number[];
}

const StageSelectScreen: React.FC<StageSelectScreenProps> = ({
  stages,
  onStageSelect,
  onBackToAreaSelect,
  bestScores,
  todayMissionStageIds = [],
  completedMissionStageIds = [],
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <h1 className="text-4xl font-bold mb-8">ステージを選んでね</h1>
      <div className="space-y-4">
        {stages.map((stage) => {
          const scoreData = bestScores[stage.id];
          const bestScore = scoreData?.bestScore ?? 0;
          const isMission = todayMissionStageIds.includes(stage.id);
          const isMissionCleared = isMission && completedMissionStageIds.includes(stage.id);

          let bestRank: string | undefined;
          if (bestScore >= 9000) bestRank = 'S';
          else if (bestScore >= 7500) bestRank = 'A';
          else if (bestScore >= 5000) bestRank = 'B';
          else if (bestScore >= 2500) bestRank = 'C';
          else if (bestScore > 0) bestRank = 'D';

          const buttonClass = isMissionCleared
            ? 'relative w-80 p-4 rounded-lg shadow-md hover:bg-green-50 transition-colors flex justify-between items-center text-left pt-6 bg-green-50/80 ring-2 ring-green-500 border-2 border-green-500'
            : isMission
              ? 'relative w-80 bg-white p-4 rounded-lg shadow-md hover:bg-blue-100 transition-colors flex justify-between items-center text-left ring-2 ring-yellow-400 border-2 border-yellow-400 pt-6'
              : 'relative w-80 bg-white p-4 rounded-lg shadow-md hover:bg-blue-100 transition-colors flex justify-between items-center text-left';

          return (
            <button
              key={stage.id}
              onClick={() => onStageSelect(stage)}
              className={buttonClass}
            >
              {isMissionCleared && (
                <span className="absolute top-1 right-2 text-xs font-bold bg-green-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5" title="ミッションクリア">
                  ✓ クリア
                </span>
              )}
              {isMission && !isMissionCleared && (
                <span className="absolute top-1 right-2 text-xs font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded" title="今日のミッション">
                  🎯 MISSION
                </span>
              )}
              <span className={`text-xl font-bold whitespace-pre-line ${isMissionCleared ? 'text-green-800' : ''}`}>
                {stage.name.replace('：', '：\n')}
              </span>
              {bestRank && (
                <div className="text-sm font-bold">
                  <span>BEST: </span>
                  <span className={`text-lg ${getRankColor(bestRank)}`}>{bestRank}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onBackToAreaSelect}
        className="mt-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
      >
        エリア選択へ
      </button>
    </div>
  );
};

export default StageSelectScreen;