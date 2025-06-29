// src/components/ResultScreen.tsx

import React from 'react';
import type { BattleLogEntry, ResultScreenProps } from '../types/index';

const ResultScreen: React.FC<ResultScreenProps> = ({ isGameClear, battleLog, onRetry }) => {
    const totalProblems = battleLog.length;
    const correctAnswers = battleLog.filter(log => log.isCorrect).length;
    const accuracyRate = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

    const totalCorrectTime = battleLog
        .filter(log => log.isCorrect)
        .reduce((sum, log) => sum + log.timeTaken, 0);
    const avgCorrectTime = correctAnswers > 0 ? totalCorrectTime / correctAnswers : 0;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4">
            <h2 className="text-4xl font-bold mb-8">
                {isGameClear ? "バトルクリア！おめでとう！" : "ゲームオーバー..."}
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-lg">
                <p className="mb-2">正答率: {accuracyRate.toFixed(1)}%</p>
                <p className="mb-2">平均回答時間 (正解時): {avgCorrectTime.toFixed(1)}ms</p>
                <h3 className="text-xl font-semibold mt-4 mb-2">問題ごとの正誤</h3>
                <ul className="list-disc list-inside max-h-60 overflow-y-auto">
                    {battleLog.map((entry, index) => (
                        <li key={index} className={entry.isCorrect ? "text-green-700" : "text-red-700"}>
                            問{index + 1}: {/* ★修正箇所: Optional Chaining を使用して null チェック ★ */}
                            {entry.problem ? `${entry.problem.text} = ${entry.problem.answer}` : '問題なし'}
                            ({entry.isCorrect ? "正解" : "不正解"}) - {entry.timeTaken.toFixed(0)}ms
                        </li>
                    ))}
                </ul>
            </div>
            <button
                onClick={onRetry}
                className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl"
            >
                もう一度挑戦！
            </button>
        </div>
    );
};

export default ResultScreen;