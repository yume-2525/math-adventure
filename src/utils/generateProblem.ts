export type Operator = "+" | "-" | "×";

export type Problem = {
  operand1: number;
  operand2: number;
  operator: Operator;
  answer: number;
  text: string;
};

type ProblemOptions = {
  digits1: number;
  digits2: number;
  // ★★★ ここに readonly を追加 ★★★
  allowedOperators: readonly Operator[];
};

export function generateProblem(options: ProblemOptions): Problem {
  const { digits1, digits2, allowedOperators } = options;

  const max1 = 10 ** digits1 - 1;
  const max2 = 10 ** digits2 - 1;

  let operand1 = Math.floor(Math.random() * (max1 + 1));
  let operand2 = Math.floor(Math.random() * (max2 + 1));

  const operator = allowedOperators[Math.floor(Math.random() * allowedOperators.length)];
  
  if (operator === "-" && operand1 < operand2) {
    [operand1, operand2] = [operand2, operand1];
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