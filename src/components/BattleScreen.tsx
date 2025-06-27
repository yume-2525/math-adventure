import { useState } from 'react';
import { generateProblem, type Problem } from "../utils/generateProblem";


// src/BattleScreen.tsx
function BattleScreen() {

    const [playerHP, setPlayerHP] = useState(3); // 例えば最大3
    const [enemyHP, setEnemyHP] = useState(5);   // 適当に設定

    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [feedbackPos, setFeedbackPos] = useState<{ x: number; y: number } | null>(null);

      //問題生成
    const [problems] = useState<Problem[]>(() =>
      Array.from({ length: 10 }).map(() =>
        generateProblem({
          digits1: 1,
          digits2: 1,
          allowedOperators: ["+", "-", "×"],
        })
      )
    );

      // 今見せてる問題のインデックス
    const [currentIndex, setCurrentIndex] = useState(0);

    const [currentAnswer, setCurrentAnswer] = useState("");


    function handleInput(key: string) {
      if (key === "⌫") {
        setCurrentAnswer((prev) => prev.slice(0, -1));
      } else {
        setCurrentAnswer((prev) => prev + key);
      }
    }
    
    //正誤判定
    function handleCheckAnswer(e: React.MouseEvent) {
      const currentProblem = problems[currentIndex];

      // クリック位置を取得
      const x = e.clientX ;
      const y = e.clientY ;

      setFeedbackPos({ x, y });

      if (currentAnswer === currentProblem.answer.toString()) {
        setEnemyHP((prev) => Math.max(0, prev - 1));
        setCurrentIndex((prev) => prev + 1);
        setCurrentAnswer("");
        setFeedback("correct");
      } else {
        setPlayerHP((prev) => Math.max(0, prev - 1));
        setCurrentAnswer("");
        setFeedback("wrong");
      }

      // 1秒後に消す
      setTimeout(() => {
        setFeedback(null);
        setFeedbackPos(null);
      }, 1000);
    }


      // currentIndexが問題数以上なら終了メッセージなどに切り替えられる
    if (currentIndex >= problems.length) {
      return <div>おめでとう！バトルクリア！</div>;
    }

  
    return (

    <div className="min-h-screen flex flex-col items-center justify-between bg-blue-50 p-4">
      
      {/* 敵のHPバー */}
      <div className="w-full max-w-md mb-2">
        <div className="bg-red-200 h-4 rounded-full overflow-hidden">
           <div
           className="bg-red-600 h-full"
           style={{ width: `${(enemyHP / 5) * 100}%` }}
           />
        </div>
      </div>

      <div className="relative w-48 h-48 mb-4">
        <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-50" />

        {/* 問題文 */}
        <div
          onClick={handleCheckAnswer}
          className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800 cursor-pointer"
        >
          {problems[currentIndex].text}
        </div>
      </div>

              {/* フィードバック表示 */}
        {feedback && feedbackPos && (
          <div
            className={`
              absolute text-3xl font-bold pointer-events-none transition-opacity duration-1000
              ${feedback === "correct" ? "text-green-500" : "text-red-500"}
              animate-fadeOut
            `}
            style={{
              left: `${feedbackPos.x}px`,
              top: `${feedbackPos.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {feedback === "correct" ? "ナイス！" : "ミス！"}
          </div>
        )}


       
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
          <div
            className="bg-green-600 h-full"
            style={{ width: `${(playerHP / 3) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
}


export default BattleScreen;
