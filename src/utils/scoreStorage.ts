// 保存するスコアのデータ型
export interface ScoreData {
  bestScore: number;
  bestRank: string;
}

// 保存される全スコアのデータ型（キーはステージID）
type AllScores = Record<string, ScoreData>;

const STORAGE_KEY = 'mathBattleScores';

// localStorageから全スコアを読み込む関数
export const loadScores = (): AllScores => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load scores from localStorage", error);
    return {};
  }
};

// 新しいスコアを保存する関数
export const saveScore = (stageId: number, newScore: number, newRank: string) => {
  const allScores = loadScores();
  const currentBest = allScores[stageId];

  // これまでのベストスコアより高い場合、または記録がない場合のみ更新
  if (!currentBest || newScore > currentBest.bestScore) {
    allScores[stageId] = { bestScore: newScore, bestRank: newRank };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allScores));
    } catch (error) {
      console.error("Failed to save score to localStorage", error);
    }
  }
};