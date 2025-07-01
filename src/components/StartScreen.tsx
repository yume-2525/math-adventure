import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">Math Battle</h1>
      {/* ★★★ コンセプトを変更 ★★★ */}
      <p className="text-xl text-gray-600 mb-12">計算で恐竜を追い払え！</p>
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