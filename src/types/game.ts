import type { Operator } from '../utils/generateProblem';

/**
 * 計算問題の設定
 * ステージごとに異なる計算ルールを定義できる
 */
export interface CalculationSettings {
  /** 第1オペランドの桁数 */
  digits1: number;
  /** 第2オペランドの桁数 */
  digits2: number;
  /** 使用可能な演算子 */
  allowedOperators: readonly Operator[];
  /** 繰り上がり・繰り下がりを許可するか（足し算・引き算の場合） */
  allowCarryOver?: boolean;
  /** 九九のみに限定するか（掛け算の場合） */
  multiplicationTableOnly?: boolean;
  /** 負の数を許可するか（引き算の場合） */
  allowNegative?: boolean;
}

/**
 * ステージ設定
 * バトル画面で使用される全ての設定を含む
 */
export interface StageConfig {
  /** ステージID（一意の識別子） */
  id: number;
  /** ステージ名 */
  name: string;
  /** 背景画像のパス */
  backgroundImage: string;
  /** 敵キャラクターの画像パス */
  enemyImage: string;
  /** 敵の最大HP */
  enemyHP: number;
  /** 問題ごとの制限時間（ミリ秒） */
  totalTime: number;
  /** 計算問題の設定 */
  calculationSettings: CalculationSettings;
  /** ミス時のダメージ量 */
  damageOnMiss: number;
}

/**
 * エリア設定
 * 複数のステージをグループ化する
 */
export interface AreaConfig {
  /** エリアID（一意の識別子） */
  id: string;
  /** エリア名 */
  name: string;
  /** エリアの説明（オプション） */
  description?: string;
  /** エリア選択画面で使用する画像パス */
  image?: string;
  /** このエリアに含まれるステージのリスト */
  stages: StageConfig[];
}

/**
 * バトルログ1行分の型定義
 */
export interface BattleLogEntry {
  problem: {
    text: string;
    answer: number;
  };
  isCorrect: boolean;
  timeTaken: number;
  userInput: string;
}

/**
 * ResultScreen コンポーネントが受け取る props の型定義
 */
export interface ResultScreenProps {
  isGameClear: boolean;
  battleLog: BattleLogEntry[];
  onGoToSelect: () => void;
  score: number;
  rank: string;
  bestScore?: number;
}

/**
 * ScoreDataの型定義
 */
export interface ScoreData {
  bestScore: number;
  bestRank: string;
}
