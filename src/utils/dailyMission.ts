/**
 * デイリーミッションの選出・保存ロジック
 * クリア済み（A/S）ステージから、難易度の合計が 12〜15 になるよう 5 つを選出する
 */

import type { StageConfig } from '../types/game';
import { loadProgress, saveProgress, getTodayKey } from './progressStorage';

const DAILY_MISSION_STORAGE_KEY = 'mathBattleDailyMissions';

/** A/S ランクのしきい値（このスコア以上でクリア済みとみなす） */
export const CLEARED_RANK_MIN_SCORE = 7500;

export interface DailyMissionEntry {
  date: string;
  stageIds: number[];
}

/** クリア済みステージ（A/S）の型: ステージ情報 + difficulty */
export interface ClearedStage {
  stage: StageConfig;
  difficulty: number;
}

const TARGET_DIFFICULTY_MIN = 12;
const TARGET_DIFFICULTY_MAX = 15;
const MISSION_COUNT = 5;
const MAX_ATTEMPTS = 100;

/**
 * クリア済みステージリストから、合計 difficulty が 12〜15 になるようランダムに 5 つ選出する
 */
export function generateDailyMissions(clearedStages: ClearedStage[]): StageConfig[] {
  if (clearedStages.length === 0) return [];
  if (clearedStages.length <= MISSION_COUNT) {
    return clearedStages.map((c) => c.stage).slice(0, MISSION_COUNT);
  }

  const stages = [...clearedStages];
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    shuffle(stages);
    const selected = stages.slice(0, MISSION_COUNT);
    const total = selected.reduce((sum, s) => sum + s.difficulty, 0);
    if (total >= TARGET_DIFFICULTY_MIN && total <= TARGET_DIFFICULTY_MAX) {
      return selected.map((s) => s.stage);
    }
  }

  const selected = stages.slice(0, MISSION_COUNT);
  return selected.map((s) => s.stage);
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 今日のデイリーミッションを取得する。
 * 既に今日の分が保存されていればそれを返し、なければ null（呼び出し側で生成して保存する）
 */
