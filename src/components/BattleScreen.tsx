
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateProblem } from "../utils/generateProblem";
import type { Problem } from "../utils/generateProblem";
import type { BattleLogEntry } from '../types/index'; 

import ResultScreen from './ResultScreen';
import { useGameTimer } from '../hooks/useGameTimer'; // ★★★ 作成した useGameTimer をインポート ★★★

function BattleScreen() {
    const [playerHP, setPlayerHP] = useState(3 * 100);
    const [enemyHP, setEnemyHP] = useState(5 * 100);
    const maxPlayerHP = 3 * 100;
    const maxEnemyHP = 5 * 100;

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    
    // 見た目に関するState
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [feedbackPos, setFeedbackPos] = useState<{ x: number; y: number } | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const totalTime = 8000; // 8秒
    const problemStartTimeRef = useRef<number>(0); 

    // ★★★ タイマーの実行状態を管理する State を追加 ★★★
    // このフラグが true になると useGameTimer がタイマーを開始します
    const [isTimerActive, setIsTimerActive] = useState(false); 

    // ゲームが終了したかどうかを判定する変数
    const isGameOver = playerHP <= 0;
    const isGameClear = enemyHP <= 0;

    // handleTimeout の定義
    // この関数は useGameTimer に渡され、時間切れの時に呼び出される
    const handleTimeout = useCallback(() => {
        console.log("時間切れ！ handleTimeout called!"); 
    
        setIsShaking(true);
        setFeedback("wrong");
        setFeedbackPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
        const damageAmount = 50; 
        setPlayerHP((prev) => Math.max(0, prev - damageAmount)); 
    
        if (currentProblem) { 
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken: totalTime }]);
        }
    
        // 時間切れになったらタイマーを非アクティブにする（重要！）
        setIsTimerActive(false); 
        
        setTimeout(() => {
            setFeedback(null); 
            setIsShaking(false); 
        }, 1000); 

    }, [currentProblem, totalTime]);

    // ★★★ useGameTimer フックを呼び出す ★★★
    useGameTimer({
        totalTime: totalTime,
        onTimeout: handleTimeout,
        shouldStartTimer: isTimerActive, // このフラグでタイマーを制御
        problemStartTimeRef: problemStartTimeRef,
    });
    
    // 新しい問題を準備してタイマーを開始する関数
    const startNewProblem = useCallback(() => {
      console.log("💡 新しい問題を開始: startNewProblem called!"); 

      // ゲームが終了していたら新しい問題は作らない
      if (playerHP <= 0 || enemyHP <= 0) {
        console.log("ゲーム終了のため、新しい問題は開始しません。");
        setIsTimerActive(false);
        return; 
      }

      const newProblem = generateProblem({
        digits1: 1,
        digits2: 1,
        allowedOperators: ["+", "-", "×"],
      });

      setCurrentProblem(newProblem); 
      setCurrentAnswer(""); 
      problemStartTimeRef.current = Date.now(); // ★問題開始時刻をリセット

      // ★★★ タイマーをアクティブにするフラグを立てるだけ！ ★★★
      // これにより useGameTimer がタイマーを開始します
      setIsTimerActive(true); 

    }, [playerHP, enemyHP]);


    // ★★★ ゲーム進行を管理する中心的な useEffect ★★★
    // この useEffect は、ゲームの状態が変化した時に「次に何をすべきか」を判断します
    useEffect(() => {
        console.log("▶ useEffect (ゲーム進行管理) が発火");

        // 1. ゲーム開始時、または問題に回答/タイムアウトした後
        if (currentProblem === null && !isGameOver && !isGameClear) {
             console.log("▶ useEffect: 問題がないので、新しい問題を開始します。");
             startNewProblem(); 
        }

        // 2. フィードバック表示が終わった後、またはゲームが終了していないのにタイマーが止まっている時
        // (時間切れ or 正解後)
        else if (!isTimerActive && feedback === null && !isGameOver && !isGameClear) {
            console.log("▶ useEffect: 次の問題へ進みます。");
            // 問題をnullにすることで、次のレンダリングで(1)の条件に合致し、startNewProblemが呼ばれる
            setCurrentProblem(null);
        }

    }, [currentProblem, isTimerActive, feedback, isGameOver, isGameClear, startNewProblem]); 
    
    // 答えをチェックする関数
    const handleCheckAnswer = (e: React.MouseEvent) => {
        if (currentAnswer === "" || !currentProblem) return;

        // ★★★ 回答したら、まずタイマーを止める！ ★★★
        setIsTimerActive(false);

        const timeTaken = Date.now() - problemStartTimeRef.current;
        setFeedbackPos({ x: e.clientX, y: e.clientY });

        if (currentAnswer === currentProblem.answer.toString()) { // 正解
            setFeedback("correct");

            const baseDamage = 1;
            const bonusMultiplier = 3; 
            const timeRatio = Math.max(0, (totalTime - timeTaken) / totalTime);
            const bonusDamage = Math.floor(baseDamage * timeRatio * bonusMultiplier); 
            const totalDamage = (baseDamage + bonusDamage) * 100;

            console.log(`正解！ ダメージ: ${totalDamage} (かかった時間: ${timeTaken}ms)`);
            setEnemyHP((prev) => Math.max(0, prev - totalDamage));
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: true, timeTaken }]);

        } else { // 不正解
            setFeedback("wrong");
            setIsShaking(true);
            const damageAmount = 50;
            console.log(`不正解！ ダメージ: ${damageAmount}`);
            setPlayerHP((prev) => Math.max(0, prev - damageAmount));
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken }]);
        }

        setCurrentAnswer("");
        
        setTimeout(() => {
            setFeedback(null);
            setIsShaking(false);
        }, 1000);
    };

    // テンキー入力処理
    const handleInput = (key: string) => {
        if (key === "⌫") {
            setCurrentAnswer((prev) => prev.slice(0, -1));
        } else if (currentProblem) {
            const maxAnswerLength = currentProblem.answer.toString().length + 1; // マイナス符号なども考慮
            if (currentAnswer.length < maxAnswerLength) {
                setCurrentAnswer((prev) => prev + key);
            }
        }
    };

    // ゲームリセット処理
    const resetGame = useCallback(() => {
        setPlayerHP(maxPlayerHP);
        setEnemyHP(maxEnemyHP);
        setBattleLog([]);
        setCurrentAnswer("");
        setFeedback(null);
        setFeedbackPos(null);
        setIsShaking(false);
        setIsTimerActive(false);
        setCurrentProblem(null); // これを null にすることで useEffect が最初の問題を開始する
    }, [maxPlayerHP, maxEnemyHP]);
    

    // --- 以下、画面の描画(JSX)部分 ---

    if (isGameOver || isGameClear) {
      return (
        <ResultScreen
          isGameClear={isGameClear}
          battleLog={battleLog}
          onRetry={resetGame}
        />
      );
    }

    if (!currentProblem) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-3xl font-bold">
          問題を準備中...
        </div>
      );
    }

    const animationDuration = totalTime / 1000;
  
    return (
        <div className={`min-h-screen flex flex-col items-center justify-between bg-blue-50 p-4 ${isShaking ? 'animate-shake' : ''}`}>
            {/* 敵の情報 */}
            <div className="w-full max-w-md">
                <div className="text-xl font-bold text-gray-700 text-center mb-1">敵のHP</div>
                <div className="bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-red-600 h-full transition-all duration-300 ease-in-out" style={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }} />
                </div>
            </div>

                         {/* 問題エリア */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                
                {/* 背景のタイマー要素 (z-10) */}
                {isTimerActive && (
                    <>
                        {/* 赤い縁 */}
                        <div className="timer-ring absolute z-10" />

                        {/* 白い円 */}
                        <div
                            key={currentProblem.text}
                            className="timer-circle absolute z-10"
                            style={{
                                animation: `timer-scale-up ${animationDuration}s linear forwards`,
                            }}
                        />
                    </>
                )}
                
                {/* 問題文 (z-20) */}
                <div
                    onClick={handleCheckAnswer}
                    className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-gray-800 cursor-pointer select-none z-20"
                >
                    {currentProblem.text}
                </div>
            </div>


            {/* フィードバック表示 */}
            {feedback && feedbackPos && (
                <div
                    className={`absolute text-5xl font-extrabold pointer-events-none transition-opacity duration-1000 animate-fadeOut ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
                    style={{ left: `${feedbackPos.x}px`, top: `${feedbackPos.y}px`, transform: "translate(-50%, -100%)" }}
                >
                    {feedback === "correct" ? "ナイス！" : "ミス！"}
                </div>
            )}

            {/* 入力欄 */}
            <div className="text-5xl font-mono tracking-widest mb-4 p-2 bg-white rounded-lg shadow-inner min-h-[4rem] min-w-[8rem] text-center">
                {currentAnswer || <span className="text-gray-400">?</span>}
            </div>

            {/* テンキー */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"].map((key) => (
                    <button key={key} onClick={() => handleInput(key)} className="bg-white text-2xl font-bold py-4 rounded-lg shadow-md active:shadow-inner active:bg-gray-100 transition-shadow">
                        {key}
                    </button>
                ))}
            </div>

            {/* プレイヤーの情報 */}
            <div className="w-full max-w-md">
                <div className="text-xl font-bold text-blue-700 text-center mb-1">プレイヤーHP</div>
                <div className="bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-green-500 h-full transition-all duration-300 ease-in-out" style={{ width: `${(playerHP / maxPlayerHP) * 100}%` }} />
                </div>
            </div>
        </div>
    );
}

export default BattleScreen;