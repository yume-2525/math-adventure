// generateProblem.ts から Problem 型をインポートします
import type { Problem } from '../utils/generateProblem';

// バトルログ1行分の型定義
export interface BattleLogEntry {
  problem: Problem;
  isCorrect: boolean;
  timeTaken: number;
}

// ResultScreen コンポーネントが受け取る props の型定義
export interface ResultScreenProps {
  isGameClear: boolean;
  battleLog: BattleLogEntry[];
  onRetry: () => void;
}