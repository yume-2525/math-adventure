import React from 'react';

// StartScreenが受け取るpropsの型を定義
interface StartScreenProps {
  onStartGame: () => void; // ゲーム開始ボタンが押されたことを親に通知する関数
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">Math Battle</h1>
      <p className="text-xl text-gray-600 mb-12">計算で恐竜を倒せ！</p>
      <button
        onClick={onStartGame}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
      >
        ゲームスタート
      </button>
    </div>
  );
};

export default StartScreen;