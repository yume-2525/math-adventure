import { useState, useEffect, useRef, useCallback } from 'react';
import { generateProblem } from "../utils/mathLogic";
import type { Problem } from "../utils/mathLogic";
import type { BattleLogEntry, StageConfig } from '../types';
import { useGameTimer } from '../hooks/useGameTimer';
import { playClick, playCorrect, playDamage, playStageClear } from '../utils/soundManager';
import Lottie from 'lottie-react';
import victoryAnimationData from '../../public/animations/victory.json';

interface DamageFloat {
  id: number;
  amount: number;
  target: 'enemy' | 'player';
}

interface BattleScreenProps {
  stageConfig: StageConfig;
  onBattleComplete: (log: BattleLogEntry[], isClear: boolean) => void;
  onGiveUp: () => void;
}

function BattleScreen({ stageConfig, onBattleComplete, onGiveUp }: BattleScreenProps) {
    const [playerHP, setPlayerHP] = useState(120); 
    const [enemyHP, setEnemyHP] = useState(stageConfig.enemyHP);
    const maxPlayerHP = 120;
    const maxEnemyHP = stageConfig.enemyHP;
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [feedbackPos, setFeedbackPos] = useState<{ x: number; y: number } | null>(null);
    const [shakeTarget, setShakeTarget] = useState<'none' | 'enemy' | 'player'>('none');
    const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
    const [isVictoryAnimationPlaying, setIsVictoryAnimationPlaying] = useState(false);
    const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
    const totalTime = stageConfig.totalTime;
    const problemStartTimeRef = useRef<number>(0); 
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [comboCount, setComboCount] = useState(0);
    const elapsedTimeWhenPausedRef = useRef<number>(0); // 一時停止時点の経過時間を保持 

    const isGameOver = playerHP <= 0;
    const isGameClear = enemyHP <= 0;

    const showDamage = (amount: number, target: 'enemy' | 'player') => {
        playDamage();
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
        setComboCount(0);
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
      const newProblem = generateProblem(stageConfig.calculationSettings);
      setCurrentProblem(newProblem); 
      setCurrentAnswer(""); 
      problemStartTimeRef.current = Date.now();
      elapsedTimeWhenPausedRef.current = 0; // 新しい問題開始時は経過時間をリセット
      setIsTimerActive(true); 
    }, [playerHP, enemyHP, stageConfig.calculationSettings]);

     useEffect(() => {
        if (isGameClear && !isVictoryAnimationPlaying) {
            playStageClear(); // ★★★ ここで勝利の効果音を再生 ★★★
            setIsTimerActive(false);
            setIsVictoryAnimationPlaying(true);
            
            const victoryTimer = setTimeout(() => {
                onBattleComplete(battleLog, true);
            }, 3000);
            
            return () => clearTimeout(victoryTimer);
        }

        if (isGameOver) {
            const gameOverTimer = setTimeout(() => {
                onBattleComplete(battleLog, false);
            }, 1500);
            return () => clearTimeout(gameOverTimer);
        }

        if (currentProblem === null && !isGameClear && !isGameOver) {
             const nextProblemTimer = setTimeout(() => { startNewProblem() }, 300);
             return () => clearTimeout(nextProblemTimer);
        }
    }, [isGameClear, isGameOver, currentProblem, battleLog, onBattleComplete, startNewProblem, isVictoryAnimationPlaying]); 


    const handleCheckAnswer = (e: React.MouseEvent) => {
        if (currentAnswer === "" || !currentProblem || isVictoryAnimationPlaying || showGiveUpConfirm) return;

        const timeTaken = Date.now() - problemStartTimeRef.current;
        setFeedbackPos({ x: e.clientX, y: e.clientY });

        // 筆算・横書きとも表示どおりの文字列で判定（"64" なら 64）
        const userAnswer = Number(currentAnswer);
        if (Number.isNaN(userAnswer)) return;

        if (userAnswer === currentProblem.answer) { 
            playCorrect();
            setIsTimerActive(false);
            setFeedback("correct");
            setShakeTarget('enemy');
            const timeRatio = Math.max(0, (totalTime - timeTaken) / totalTime);
            const minDamage = 50;
            const maxDamage = 250;
            const calculatedBaseDamage = minDamage + (maxDamage - minDamage) * timeRatio;
            const comboMultiplier = Math.min(2.0, 1.0 + comboCount * 0.1);
            const totalDamage = Math.round(calculatedBaseDamage * comboMultiplier);
            const nextEnemyHP = enemyHP - totalDamage;
            setEnemyHP(Math.max(0, nextEnemyHP));
            showDamage(totalDamage, 'enemy');
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: true, timeTaken, userInput: currentAnswer }]);
            setComboCount((prev) => prev + 1);
            if (nextEnemyHP > 0) {
                setCurrentProblem(null);
            }
            setTimeout(() => { setFeedback(null) }, 1000);
            setTimeout(() => setShakeTarget('none'), 500);
        } else {
            setShakeTarget('player');
            setFeedback("wrong");
            const damageAmount = stageConfig.damageOnMiss;
            setPlayerHP((prev) => Math.max(0, prev - damageAmount));
            showDamage(damageAmount, 'player');
            setComboCount(0);
            setBattleLog((prev) => [...prev, { problem: currentProblem, isCorrect: false, timeTaken, userInput: currentAnswer }]);
            setCurrentAnswer("");
            setTimeout(() => { setFeedback(null) }, 1000);
            setTimeout(() => setShakeTarget('none'), 500);
        }
    };
    
    const handleInput = (key: string) => {
        if (showGiveUpConfirm) return;
        playClick();

        const isVertical = stageConfig.displayMode === 'vertical';

        if (key === "⌫") {
            setCurrentAnswer((prev) => {
                if (prev === "") return prev;
                if (isVertical) {
                    // 筆算: 一番左（直近に入力した高い方の桁）を消す
                    return prev.slice(1);
                }
                return prev.slice(0, -1);
            });
            return;
        }

        if (!currentProblem) return;

        const maxAnswerLength = currentProblem.answer.toString().length;

        setCurrentAnswer((prev) => {
            if (prev.length >= maxAnswerLength) return prev;
            if (isVertical) {
                // 筆算: 一の位から入力し十の位が左に追加 → 「4」の次に「6」で "64"
                return key + prev;
            }
            return prev + key;
        });
    };

    const handleGiveUpClick = () => {
        playClick();
        // タイマーが動作中の場合、停止時点の経過時間を記録
        if (isTimerActive && currentProblem) {
            const elapsed = Date.now() - problemStartTimeRef.current;
            elapsedTimeWhenPausedRef.current = elapsed;
        }
        setIsTimerActive(false);
        setShowGiveUpConfirm(true);
    };

    const handleConfirmGiveUp = () => {
        playClick();
        onGiveUp();
    };

    const handleCancelGiveUp = () => {
        playClick();
        setShowGiveUpConfirm(false);
        // ゲームが終了していない場合は再開
        if (!isGameOver && !isGameClear && currentProblem) {
            // 停止時点の経過時間を考慮して、problemStartTimeRefを調整
            // これにより、タイマーは停止時点からの残り時間で再開される
            const elapsed = elapsedTimeWhenPausedRef.current;
            problemStartTimeRef.current = Date.now() - elapsed;
            setIsTimerActive(true);
        }
    };
    
    const animationDuration = totalTime / 1000;
  
    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-around p-4 font-sans relative overflow-hidden"
            style={{
                backgroundImage: `url(${stageConfig.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* あきらめるボタン */}
            <button
                onClick={handleGiveUpClick}
                className="absolute bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg z-30 transition-colors"
                disabled={isVictoryAnimationPlaying || isGameOver || isGameClear}
            >
                あきらめる
            </button>

            {/* あきらめる確認ダイアログ */}
            {showGiveUpConfirm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-2xl font-bold mb-4 text-center">本当に諦める？</h3>
                        <div className="flex gap-4 justify-center mt-6">
                            <button
                                onClick={handleConfirmGiveUp}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
                            >
                                はい
                            </button>
                            <button
                                onClick={handleCancelGiveUp}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
                            >
                                いいえ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isVictoryAnimationPlaying && (
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-50">
                    <div className="absolute inset-0 pointer-events-none">
                        <Lottie
                            animationData={victoryAnimationData}
                            loop={false}
                            // ★★★ アニメーションが終わったら画面遷移する ★★★
                            onComplete={() => onBattleComplete(battleLog, true)}
                        />
                    </div>
                    <span className="text-8xl font-black text-white animate-bounce" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                        WIN!!
                    </span>
                </div>
            )}


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

            <div className="w-full max-w-sm">
                <div className="text-xl font-bold text-gray-700 text-center mb-1">敵のHP</div>
                <div className="relative bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-400">
                    <div className="bg-red-600 h-full transition-all duration-300 ease-in-out" style={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }} />
                    <div className="absolute inset-0 flex justify-center items-center text-white font-bold text-sm tracking-wider" style={{textShadow: '1px 1px 2px black'}}>
                        {enemyHP} / {maxEnemyHP}
                    </div>
                </div>
            </div>

            <div className="mt-2 text-lg font-bold text-yellow-200 drop-shadow-md">
                コンボ: {comboCount}
            </div>

            <div className={`relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center`}>
                <div className={`transition-transform duration-300 ${shakeTarget === 'enemy' ? 'animate-shake' : ''}`}>
                    <img 
                        src={stageConfig.enemyImage} 
                        alt="敵キャラクター" 
                        className="w-full h-full object-contain opacity-60" 
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
                            stageConfig.displayMode === 'vertical' ? (
                                <div className="flex flex-col items-center justify-center w-full">
                                  <div className="inline-flex flex-col items-end font-mono text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                                    <div className="tabular-nums">
                                      {currentProblem.operand1}
                                    </div>
                                    <div className="tabular-nums flex items-center">
                                      <span className="mr-4">{currentProblem.operator}</span>
                                      {currentProblem.operand2}
                                    </div>
                                    <div className="w-full border-t-4 border-gray-800 mt-1" />
                                  </div>
                                </div>
                            ) : (
                                <span 
                                    className="text-4xl md:text-5xl font-bold text-gray-900 text-center"
                                    style={{ textShadow: '2px 0 #FFF, -2px 0 #FFF, 0 2px #FFF, 0 -2px #FFF, 1px 1px #FFF, -1px -1px #FFF, 1px -1px #FFF, -1px 1px #FFF' }}
                                >
                                    {currentProblem.text}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>

            {feedback && feedbackPos && (
                <div
                    className={`absolute text-4xl md:text-5xl font-extrabold pointer-events-none transition-opacity duration-1000 animate-fadeOut z-40 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
                    style={{ left: `${feedbackPos.x}px`, top: `${feedbackPos.y}px`, transform: "translate(-50%, -100%)" }}
                >
                    {feedback === "correct" ? "ナイス！" : "ミス！"}
                </div>
            )}

            <div className={`w-full max-w-xs ${shakeTarget === 'player' ? 'animate-shake' : ''}`}>
                <div className="mb-2 p-2 bg-white rounded-lg shadow-inner min-h-[4rem] flex items-center justify-center">
                    {stageConfig.displayMode === 'vertical' && currentProblem ? (
                        (() => {
                            const len = currentProblem.answer.toString().length;
                            const nextBoxIndex = currentAnswer.length < len ? len - 1 - currentAnswer.length : -1;
                            return (
                                <div className="flex flex-row gap-1 justify-center items-center">
                                    {Array.from({ length: len }).map((_, i) => {
                                        const digitIndex = currentAnswer.length - len + i;
                                        const digit = (digitIndex >= 0 && digitIndex < currentAnswer.length)
                                            ? currentAnswer[digitIndex]
                                            : '';
                                        const isNext = i === nextBoxIndex;
                                        return (
                                            <div
                                                key={i}
                                                className={`
                                                    w-12 h-16 flex items-center justify-center
                                                    border-2 rounded-md font-mono text-3xl font-bold
                                                    ${isNext ? 'border-blue-500 animate-pulse bg-blue-50' : 'border-gray-300 bg-gray-50'}
                                                `}
                                            >
                                                {digit}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()
                    ) : currentAnswer ? (
                        <span className="text-4xl md:text-5xl font-mono tracking-widest">{currentAnswer}</span>
                    ) : (
                        <span className="text-4xl md:text-5xl font-mono text-gray-400">?</span>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"].map((key) => (
                        <button key={key} onClick={() => handleInput(key)} className="bg-white text-2xl font-bold py-3 md:py-4 rounded-lg shadow-md active:shadow-inner active:bg-gray-100 transition-shadow">
                            {key}
                        </button>
                    ))}
                </div>
            </div>

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