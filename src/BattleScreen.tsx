import { useState } from 'react';
import { generateProblem, type Problem } from "./utils/generateProblem";


// src/BattleScreen.tsx
function BattleScreen() {


      //問題生成
    const [problems, setProblems] = useState<Problem[]>(() =>
      Array.from({ length: 3 }).map(() =>
        generateProblem({
          digits1: 1,
          digits2: 1,
          allowedOperators: ["+", "-", "×"],
        })
      )
    );

    const [currentAnswer, setCurrentAnswer] = useState("");

    function handleInput(key: string) {
      if (key === "⌫") {
        setCurrentAnswer((prev) => prev.slice(0, -1));
      } else if (key === "✓") {
        console.log("提出された答え:", currentAnswer); // 後で答えチェック処理に置き換える
        setCurrentAnswer(""); // リセット
      } else {
        setCurrentAnswer((prev) => prev + key);
      }
    }
    
    //正誤判定
    function handleCheckAnswer(index: number) {
      const problem = problems[index];
      if (currentAnswer === problem.answer.toString()) {
        // 正解！問題を壊す（配列から除く）
        setProblems((prev) => prev.filter((_, i) => i !== index));
        setCurrentAnswer("");
        // 敵のHP減らす処理などもここで呼ぶ
      } else {
        // 不正解ならプレイヤーHP減らすとかの処理
        alert("ちがうよ！");
      }
    }
  
    return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-blue-50 p-4">
      {/* 敵のHPバー */}
      <div className="w-full max-w-md mb-2">
        <div className="bg-red-200 h-4 rounded-full overflow-hidden">
          <div className="bg-red-600 h-full w-3/4" />
        </div>
      </div>

      {/* 問題 + タイマー */}
      <div className="relative w-48 h-48 mb-4">
        <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">
          7 × 3
        </div>
      </div>


      {problems.map((problem, i) => (
        <div
          key={i}
          onClick={() => handleCheckAnswer(i)}
          className="cursor-pointer text-3xl font-bold mb-2"
        >
          {problem.text}
        </div>
       ))}

      {/* 入力欄 */}
      <div className="text-4xl font-mono tracking-widest mb-2">
        {currentAnswer || <span className="text-gray-400">__</span>}
      </div>

      {/* テンキー */}
      <div className="grid grid-cols-3 gap-2 max-w-xs w-full mb-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"].map((key) => (
          <button
            key={key}
            onClick={() => handleInput(key)} 
            className="bg-white text-xl font-bold py-3 rounded shadow"
          >
            {key}
          </button>
        ))}
      </div>

      {/* プレイヤーのHPバー */}
      <div className="w-full max-w-md">
        <div className="bg-green-200 h-4 rounded-full overflow-hidden">
          <div className="bg-green-600 h-full w-2/3" />
        </div>
      </div>
    </div>
  );
}


export default BattleScreen;
