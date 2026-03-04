import React, { useState, useEffect } from 'react';
import AreaProgressGauge from './AreaProgressGauge';
import HatchingAnimation from './HatchingAnimation';
import type { AreaConfig } from '../types/game';
import type { ScoreData } from '../utils/scoreStorage';
import { calculateAreaProgress, isFirstTimeCompletion } from '../utils/areaProgress';

interface Area {
  id: string;
  name: string;
  config: AreaConfig;
}

interface AreaSelectScreenProps {
  areas: Area[];
  bestScores: Record<string, ScoreData>;
  onAreaSelect: (areaId: string) => void;
  onBackToStart: () => void;
}

const AreaSelectScreen: React.FC<AreaSelectScreenProps> = ({ 
  areas, 
  bestScores,
  onAreaSelect, 
  onBackToStart 
}) => {
  const [hatchingArea, setHatchingArea] = useState<Area | null>(null);

  // エリア選択画面に戻った時に、100%達成をチェック
  useEffect(() => {
    areas.forEach((area) => {
      if (isFirstTimeCompletion(area.config.id, area.config, bestScores)) {
        setHatchingArea(area);
      }
    });
  }, [areas, bestScores]);

  const handleHatchingComplete = () => {
    setHatchingArea(null);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
        <h1 className="text-4xl font-bold mb-8">どこへ冒険に行く？</h1>
        <div className="space-y-2 flex flex-col items-center">
          {areas.map((area) => {
            const { current, total } = calculateAreaProgress(area.config, bestScores);
            return (
              <div
                key={area.id}
                className="flex items-center gap-4 w-full max-w-md"
              >
                <AreaProgressGauge
                  current={current}
                  total={total}
                  areaImage={area.config.dinosaurImage}
                  areaId={area.id}
                  hideProgressText
                  large
                />
                <button
                  onClick={() => onAreaSelect(area.id)}
                  className="bg-white text-lg font-bold py-3 px-5 rounded-lg shadow-md hover:bg-blue-100 transition-colors text-center flex-1 min-w-[200px]"
                >
                  {area.name} ({current}/{total})
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={onBackToStart}
          className="mt-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
        >
          スタートに戻る
        </button>
      </div>

      {/* ハッチングアニメーション */}
      {hatchingArea && (
        <HatchingAnimation
          areaImage={hatchingArea.config.dinosaurImage}
          areaName={hatchingArea.config.name}
          areaId={hatchingArea.id}
          onComplete={handleHatchingComplete}
        />
      )}
    </>
  );
};

export default AreaSelectScreen;
