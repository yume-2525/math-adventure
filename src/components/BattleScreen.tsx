import { useState, useEffect, useRef, useCallback } from 'react';
import { generateProblem } from "../utils/generateProblem";
import type { Problem } from "../utils/generateProblem";
import type { BattleLogEntry, StageConfig } from '../types';

import { useGameTimer } from '../hooks/useGameTimer';

// BattleScreenが受け取るpropsの型を定義
interface BattleScreenProps {
  stageConfig: StageConfig;
  onBattleComplete: (log: BattleLogEntry[], isClear: boolean) => void;
}

function BattleScreen({ stageConfig, onBattleComplete }: BattleScreenProps) {
    const [playerHP, setPlayerHP] = useState(3 * 100); 
    const [enemyHP, setEnemyHP] = useState(stageConfig.enemyHP);
    const maxPlayerHP = 3 * 100;
    const maxEnemyHP = stageConfig.enemyHP;

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [feedbackPos, setFeedbackPos] = useState<{ x: number; y: number } | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const totalTime = stageConfig.totalTime;
    const problemStartTimeRef = useRef<number>(0); 
    const [isTimerActive, setIsTimerActive] = useState(false); 

    const isGameOver = playerHP <= 0;
    const isGameClear = enemyHP <= 0;

    const handleTimeout = useCallback(() => {
        setIsShaking(true);
        setFeedback("wrong");
        setFeedbackPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
        const damageAmount = stageConfig.damageOnMiss; 
        setPlayerHP((prev) => Math.max(0, prev - damageAmount)); 
    
        if (currentProblem) { 
            // ★★★ ここに userInput: currentAnswer を追加 ★★★
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken: totalTime, userInput: currentAnswer }]);
        }
    
        setIsTimerActive(false); 
        setCurrentProblem(null); 
        
        setTimeout(() => {
            setFeedback(null); 
            setIsShaking(false); 
        }, 1000); 

    }, [currentProblem, totalTime, stageConfig.damageOnMiss, currentAnswer]); // ★ currentAnswerを依存配列に追加

    useGameTimer({
        totalTime,
        onTimeout: handleTimeout,
        shouldStartTimer: isTimerActive,
        problemStartTimeRef,
    });
    
    const startNewProblem = useCallback(() => {
      if (playerHP <= 0 || enemyHP <= 0) {
        setIsTimerActive(false);
        return; 
      }
      const newProblem = generateProblem(stageConfig.problemOptions);
      setCurrentProblem(newProblem); 
      setCurrentAnswer(""); 
      problemStartTimeRef.current = Date.now();
      setIsTimerActive(true); 

    }, [playerHP, enemyHP, stageConfig.problemOptions]);

    useEffect(() => {
        if (isGameClear || isGameOver) {
            const timer = setTimeout(() => {
                onBattleComplete(battleLog, isGameClear);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (currentProblem === null && !isGameClear && !isGameOver) {
             startNewProblem(); 
        }
    }, [currentProblem, isGameClear, isGameOver, battleLog, onBattleComplete, startNewProblem]); 

    const handleCheckAnswer = (e: React.MouseEvent) => {
        if (currentAnswer === "" || !currentProblem) return;

        const timeTaken = Date.now() - problemStartTimeRef.current;
        setFeedbackPos({ x: e.clientX, y: e.clientY });

        if (currentAnswer === currentProblem.answer.toString()) { 
            setIsTimerActive(false);
            setFeedback("correct");

            const bonusMultiplier = 1; 
            const timeRatio = Math.max(0, (totalTime - timeTaken) / totalTime);
            const bonusDamage = Math.floor(1 * timeRatio * bonusMultiplier); 
            const totalDamage = (1 + bonusDamage) * 100;

            setEnemyHP((prev) => Math.max(0, prev - totalDamage));
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: true, timeTaken, userInput: currentAnswer }]);
            
            setCurrentProblem(null); 

            setTimeout(() => setFeedback(null), 1000);

        } else {
            setIsShaking(true);
            setFeedback("wrong");

            const damageAmount = stageConfig.damageOnMiss;
            setPlayerHP((prev) => Math.max(0, prev - damageAmount));
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken, userInput: currentAnswer }]);
            
            setCurrentAnswer("");
            
            setTimeout(() => {
                setFeedback(null);
                setIsShaking(false);
            }, 1000);
        }
    };
    
    const handleInput = (key: string) => {
        if (key === "⌫") {
            setCurrentAnswer((prev) => prev.slice(0, -1));
        } else if (currentProblem) {
            const maxAnswerLength = currentProblem.answer.toString().length + 1;
            if (currentAnswer.length < maxAnswerLength) {
                setCurrentAnswer((prev) => prev + key);
            }
        }
    };
    
    if (!currentProblem) {
      return <div className="min-h-screen flex items-center justify-center bg-blue-50 text-2xl font-bold">ステージ準備中...</div>;
    }

    const animationDuration = totalTime / 1000;
  
    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-blue-50 p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="text-xl font-bold text-gray-700 text-center mb-1">敵のHP</div>
                <div className="bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-red-600 h-full transition-all duration-300 ease-in-out" style={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }} />
                </div>
            </div>

            <div className={`relative w-64 h-64 flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
                {isTimerActive && (
                    <>
                        <div className="timer-ring absolute z-10" />
                        <div
                            key={currentProblem.text}
                            className="timer-circle absolute z-10"
                            style={{ animation: `timer-scale-up ${animationDuration}s linear forwards` }}
                        />
                    </>
                )}
                <div onClick={handleCheckAnswer} className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-gray-800 cursor-pointer select-none z-20">
                    {currentProblem.text}
                </div>
            </div>

            {feedback && feedbackPos && (
                <div
                    className={`absolute text-5xl font-extrabold pointer-events-none transition-opacity duration-1000 animate-fadeOut ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
                    style={{ left: `${feedbackPos.x}px`, top: `${feedbackPos.y}px`, transform: "translate(-50%, -100%)" }}
                >
                    {feedback === "correct" ? "ナイス！" : "ミス！"}
                </div>
            )}

            <div className="text-5xl font-mono tracking-widest mb-4 p-2 bg-white rounded-lg shadow-inner min-h-[4rem] min-w-[8rem] text-center">
                {currentAnswer || <span className="text-gray-400">?</span>}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"].map((key) => (
                    <button key={key} onClick={() => handleInput(key)} className="bg-white text-2xl font-bold py-4 rounded-lg shadow-md active:shadow-inner active:bg-gray-100 transition-shadow">
                        {key}
                    </button>
                ))}
            </div>

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