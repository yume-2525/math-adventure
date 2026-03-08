import React, { useState, useEffect, useMemo } from 'react';
import AreaProgressGauge from './AreaProgressGauge';
import HatchingAnimation from './HatchingAnimation';
import type { AreaConfig } from '../types/game';
import type { ScoreData } from '../utils/scoreStorage';
import { calculateAreaProgress, isFirstTimeCompletion } from '../utils/areaProgress';
import { areas as areasConfig, getStageById, getAreaIdByStageId } from '../constants/areas';
import {
  getTodayMissionStageIds,
  generateDailyMissions,
  saveDailyMissions,
  CLEARED_RANK_MIN_SCORE,
} from '../utils/dailyMission';
import { loadProgress, feedPartner, getTodayKey, setTodayAiMessage } from '../utils/progressStorage';
import { generateLearningReport } from '../utils/learningAnalytics.ts';
import { getDinoAdvice } from '../utils/aiAdvisor';
import PartnerDino from './PartnerDino';

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
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const dailyMissionData = useMemo(() => {
    const allStages = areasConfig.flatMap((a) => a.stages);
    const clearedStages = allStages
      .filter((s) => (bestScores[s.id]?.bestScore ?? 0) >= CLEARED_RANK_MIN_SCORE)
      .map((s) => ({ stage: s, difficulty: s.difficulty ?? 1 }));

    let todayIds = getTodayMissionStageIds();
    if (!todayIds?.length && clearedStages.length > 0) {
      const generated = generateDailyMissions(clearedStages);
      if (generated.length > 0) {
        saveDailyMissions(generated.map((s) => s.id));
        todayIds = generated.map((s) => s.id);
      }
    }
    const missionStages = (todayIds ?? [])
      .map((id) => getStageById(id))
      .filter((s): s is NonNullable<typeof s> => s != null);
    const progress = loadProgress();
    const completedStageIds = progress.dailyMissionProgress.completedStageIds;
    const completedCount = (todayIds ?? []).filter((id) => completedStageIds.includes(id)).length;
    const isFed = progress.lastFedDate === getTodayKey();

    const partnerAreaId = progress.partnerId;

    const todayMissionStageIds = todayIds ?? [];
    const todayAiMessage = progress.todayAiMessageDate === getTodayKey() ? progress.todayAiMessage : null;

    return {
      missionStages,
      completedCount,
      totalCount: missionStages.length,
      completedStageIds,
      isFed,
      partnerAreaId,
      todayMissionStageIds,
      todayAiMessage,
    };
  }, [bestScores, areas, refreshTrigger]);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="w-full max-w-md mb-4 space-y-3">
          <PartnerDino
            areaId={dailyMissionData.partnerAreaId}
            completedCount={dailyMissionData.completedCount}
            isFedToday={dailyMissionData.isFed}
            isAiLoading={isAiLoading}
            aiMessage={dailyMissionData.todayAiMessage}
            onFeed={async () => {
              const ok = feedPartner();
              if (!ok) return;
              setRefreshTrigger((t) => t + 1);
              setIsAiLoading(true);
              try {
                const report = generateLearningReport(
                  dailyMissionData.completedStageIds,
                  bestScores,
                  dailyMissionData.todayMissionStageIds
                );
                const partnerName = areas.find((a) => a.id === dailyMissionData.partnerAreaId)?.name ?? '相棒';
                const message = await getDinoAdvice(report, partnerName);
                setTodayAiMessage(message);
              } finally {
                setIsAiLoading(false);
                setRefreshTrigger((t) => t + 1);
              }
            }}
          />
          {dailyMissionData.totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-sm font-bold text-amber-900 whitespace-nowrap">
                今日のミッション: {dailyMissionData.completedCount}/{dailyMissionData.totalCount}
              </span>
              <div className="flex-1 w-full min-w-0 h-4 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${dailyMissionData.totalCount ? (dailyMissionData.completedCount / dailyMissionData.totalCount) * 100 : 0}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setMissionModalOpen(true)}
                className="text-sm font-bold py-1.5 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 whitespace-nowrap"
              >
                くわしく
              </button>
            </div>
          )}
        </div>

        {/* ミッション詳細モーダル */}
        {missionModalOpen && dailyMissionData.totalCount > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setMissionModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="今日のミッション詳細"
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-amber-900">今日のミッション</h2>
                <button
                  type="button"
                  onClick={() => setMissionModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>
              <ul className="p-4 overflow-y-auto space-y-2">
                {dailyMissionData.missionStages.map((stage) => {
                  const done = dailyMissionData.completedStageIds.includes(stage.id);
                  const areaId = getAreaIdByStageId(stage.id);
                  return (
                    <li key={stage.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (areaId) {
                            setMissionModalOpen(false);
                            onAreaSelect(areaId);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors whitespace-pre-line ${done ? 'bg-amber-50 text-amber-700 border-amber-200 line-through' : 'bg-gray-50 hover:bg-amber-50 border-gray-200'}`}
                      >
                        <span className="font-bold">{done ? '✓ ' : '○ '}</span>
                        {stage.name.replace('：', '：\n')}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
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
