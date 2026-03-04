import type { Operator } from './generateProblem';
import type { CalculationSettings } from '../types/game';

export type Problem = {
  operand1: number;
  operand2: number;
  operand3?: number; // 3つの数の計算の場合
  operator: Operator;
  answer: number;
  text: string;
};

/**
 * 計算問題を生成する関数
 * CalculationSettingsに基づいて動的に問題を生成する
 */
export function generateProblem(settings: CalculationSettings): Problem {
  const { 
    digits1, 
    digits2, 
    allowedOperators, 
    operand1Min,
    operand2Min,
    operand2Max,
    fixedOperand1,
    targetSum,
    minAnswer,
    maxAnswer,
    mustCarry,
    allowCarryOver, 
    multiplicationTableOnly, 
    multiplicationTableRow,
    allowNegative,
    threeNumbers,
    maxValue
  } = settings;

  // maxValueが指定されている場合はそれを使用、そうでなければ桁数から計算
  const max1 = maxValue !== undefined ? Math.min(maxValue, 10 ** digits1 - 1) : 10 ** digits1 - 1;
  const max2 = maxValue !== undefined ? Math.min(maxValue, 10 ** digits2 - 1) : 10 ** digits2 - 1;

  let operand1: number;
  let operand2: number;
  let operand3: number | undefined;
  let operator: Operator;
  let answer: number;

  const MAX_RETRY = 100;

  // 2桁計算では operand を最低でも 10（または設定値）以上にする
  const effectiveMin1 = digits1 >= 2 ? (operand1Min ?? 10) : (operand1Min ?? 0);
  const effectiveMin2 = digits2 >= 2 ? (operand2Min ?? 10) : (operand2Min ?? 0);

  // 条件を満たす問題が生成できるまで最大 MAX_RETRY 回試行
  for (let i = 0; i < MAX_RETRY; i++) {
    // 3つの数の計算の場合（既存ロジックを基本的に維持）
    if (threeNumbers && allowedOperators.includes('+')) {
      const max = maxValue || 20;
      operand1 = Math.floor(Math.random() * (max + 1));
      operand2 = Math.floor(Math.random() * (max - operand1 + 1));
      operand3 = Math.floor(Math.random() * (max - operand1 - operand2 + 1));
      operator = '+';
      answer = operand1 + operand2 + (operand3 ?? 0);

      if (
        (minAnswer === undefined || answer >= minAnswer) &&
        (maxAnswer === undefined || answer <= maxAnswer)
      ) {
        return {
          operand1,
          operand2,
          operand3,
          operator,
          answer,
          text: `${operand1} + ${operand2} + ${operand3}`,
        };
      }
      continue;
    }

    // 演算子をランダムに選択
    operator = allowedOperators[Math.floor(Math.random() * allowedOperators.length)];
    operand3 = undefined;

    switch (operator) {
      case '+': {
        const maxOp2 = operand2Max ?? max2;

        if (targetSum !== undefined) {
          // targetSum 優先：operand1 をランダム、operand2 = targetSum - operand1
          const minOperand1ForTarget = Math.max(effectiveMin1, targetSum - maxOp2);
          const maxOperand1ForTarget = Math.min(max1, targetSum - effectiveMin2);

          if (minOperand1ForTarget > maxOperand1ForTarget) {
            operand1 = effectiveMin1;
            operand2 = effectiveMin2;
          } else {
            operand1 =
              Math.floor(
                Math.random() * (maxOperand1ForTarget - minOperand1ForTarget + 1),
              ) + minOperand1ForTarget;
            operand2 = targetSum - operand1;
          }
        } else {
          operand1 =
            Math.floor(Math.random() * (max1 - effectiveMin1 + 1)) + effectiveMin1;
          operand2 =
            Math.floor(Math.random() * (maxOp2 - effectiveMin2 + 1)) + effectiveMin2;

          // 1桁同士で繰り上がりなしの場合は 0〜9 の範囲で再生成
          if (digits1 === 1 && digits2 === 1 && allowCarryOver === false) {
            operand1 = Math.floor(Math.random() * 6); // 0-5
            operand2 = Math.floor(Math.random() * (10 - operand1)); // 合計が9以下
          }
        }

        // maxValue がある場合は合計が maxValue を超えないように調整
        if (maxValue !== undefined && operand1 + operand2 > maxValue) {
          operand1 = Math.floor(Math.random() * (maxValue + 1));
          operand2 = Math.floor(Math.random() * (maxValue - operand1 + 1));
        }

        answer = operand1 + operand2;

        // 足し算：繰り上がりなし（allowCarryOver === false）→ 一の位の和 < 10
        if (allowCarryOver === false && (operand1 % 10) + (operand2 % 10) >= 10) {
          continue;
        }
        // 足し算：必ず繰り上がり（mustCarry === true）→ 一の位の和 >= 10
        if (mustCarry && (operand1 % 10) + (operand2 % 10) < 10) {
          continue;
        }

        break;
      }

      case '-': {
        const maxOp2 = operand2Max ?? max2;

        if (fixedOperand1 !== undefined) {
          operand1 = fixedOperand1;
        } else {
          operand1 =
            Math.floor(Math.random() * (max1 - effectiveMin1 + 1)) + effectiveMin1;
        }

        operand2 =
          Math.floor(Math.random() * (maxOp2 - effectiveMin2 + 1)) + effectiveMin2;

        if (maxValue !== undefined) {
          operand1 = Math.floor(Math.random() * (maxValue + 1));
          operand2 = Math.floor(Math.random() * (operand1 + 1));
        }

        // 負の数を許可しない場合、operand1 >= operand2 を保証
        if (allowNegative !== true && operand1 < operand2) {
          [operand1, operand2] = [operand2, operand1];
        }

        answer = operand1 - operand2;

        // 引き算：繰り下がりなし（allowCarryOver === false）→ 一の位で operand1 >= operand2
        if (allowCarryOver === false && (operand1 % 10) < (operand2 % 10)) {
          continue;
        }
        // 引き算：必ず繰り下がり（mustCarry === true）→ 一の位で operand1 < operand2
        if (mustCarry && (operand1 % 10) >= (operand2 % 10)) {
          continue;
        }

        break;
      }

      case '×': {
        if (multiplicationTableOnly) {
          if (multiplicationTableRow !== undefined) {
            operand1 = multiplicationTableRow;
            operand2 = Math.floor(Math.random() * 9) + 1; // 1-9
          } else {
            operand1 = Math.floor(Math.random() * 9) + 1;
            operand2 = Math.floor(Math.random() * 9) + 1;
          }
        } else {
          operand1 = Math.floor(Math.random() * (max1 + 1));
          operand2 = Math.floor(Math.random() * (max2 + 1));
        }
        answer = operand1 * operand2;
        break;
      }
    }

    // 2桁計算では各オペランドが最低でも effectiveMin 以上
    if (digits1 >= 2 && operand1 < effectiveMin1) continue;
    if (digits2 >= 2 && operand2 < effectiveMin2) continue;

    if (
      (minAnswer === undefined || answer >= minAnswer) &&
      (maxAnswer === undefined || answer <= maxAnswer)
    ) {
      return {
        operand1,
        operand2,
        operator,
        answer,
        text: `${operand1} ${operator} ${operand2}`,
      };
    }
  }

  // フォールバック（理論的には到達しない想定）
  return {
    operand1: 1,
    operand2: 1,
    operator: '+',
    answer: 2,
    text: '1 + 1',
  };
}

