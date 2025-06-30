import React from 'react';
import type { ResultScreenProps } from '../types';

// ★ onRetry を onGoToSelect に変更
const ResultScreen: React.FC<Omit<ResultScreenProps, 'onRetry'> & { onGoToSelect: () => void }> = ({ isGameClear, battleLog, onGoToSelect }) => {
    // ... (計算ロジックは変更なし) ...
    const totalProblems = battleLog.length;
    const correctAnswers = battleLog.filter(log => log.isCorrect).length;
    // ...

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4">
            { /* ... */ }
            <button
                // ★ onClickの処理を onGoToSelect に変更
                onClick={onGoToSelect}
                className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl"
            >
                ステージ選択へ
            </button>
        </div>
    );
};

export default ResultScreen;