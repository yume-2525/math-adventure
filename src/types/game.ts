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
  /** 第1オペランドの最小値（オプション） */
  operand1Min?: number;
  /** 第2オペランドの最小値（オプション） */
  operand2Min?: number;
  /** 第2オペランドの最大値（オプション） */
  operand2Max?: number;
  /** 第1オペランドを固定する（例: 10 - ? の「10」） */
  fixedOperand1?: number;
  /** 足し算で「合計を固定」する（例: 10になる足し算） */
  targetSum?: number;
  /** 答えの最小値 */
  minAnswer?: number;
  /** 答えの最大値 */
  maxAnswer?: number;
  /** 必ず繰り上がり/繰り下がりを発生させるか */
  mustCarry?: boolean;
  /** 繰り上がり・繰り下がりを許可するか（足し算・引き算の場合） */
  allowCarryOver?: boolean;
  /** 九九のみに限定するか（掛け算の場合） */
  multiplicationTableOnly?: boolean;
  /** 九九の特定の段を指定（1-9、指定しない場合は全段） */
  multiplicationTableRow?: number;
  /** 負の数を許可するか（引き算の場合） */
  allowNegative?: boolean;
  /** 3つの数の計算を行うか */
  threeNumbers?: boolean;
  /** 最大値の制限（例: 10までの計算、20までの計算） */
  maxValue?: number;
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
  /** 表示モード（デフォルトは横並び） */
  displayMode?: 'horizontal' | 'vertical';
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
  /** 100%達成時に表示する恐竜の画像パス（オプション） */
  dinosaurImage?: string;
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
