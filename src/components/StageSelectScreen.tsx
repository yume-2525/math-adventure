import React from 'react';
import type { StageConfig } from '../types';

interface StageSelectScreenProps {
  stages: StageConfig[];
  onStageSelect: (stage: StageConfig) => void;
  onBackToStart: () => void; // スタート画面に戻るための関数
}

const StageSelectScreen: React.FC<StageSelectScreenProps> = ({ stages, onStageSelect, onBackToStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">ステージを選んでね</h1>
      <div className="space-y-4">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onStageSelect(stage)}
            className="w-80 bg-white text-xl font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors"
          >
            {stage.name}
          </button>
        ))}
      </div>
      <button
        onClick={onBackToStart}
        className="mt-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
      >
        スタートに戻る
      </button>
    </div>
  );
};

export default StageSelectScreen;