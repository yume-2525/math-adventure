import React from 'react';
import type { ResultScreenProps } from '../types';
import { getRankColor } from '../utils/styleHelper';

const ResultScreen: React.FC<ResultScreenProps> = ({ isGameClear, battleLog, onGoToSelect, score, rank, bestScore = 0 }) => {
    const totalProblems = battleLog.length;
    const correctAnswers = battleLog.filter(log => log.isCorrect).length;
    const accuracyRate = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

    const totalCorrectTime = battleLog
        .filter(log => log.isCorrect)
        .reduce((sum, log) => sum + log.timeTaken, 0);
    const avgCorrectTime = correctAnswers > 0 ? totalCorrectTime / correctAnswers : 0;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
            <h2 className="text-5xl font-bold mb-4">
                {isGameClear ? "🎉 BATTLE CLEAR! 🎉" : "GAME OVER..."}
            </h2>
            
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center mb-8">
                <p className="text-xl text-gray-600">あなたのランクは...</p>
                <p className={`text-9xl font-black my-2 ${getRankColor(rank)}`}>{rank}</p>
                <p className="text-2xl text-gray-800 font-bold">SCORE: {score.toLocaleString()}</p>
                
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500">ベストスコア</p>
                  <p className="text-xl font-bold text-yellow-600">{bestScore.toLocaleString()}</p>
                  {score > bestScore && (
                    <p className="text-lg font-bold text-red-500 animate-pulse mt-1">🎉 NEW RECORD! 🎉</p>
                  )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-lg">
                <h3 className="text-xl font-semibold mb-2 text-center">バトルのきろく</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">正答率</p>
                        <p className="text-2xl font-bold">{accuracyRate.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">平均タイム</p>
                        <p className="text-2xl font-bold">{(avgCorrectTime / 1000).toFixed(2)}<span className="text-sm">秒</span></p>
                    </div>
                </div>
                <details className="mt-4">
                    <summary className="cursor-pointer text-center text-blue-500">問題ごとの記録をみる</summary>
                 <ul className="max-h-48 overflow-y-auto mt-2 p-2 bg-gray-50 rounded space-y-1 text-base">
                        {battleLog.map((entry, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <div className={entry.isCorrect ? '' : 'text-red-500'}>
                                    <span className="mr-2">{entry.isCorrect ? '⭕️' : '❌'}</span>
                                    {/* 不正解の時は、問題と「入力した答え」を表示 */}
                                    {entry.isCorrect 
                                        ? <span>{entry.problem.text} = {entry.problem.answer}</span>
                                        : <span>{entry.problem.text} = {entry.userInput || '?'}</span>
                                    }
                                </div>
                                <span className="font-mono text-gray-600">
                                    {(entry.timeTaken / 1000).toFixed(2)}秒
                                </span>
                            </li>
                        ))}
                    </ul>
                </details>
            </div>
            <button
                onClick={onGoToSelect}
                className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl"
            >
                ステージ選択へ
            </button>
        </div>
    );
};

export default ResultScreen;