/**
 * 計算ルールのプリセット定義
 * よく使われる計算パターンを定義
 */
export const CalculationPresets = {
  /** 一桁の足し算（繰り上がりなし） */
  singleDigitAdditionNoCarry: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: false,
  } as CalculationSettings,

  /** 一桁の足し算（繰り上がりあり） */
  singleDigitAdditionWithCarry: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: true,
  } as CalculationSettings,

  /** 一桁の引き算（繰り下がりなし） */
  singleDigitSubtractionNoBorrow: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['-'] as const,
    allowCarryOver: false,
    allowNegative: false,
  } as CalculationSettings,

  /** 一桁の引き算（繰り下がりあり） */
  singleDigitSubtractionWithBorrow: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 一桁の足し算と引き算 */
  singleDigitAdditionSubtraction: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 九九（掛け算） */
  multiplicationTable: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['×'] as const,
    multiplicationTableOnly: true,
  } as CalculationSettings,

  /** 二桁の足し算（繰り上がりなし） */
  twoDigitAdditionNoCarry: {
    digits1: 2,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: false,
  } as CalculationSettings,

  /** 二桁の足し算と引き算 */
  twoDigitAdditionSubtraction: {
    digits1: 2,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 混合（足し算、引き算、掛け算） */
  mixedOperations: {
    digits1: 2,
    digits2: 1,
    allowedOperators: ['+', '-', '×'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 5までの足し算（1桁+1桁、繰り上がりなし） */
  additionUpTo5: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: false,
    maxValue: 5,
  } as CalculationSettings,

  /** 10までの足し算（1桁+1桁、繰り上がりなし） */
  additionUpTo10: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: false,
    maxValue: 10,
  } as CalculationSettings,

  /** 10までの引き算（1桁-1桁、繰り下がりなし） */
  subtractionUpTo10: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['-'] as const,
    allowCarryOver: false,
    allowNegative: false,
    maxValue: 10,
  } as CalculationSettings,

  /** 10までの加減混合 */
  additionSubtractionUpTo10: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: false,
    allowNegative: false,
    maxValue: 10,
  } as CalculationSettings,

  /** 10までの加減（スピード勝負、繰り上がり/下がりあり） */
  additionSubtractionUpTo10WithCarry: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
    maxValue: 10,
  } as CalculationSettings,

  /** 繰り上がりあり足し算（20まで） */
  additionWithCarryUpTo20: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    allowCarryOver: true,
    maxValue: 20,
  } as CalculationSettings,

  /** 繰り下がりあり引き算（20まで） */
  subtractionWithBorrowUpTo20: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['-'] as const,
    allowCarryOver: true,
    allowNegative: false,
    maxValue: 20,
  } as CalculationSettings,

  /** 20までの3つの数の足し算 */
  threeNumbersUpTo20: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+'] as const,
    threeNumbers: true,
    maxValue: 20,
  } as CalculationSettings,

  /** 20までの加減混合 */
  additionSubtractionUpTo20: {
    digits1: 1,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
    maxValue: 20,
  } as CalculationSettings,

  /** 2桁 ± 1桁（繰り上がり/下がりなし） */
  twoDigitOneDigitNoCarry: {
    digits1: 2,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: false,
    allowNegative: false,
  } as CalculationSettings,

  /** 2桁 ± 1桁（繰り上がり/下がりあり） */
  twoDigitOneDigitWithCarry: {
    digits1: 2,
    digits2: 1,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 2桁 ± 2桁（繰り上がり/下がりなし） */
  twoDigitTwoDigitNoCarry: {
    digits1: 2,
    digits2: 2,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: false,
    allowNegative: false,
  } as CalculationSettings,

  /** 2桁 ± 2桁（繰り上がり/下がりあり） */
  twoDigitTwoDigitWithCarry: {
    digits1: 2,
    digits2: 2,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,

  /** 2桁加減（スピード混合） */
  twoDigitMixedSpeed: {
    digits1: 2,
    digits2: 2,
    allowedOperators: ['+', '-'] as const,
    allowCarryOver: true,
    allowNegative: false,
  } as CalculationSettings,
} as const;
