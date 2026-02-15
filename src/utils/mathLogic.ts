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

  // 3つの数の計算の場合
  if (threeNumbers && allowedOperators.includes('+')) {
    // 3つの数の足し算のみ対応（20までの計算など）
    const max = maxValue || 20;
    operand1 = Math.floor(Math.random() * (max + 1));
    operand2 = Math.floor(Math.random() * (max - operand1 + 1));
    operand3 = Math.floor(Math.random() * (max - operand1 - operand2 + 1));
    operator = '+';
    answer = operand1 + operand2 + operand3;
    return {
      operand1,
      operand2,
      operand3,
      operator,
      answer,
      text: `${operand1} + ${operand2} + ${operand3}`,
    };
  }

  // 演算子をランダムに選択
  operator = allowedOperators[Math.floor(Math.random() * allowedOperators.length)];

  // 演算子に応じて問題を生成
  switch (operator) {
    case '+':
      operand1 = Math.floor(Math.random() * (max1 + 1));
      operand2 = Math.floor(Math.random() * (max2 + 1));
      
      // maxValueが指定されている場合の制限
      if (maxValue !== undefined) {
        // 合計がmaxValueを超えないように調整
        if (operand1 + operand2 > maxValue) {
          operand1 = Math.floor(Math.random() * (maxValue + 1));
          operand2 = Math.floor(Math.random() * (maxValue - operand1 + 1));
        }
      }
      
      // 繰り上がりなしの設定がある場合、繰り上がりが発生しないように調整
      if (allowCarryOver === false) {
        // 各桁で繰り上がりが発生しないように制限
        const maxNoCarry1 = Math.min(max1, 9);
        const maxNoCarry2 = Math.min(max2, 9);
        operand1 = Math.floor(Math.random() * (maxNoCarry1 + 1));
        operand2 = Math.floor(Math.random() * (maxNoCarry2 + 1));
        
        // 一桁同士でも繰り上がりが発生しないように
        if (digits1 === 1 && digits2 === 1) {
          operand1 = Math.floor(Math.random() * 6); // 0-5
          operand2 = Math.floor(Math.random() * (10 - operand1)); // 合計が9以下になるように
        }
      }
      
      answer = operand1 + operand2;
      break;

    case '-':
      operand1 = Math.floor(Math.random() * (max1 + 1));
      operand2 = Math.floor(Math.random() * (max2 + 1));
      
      // maxValueが指定されている場合の制限
      if (maxValue !== undefined) {
        operand1 = Math.floor(Math.random() * (maxValue + 1));
        operand2 = Math.floor(Math.random() * (operand1 + 1));
      }
      
      // 負の数を許可しない場合、operand1 >= operand2 を保証
      if (allowNegative !== true && operand1 < operand2) {
        [operand1, operand2] = [operand2, operand1];
      }
      
      // 繰り下がりなしの設定がある場合
      if (allowCarryOver === false) {
        // 各桁で繰り下がりが発生しないように調整
        const op1Str = operand1.toString().padStart(digits1, '0');
        const op2Str = operand2.toString().padStart(digits2, '0');
        const maxLen = Math.max(digits1, digits2);
        
        // 各桁で operand1 の桁 >= operand2 の桁 を保証
        let valid = true;
        for (let i = 0; i < maxLen; i++) {
          const d1 = parseInt(op1Str[op1Str.length - 1 - i] || '0');
          const d2 = parseInt(op2Str[op2Str.length - 1 - i] || '0');
          if (d1 < d2) {
            valid = false;
            break;
          }
        }
        
        // 無効な場合は再生成（簡易実装）
        if (!valid && operand1 >= operand2) {
          // 簡単な方法：operand2を小さくする
          operand2 = Math.floor(Math.random() * Math.min(operand1 + 1, max2 + 1));
        }
      }
      
      answer = operand1 - operand2;
      break;

    case '×':
      if (multiplicationTableOnly) {
        if (multiplicationTableRow !== undefined) {
          // 特定の段を指定（例: 3の段）
          operand1 = multiplicationTableRow;
          operand2 = Math.floor(Math.random() * 9) + 1; // 1-9
        } else {
          // 九九のみ（1-9の範囲、全段ランダム）
          operand1 = Math.floor(Math.random() * 9) + 1; // 1-9
          operand2 = Math.floor(Math.random() * 9) + 1; // 1-9
        }
      } else {
        operand1 = Math.floor(Math.random() * (max1 + 1));
        operand2 = Math.floor(Math.random() * (max2 + 1));
      }
      answer = operand1 * operand2;
      break;
  }

  return {
    operand1,
    operand2,
    operator,
    answer,
    text: `${operand1} ${operator} ${operand2}`,
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
