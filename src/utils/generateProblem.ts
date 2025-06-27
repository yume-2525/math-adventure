export type Operator = "+" | "-" | "×";

export type Problem = {
  operand1: number;
  operand2: number;
  operator: Operator;
  answer: number;
  text: string; // 例: "7 × 3"
};

type ProblemOptions = {
  digits1: number;     // 第1項の桁数（例：1桁）
  digits2: number;     // 第2項の桁数
  allowedOperators: Operator[]; // ["+", "-"] など
};

export function generateProblem(options: ProblemOptions): Problem {
  const { digits1, digits2, allowedOperators } = options;

  const max1 = 10 ** digits1 - 1;
  const max2 = 10 ** digits2 - 1;

  let operand1 = Math.floor(Math.random() * (max1 + 1));
  let operand2 = Math.floor(Math.random() * (max2 + 1));

  const operator = allowedOperators[Math.floor(Math.random() * allowedOperators.length)];
  
  // マイナス答えを防ぐため、operatorが「-」なら必ず operand1 >= operand2 にする
  if (operator === "-" && operand1 < operand2) {
    [operand1, operand2] = [operand2, operand1]; // 入れ替え
  }

  let answer: number;
  switch (operator) {
    case "+":
      answer = operand1 + operand2;
      break;
    case "-":
      answer = operand1 - operand2;
      break;
    case "×":
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
