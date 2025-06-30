import type { Operator } from '../utils/generateProblem';

// バトルログ1行分の型定義
export interface BattleLogEntry {
  problem: {
    text: string;
    answer: number;
  };
  isCorrect: boolean;
  timeTaken: number;
  userInput: string;
}

// ステージの難易度設定の型
export interface StageConfig {
  id: number;
  name: string;
  enemyHP: number;
  totalTime: number;
  problemOptions: {
    digits1: number;
    digits2: number;
    allowedOperators: Operator[];
  };
  damageOnMiss: number;
}

// ResultScreen コンポーネントが受け取る props の型定義
export interface ResultScreenProps {
  isGameClear: boolean;
  battleLog: BattleLogEntry[];
  onGoToSelect: () => void;
  score: number;
  rank: string;
  bestScore?: number; // ? をつけて、なくても良いpropsだと示す
}

// ScoreDataの型定義
export interface ScoreData {
  bestScore: number;
  bestRank: string;
}