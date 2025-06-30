// generateProblem.ts から Problem 型をインポートします
import type { Problem } from '../utils/generateProblem';
// generateProblem.ts から Operator 型をインポートします
import type { Operator } from '../utils/generateProblem';

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

// BattleScreenが受け取るpropsの型
export interface BattleScreenProps {
  stageConfig: StageConfig;
  onStageComplete: () => void; // ステージ完了時に親コンポーネントに通知するための関数
}