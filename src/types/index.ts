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
  enemyImage: string;
  enemyHP: number;
  totalTime: number;
  problemOptions: {
    digits1: number;
    digits2: number;
    // ★★★ allowedOperators の先頭に readonly を追加 ★★★
    allowedOperators: readonly Operator[];
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
  bestScore?: number;
}

// ScoreDataの型定義
export interface ScoreData {
  bestScore: number;
  bestRank: string;
}