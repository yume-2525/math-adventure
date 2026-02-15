import type { AreaConfig } from '../types/game';
import type { ScoreData } from './scoreStorage';

/**
 * エリアの達成率を計算する
 * SまたはAランクを取得したステージ数を返す
 */
export function calculateAreaProgress(
  area: AreaConfig,
  scores: Record<string, ScoreData>
): { current: number; total: number } {
  const total = area.stages.length;
  let current = 0;

  area.stages.forEach((stage) => {
    const scoreData = scores[stage.id.toString()];
    if (scoreData && (scoreData.bestRank === 'S' || scoreData.bestRank === 'A')) {
      current++;
    }
  });

  return { current, total };
}

/**
 * エリアが100%達成されたかどうかを確認
 */
export function isAreaCompleted(
  area: AreaConfig,
  scores: Record<string, ScoreData>
): boolean {
  const { current, total } = calculateAreaProgress(area, scores);
  return current === total && total > 0;
}

/**
 * エリアが初めて100%達成されたかどうかを確認
 * （localStorageに記録を保存して管理）
 */
const COMPLETED_AREAS_KEY = 'mathBattleCompletedAreas';

export function isFirstTimeCompletion(
  areaId: string,
  area: AreaConfig,
  scores: Record<string, ScoreData>
): boolean {
  const isCompleted = isAreaCompleted(area, scores);
  if (!isCompleted) return false;

  try {
    const completedAreas = JSON.parse(localStorage.getItem(COMPLETED_AREAS_KEY) || '[]') as string[];
    if (completedAreas.includes(areaId)) {
      return false; // 既に達成済み
    }
    // 初めて達成した場合、記録を保存
    completedAreas.push(areaId);
    localStorage.setItem(COMPLETED_AREAS_KEY, JSON.stringify(completedAreas));
    return true;
  } catch (error) {
    console.error("Failed to check completion status", error);
    return false;
  }
}
