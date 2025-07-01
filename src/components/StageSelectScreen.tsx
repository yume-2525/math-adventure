import React from 'react';
import type { StageConfig, ScoreData } from '../types';
import { getRankColor } from '../utils/styleHelper';

interface StageSelectScreenProps {
  stages: StageConfig[];
  onStageSelect: (stage: StageConfig) => void;
  onBackToAreaSelect: () => void;
  bestScores: Record<string, ScoreData>;
}

const StageSelectScreen: React.FC<StageSelectScreenProps> = ({ stages, onStageSelect, onBackToAreaSelect, bestScores }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <h1 className="text-4xl font-bold mb-8">ステージを選んでね</h1>
      <div className="space-y-4">
        {stages.map((stage) => {
          const bestRank = bestScores[stage.id]?.bestRank;
          return (
            <button
              key={stage.id}
              onClick={() => onStageSelect(stage)}
              className="w-80 bg-white p-4 rounded-lg shadow-md hover:bg-blue-100 transition-colors flex justify-between items-center text-left"
            >
              <span className="text-xl font-bold">{stage.name}</span>
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