import { useState, useEffect, useRef, useCallback } from 'react';
import { generateProblem } from "../utils/generateProblem";
import type { Problem } from "../utils/generateProblem";
import type { BattleLogEntry, StageConfig } from '../types';
import { useGameTimer } from '../hooks/useGameTimer';
import { playClick, playCorrect, playDamage } from '../utils/soundManager'; // ★★★ 効果音をインポート ★★★

interface DamageFloat {
  id: number;
  amount: number;
  target: 'enemy' | 'player';
}

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
    const [shakeTarget, setShakeTarget] = useState<'none' | 'enemy' | 'player'>('none');
    
    const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);

    const totalTime = stageConfig.totalTime;
    const problemStartTimeRef = useRef<number>(0); 
    const [isTimerActive, setIsTimerActive] = useState(false); 

    const isGameOver = playerHP <= 0;
    const isGameClear = enemyHP <= 0;

    const showDamage = (amount: number, target: 'enemy' | 'player') => {
        playDamage(); // ★ ダメージ音を再生
        const newDamageFloat: DamageFloat = { id: Date.now(), amount, target };
        setDamageFloats(prev => [...prev, newDamageFloat]);
        setTimeout(() => {
            setDamageFloats(prev => prev.filter(df => df.id !== newDamageFloat.id));
        }, 1500);
    };

    const handleTimeout = useCallback(() => {
        setShakeTarget('player');
        setFeedback("wrong");
        setFeedbackPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
        const damageAmount = stageConfig.damageOnMiss; 
        setPlayerHP((prev) => Math.max(0, prev - damageAmount));
        showDamage(damageAmount, 'player');
    
        if (currentProblem) { 
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken: totalTime, userInput: currentAnswer }]);
        }
    
        setIsTimerActive(false); 
        setCurrentProblem(null); 
        
        setTimeout(() => { setFeedback(null) }, 1000); 
        setTimeout(() => setShakeTarget('none'), 500);

    }, [currentProblem, totalTime, stageConfig.damageOnMiss, currentAnswer]);

    useGameTimer({ totalTime, onTimeout: handleTimeout, shouldStartTimer: isTimerActive, problemStartTimeRef });
    
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
             const nextProblemTimer = setTimeout(() => { startNewProblem() }, 300);
             return () => clearTimeout(nextProblemTimer);
        }
    }, [currentProblem, isGameClear, isGameOver, battleLog, onBattleComplete, startNewProblem]); 

    const handleCheckAnswer = (e: React.MouseEvent) => {
        if (currentAnswer === "" || !currentProblem) return;

        const timeTaken = Date.now() - problemStartTimeRef.current;
        setFeedbackPos({ x: e.clientX, y: e.clientY });

        if (currentAnswer === currentProblem.answer.toString()) { 
            playCorrect(); // ★ 正解音を再生
            setIsTimerActive(false);
            setFeedback("correct");
            setShakeTarget('enemy');

            const timeRatio = Math.max(0, (totalTime - timeTaken) / totalTime);
            const minDamage = 50;
            const maxDamage = 250;
            const calculatedDamage = minDamage + (maxDamage - minDamage) * timeRatio;
            const totalDamage = Math.round(calculatedDamage);

            setEnemyHP((prev) => Math.max(0, prev - totalDamage));
            showDamage(totalDamage, 'enemy');
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: true, timeTaken, userInput: currentAnswer }]);
            
            setCurrentProblem(null); 

            setTimeout(() => { setFeedback(null) }, 1000);
            setTimeout(() => setShakeTarget('none'), 500);

        } else {
            setShakeTarget('player');
            setFeedback("wrong");

            const damageAmount = stageConfig.damageOnMiss;
            setPlayerHP((prev) => Math.max(0, prev - damageAmount));
            showDamage(damageAmount, 'player');
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken, userInput: currentAnswer }]);
            
            setCurrentAnswer("");
            
            setTimeout(() => { setFeedback(null) }, 1000);
            setTimeout(() => setShakeTarget('none'), 500);
        }
    };
    
    const handleInput = (key: string) => {
        playClick(); // ★ 入力音を再生
        if (key === "⌫") {
            setCurrentAnswer((prev) => prev.slice(0, -1));
        } else if (currentProblem) {
            const maxAnswerLength = currentProblem.answer.toString().length + 1;
            if (currentAnswer.length < maxAnswerLength) {
                setCurrentAnswer((prev) => prev + key);
            }
        }
    };
    
    const animationDuration = totalTime / 1000;
  
    return (
        <div className="min-h-screen flex flex-col items-center justify-around bg-blue-50 p-4 font-sans relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none z-50">
                {damageFloats.map(df => (
                    <div
                        key={df.id}
                        className={`absolute text-3xl md:text-4xl font-extrabold text-yellow-400 animate-damage-float`}
                        style={{
                            left: '50%',
                            top: df.target === 'enemy' ? '20%' : '80%',
                            transform: 'translateX(-50%)',
                            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                        }}
                    >
                        -{df.amount}
                    </div>
                ))}
            </div>

            {/* 敵の情報エリア */}
            <div className="w-full max-w-sm">
                {/* ★★★ HPバーの上の画像は削除しました ★★★ */}
                <div className="text-xl font-bold text-gray-700 text-center mb-1">敵のHP</div>
                <div className="relative bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-red-600 h-full transition-all duration-300 ease-in-out" style={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }} />
                    <div className="absolute inset-0 flex justify-center items-center text-white font-bold text-sm tracking-wider" style={{textShadow: '1px 1px 2px black'}}>
                        {enemyHP} / {maxEnemyHP}
                    </div>
                </div>
            </div>

            {/* 問題エリア */}
            <div className={`relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center`}>
                <div className={`transition-transform duration-300 ${shakeTarget === 'enemy' ? 'animate-shake' : ''}`}>
                    <img 
                        src={stageConfig.enemyImage} 
                        alt="敵キャラクター" 
                        className="w-full h-full object-contain opacity-75" // ★★★ 透明度を調整 ★★★
                    />
                </div>
                <div className={`absolute inset-0 ${shakeTarget === 'player' ? 'animate-shake' : ''}`}>
                    {isTimerActive && (
                        <>
                            <div className="timer-ring absolute z-10" />
                            <div
                                key={currentProblem?.text || 'timer'}
                                className="timer-circle absolute z-10"
                                style={{ animation: `timer-scale-up ${animationDuration}s linear forwards` }}
                            />
                        </>
                    )}
                    <div 
                        onClick={currentProblem ? handleCheckAnswer : undefined} 
                        className="absolute inset-0 flex items-center justify-center p-2 z-20"
                        style={{ cursor: currentProblem ? 'pointer' : 'default' }}
                    >
                        {currentProblem && (
                            <span 
                                className="text-4xl md:text-5xl font-bold text-gray-900 text-center"
                                style={{ textShadow: '2px 0 #FFF, -2px 0 #FFF, 0 2px #FFF, 0 -2px #FFF, 1px 1px #FFF, -1px -1px #FFF, 1px -1px #FFF, -1px 1px #FFF' }}
                            >
                                {currentProblem.text}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ★★★ フィードバック表示を復活・確認 ★★★ */}
            {feedback && feedbackPos && (
                <div
                    className={`absolute text-4xl md:text-5xl font-extrabold pointer-events-none transition-opacity duration-1000 animate-fadeOut z-40 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
                    style={{ left: `${feedbackPos.x}px`, top: `${feedbackPos.y}px`, transform: "translate(-50%, -100%)" }}
                >
                    {feedback === "correct" ? "ナイス！" : "ミス！"}
                </div>
            )}

            {/* 入力エリア */}
            <div className={`w-full max-w-xs ${shakeTarget === 'player' ? 'animate-shake' : ''}`}>
                <div className="text-4xl md:text-5xl font-mono tracking-widest mb-2 p-2 bg-white rounded-lg shadow-inner min-h-[4rem] text-center">
                    {currentAnswer || <span className="text-gray-400">?</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"].map((key) => (
                        <button key={key} onClick={() => handleInput(key)} className="bg-white text-2xl font-bold py-3 md:py-4 rounded-lg shadow-md active:shadow-inner active:bg-gray-100 transition-shadow">
                            {key}
                        </button>
                    ))}
                </div>
            </div>

            {/* プレイヤーの情報エリア */}
            <div className="w-full max-w-sm">
                 <div className="text-xl font-bold text-blue-700 text-center mb-1">プレイヤーHP</div>
                <div className="relative bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-green-500 h-full transition-all duration-300 ease-in-out" style={{ width: `${(playerHP / maxPlayerHP) * 100}%` }} />
                    <div className="absolute inset-0 flex justify-center items-center text-white font-bold text-sm tracking-wider" style={{textShadow: '1px 1px 2px black'}}>
                        {playerHP} / {maxPlayerHP}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BattleScreen;