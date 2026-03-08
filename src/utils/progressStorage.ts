/**
 * デイリーミッション・相棒など進捗データの永続化
 * localStorage に保存し、ランク・バッジ・相棒システムの基盤とする
 */

export interface DailyMissionProgress {
  /** その日のミッションでクリア済みのステージID一覧 */
  completedStageIds: number[];
}

export interface GameProgress {
  /** 累計スタンプ数（デイリーミッション全クリアで+1） */
  dailyStamps: number;
  /** 最後にデイリーミッションを達成した日付 (YYYY-MM-DD) */
  lastCompletedDate: string | null;
  /** 今日のデイリーミッションのクリア状況 */
  dailyMissionProgress: DailyMissionProgress;
  /** dailyMissionProgress が有効な日付 (YYYY-MM-DD)。違う日なら進捗は無効 */
  dailyMissionProgressDate: string | null;
  /** 現在選んでいる相棒のエリアID。デフォルトは 'area1' */
  partnerId: string;
  /** 累計の好感度 */
  affectionScore: number;
  /** 最後にエサをあげた日付 (YYYY-MM-DD)。1日1回まで */
  lastFedDate: string | null;
  /** 今日生成されたAIのセリフ（日付が変わったら無効） */
  todayAiMessage: string | null;
  /** todayAiMessage が有効な日付 (YYYY-MM-DD) */
  todayAiMessageDate: string | null;
}

const STORAGE_KEY = 'mathBattleProgress';

const DEFAULT_PROGRESS: GameProgress = {
  dailyStamps: 0,
  lastCompletedDate: null,
  dailyMissionProgress: { completedStageIds: [] },
  dailyMissionProgressDate: null,
  partnerId: 'area1',
  affectionScore: 0,
  lastFedDate: null,
  todayAiMessage: null,
  todayAiMessageDate: null,
};

export function loadProgress(): GameProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(data) as Partial<GameProgress>;
    const today = getTodayKey();
    const progressDate = parsed.dailyMissionProgressDate ?? null;
    const missionProgress = progressDate === today && parsed.dailyMissionProgress
      ? { completedStageIds: parsed.dailyMissionProgress.completedStageIds }
      : { completedStageIds: [] as number[] };

    return {
      dailyStamps: parsed.dailyStamps ?? 0,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
      dailyMissionProgress: missionProgress,
      dailyMissionProgressDate: progressDate === today ? today : null,
      partnerId: typeof parsed.partnerId === 'string' ? parsed.partnerId : 'area1',
      affectionScore: parsed.affectionScore ?? 0,
      lastFedDate: parsed.lastFedDate ?? null,
      todayAiMessage: parsed.todayAiMessageDate === today ? (parsed.todayAiMessage ?? null) : null,
      todayAiMessageDate: parsed.todayAiMessageDate === today ? today : null,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

/** 今日の日付を YYYY-MM-DD で返す */
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 今日すでにエサをあげたか */
export function isFedToday(): boolean {
  const progress = loadProgress();
  return progress.lastFedDate === getTodayKey();
}

/** 相棒にエサをあげる（1日1回まで。好感度+10） */
export function feedPartner(): boolean {
  const progress = loadProgress();
  const today = getTodayKey();
  if (progress.lastFedDate === today) return false;
  progress.lastFedDate = today;
  progress.affectionScore = (progress.affectionScore ?? 0) + 10;
  saveProgress(progress);
  return true;
}

/** 今日のAIセリフを保存する（日付も一緒に保存し、その日だけ使い回す） */
export function setTodayAiMessage(message: string): void {
  const progress = loadProgress();
  const today = getTodayKey();
  progress.todayAiMessage = message;
  progress.todayAiMessageDate = today;
  saveProgress(progress);
}