export function getStoredDailyMissions(): DailyMissionEntry | null {
  try {
    const raw = localStorage.getItem(DAILY_MISSION_STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as DailyMissionEntry;
    const today = getTodayKey();
    return entry.date === today ? entry : null;
  } catch {
    return null;
  }
}

/**
 * 今日のデイリーミッションを保存する。日付も一緒に保存するので、その日は同じミッションが表示される
 */
export function saveDailyMissions(stageIds: number[]): void {
  const entry: DailyMissionEntry = {
    date: getTodayKey(),
    stageIds,
  };
  try {
    localStorage.setItem(DAILY_MISSION_STORAGE_KEY, JSON.stringify(entry));
  } catch (e) {
    console.error('Failed to save daily missions', e);
  }
}

/**
 * 今日のミッション（ステージID配列）を取得する。
 * 保存済みならそのまま返し、未保存なら null
 */
export function getTodayMissionStageIds(): number[] | null {
  const entry = getStoredDailyMissions();
  return entry ? entry.stageIds : null;
}

/**
 * 指定ステージを「今日のミッションのクリア」として記録する
 */
export function markMissionStageCompleted(stageId: number): void {
  const progress = loadProgress();
  const completed = progress.dailyMissionProgress.completedStageIds;
  if (completed.includes(stageId)) return;
  progress.dailyMissionProgress = { completedStageIds: [...completed, stageId] };
  progress.dailyMissionProgressDate = getTodayKey();
  saveProgress(progress);
}

/**
 * 今日のミッションが全てクリアかどうか
 */
export function isTodayMissionAllCleared(): boolean {
  const stageIds = getTodayMissionStageIds();
  if (!stageIds || stageIds.length === 0) return false;
  const progress = loadProgress();
  const completed = progress.dailyMissionProgress.completedStageIds;
  return stageIds.every((id) => completed.includes(id));
}

/**
 * 今日のミッション進捗をリセット（日付が変わったときに呼ぶ想定）
 * 日付が変わったら dailyMissionProgress を空にする
 */
export function resetDailyMissionProgressIfNewDay(): void {
  const progress = loadProgress();
  const today = getTodayKey();
  if (progress.dailyMissionProgressDate !== today) {
    progress.dailyMissionProgress = { completedStageIds: [] };
    progress.dailyMissionProgressDate = today;
    saveProgress(progress);
  }
}

/**
 * デイリーミッション全クリア時にスタンプ加算・日付更新（1日1回まで）
 */
export function completeDailyMission(): void {
  const progress = loadProgress();
  const today = getTodayKey();
  if (progress.lastCompletedDate === today) return;
  progress.dailyStamps += 1;
  progress.lastCompletedDate = today;
  saveProgress(progress);
}

/** エリア別の性格に基づく相棒メッセージ */
const PARTNER_MESSAGES: Record<
  string,
  {
    /** 0/5: 冒険の誘い */
    invite: string;
    /** 1-4/5: 残りカウント別 [残り4,3,2,1] */
    encouragement: string[];
    /** 5/5 未給餌: お腹が空いたアピール */
    hungry: string;
    /** 5/5 給餌後: 満足・感謝 */
    fed: string[];
  }
> = {
  area1: {
    invite: 'きょうもいっしょにぼうけんしようね。がんばろうね。',
    encouragement: ['のこり4こだよ。ゆっくりいこうね。', 'のこり3こ。そのちょうしだよ。', 'のこり2こだよ。もう少しだね。', 'あと1こ！ さいごまでいっしょだよ。'],
    hungry: '5こぜんぶクリアだね、すごい……！ おなかすいちゃった、えさくれるとうれしいな。',
    fed: ['えさありがとう。おいしかったよ。またあしたもがんばろうね。', 'ごちそうさまでした。きもちがいっぱいだよ。'],
  },
  area2: {
    invite: 'のんびりいこうね。きょうもマイペースで。',
    encouragement: ['のこり4こ〜。あせらなくていいよ。', 'のこり3こ。そのままのテンポで。', 'のこり2こだ。もうすこし。', 'あと1こでえさのじかん〜。'],
    hungry: '5こおわった！ はらぺこだから、おにくちょうだい。',
    fed: ['おにくありがと。まいにちこれくらいだとたのしいね。', 'おいしかった。またれんしゅうがんばろ。'],
  },
  area3: {
    invite: 'ガオー！ きょうもいっしょにバトルだぜ！ がんばろう！',
    encouragement: ['のこり4こ！ もっといけるぜ！', 'のこり3こ！ ファイトファイト！', 'のこり2こ！ もうひとふんばりだ！', 'あと1こ！ ぜんりょくだ！'],
    hungry: '5こぜんぶクリア！ すごい！ えさくれればもっとやるきまんまんになるぜ！',
    fed: ['うまい！ えさありがとう！ 明日ももっといけるぜ！', 'ごちそうさま！ つよくなったきがする！'],
  },
  area4: {
    invite: '……きょうも、れんしゅうするんだね。期待してる。',
    encouragement: ['……のこり4こ。', '……のこり3こ。いける。', '……のこり2こ。あと少し。', '……あと1こ。頑張った。'],
    hungry: '……5こ、クリアか。えさ、もらえると……嬉しい。',
    fed: ['……ありがとう。満足だ。', '……ごちそうさま。……また、頑張ろう。'],
  },
  area5: {
    invite: 'ふしぎなきょうもはじまるね。いっしょにいこう。',
    encouragement: ['のこり4こ……みえる。', 'のこり3こ。うごいていい。', 'のこり2こ。ちかづいてる。', 'あと1こ……えさがまってる。'],
    hungry: '5こ……ぜんぶ、とおった。おなかが、ないている……えさを。',
    fed: ['えさ、おいしかった……ありがとう。', '……満たされた。また、あした。'],
  },
};

const DEFAULT_MESSAGES = PARTNER_MESSAGES.area1;

/**
 * 進捗と性格に応じた相棒のセリフを返す
 * @param areaId 相棒のエリアID（性格の決定）
 * @param completedCount 今日のミッションクリア数 (0〜5)
 * @param isFedToday 今日すでにエサをあげたか
 */
export function getPartnerMessage(areaId: string, completedCount: number, isFedToday: boolean): string {
  const m = PARTNER_MESSAGES[areaId] ?? DEFAULT_MESSAGES;

  if (completedCount >= 5 && isFedToday) {
    return m.fed[Math.floor(Math.random() * m.fed.length)];
  }
  if (completedCount >= 5) {
    return m.hungry;
  }
  if (completedCount === 0) {
    return m.invite;
  }
  const remaining = 5 - completedCount;
  const index = Math.max(0, 4 - remaining);
  return m.encouragement[index] ?? m.encouragement[0];
}

/** タップ時に表示するランダムなセリフ（可愛らしい・元気な一言） */
const RANDOM_CHATTER = [
  'なでなで してくれて ありがとう！',
  'ガオー！',
  'いっしょに ぼうけんしよう！',
  'さんすう 大好き！',
  'きょうも よろしくね！',
  'タップ してくれて うれしいな！',
  'えへへ、こちょばい！',
  'また れんしゅう がんばろ！',
  'きみ だいすき！',
  'ぴょこっ！',
];

export type ChatterStatus = 'idle' | 'fed';

/**
 * 恐竜タップ時に表示するランダムなセリフを返す
 * @param _areaId 相棒のエリアID（将来エリア別に変えたい場合用）
 * @param _status 'idle' | 'fed'（将来ステータス別に変えたい場合用）
 */
export function getRandomChatter(_areaId: string, _status: ChatterStatus): string {
  return RANDOM_CHATTER[Math.floor(Math.random() * RANDOM_CHATTER.length)];
}
