import React from 'react';
import { motion } from 'framer-motion';

interface AreaProgressGaugeProps {
  current: number;
  total: number;
  areaImage?: string;
}

const AreaProgressGauge: React.FC<AreaProgressGaugeProps> = ({ current, total, areaImage }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const circumference = 2 * Math.PI * 30; // 半径30pxの円周
  const offset = circumference - (percentage / 100) * circumference;

  // 達成率に応じた色の決定
  const getGaugeColor = () => {
    if (percentage === 100) {
      return 'url(#goldGradient)';
    }
    if (percentage >= 80) {
      return '#ef4444'; // 赤
    }
    if (percentage >= 60) {
      return '#f97316'; // オレンジ
    }
    if (percentage >= 50) {
      return '#eab308'; // 黄色
    }
    if (percentage >= 40) {
      return '#84cc16'; // 黄緑
    }
    if (percentage >= 30) {
      return '#22c55e'; // 緑
    }
    if (percentage >= 20) {
      return '#3b82f6'; // 青
    }
    return '#06b6d4'; // 水色
  };

  // たまごの状態を決定
  const getEggState = () => {
    if (percentage === 100) return 'hatched';
    if (percentage >= 80) return 'cracked-heavy';
    if (percentage >= 50) return 'cracked-light';
    return 'smooth';
  };

  const eggState = getEggState();

  return (
    <div className="relative w-24 h-24 flex items-center">
      {/* SVG ドーナツ型ゲージ */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <defs>
          {/* ゴールドグラデーション */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffed4e" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* 背景円 */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        
        {/* プログレス円 */}
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={getGaugeColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: percentage === 100 ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none',
          }}
        />
      </svg>

      {/* 中央のたまご/恐竜アイコン */}
      <div className="absolute inset-0 flex items-center justify-center">
        {eggState === 'hatched' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-12 h-12"
          >
            {areaImage ? (
              <img src={areaImage} alt="恐竜" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center text-xl">
                🦕
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={percentage === 100 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="w-12 h-12 relative"
          >
            {/* たまごのベース */}
            <div className="w-full h-full bg-gradient-to-b from-amber-100 to-amber-200 rounded-full border-2 border-amber-300" />
            
            {/* ヒビの描画 */}
            {eggState === 'cracked-heavy' && (
              <>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                  <path
                    d="M 32 10 Q 20 15, 15 25 Q 10 35, 12 45 Q 14 55, 20 58 Q 25 60, 30 58 Q 35 56, 38 52"
                    fill="none"
                    stroke="#8b5a3c"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 32 10 Q 44 15, 49 25 Q 54 35, 52 45 Q 50 55, 44 58 Q 39 60, 34 58 Q 29 56, 26 52"
                    fill="none"
                    stroke="#8b5a3c"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 30 L 44 35"
                    fill="none"
                    stroke="#8b5a3c"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 25 40 L 39 42"
                    fill="none"
                    stroke="#8b5a3c"
                    strokeWidth="1.5"
                  />
                </svg>
              </>
            )}
            {eggState === 'cracked-light' && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                <path
                  d="M 32 10 Q 25 20, 20 30 Q 18 40, 22 50"
                  fill="none"
                  stroke="#8b5a3c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 32 10 Q 39 20, 44 30 Q 46 40, 42 50"
                  fill="none"
                  stroke="#8b5a3c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </motion.div>
        )}
      </div>

      {/* 達成率テキスト */}
      <div className="absolute left-full ml-3 text-sm font-bold text-gray-700 whitespace-nowrap">
        {current}/{total}
      </div>
    </div>
  );
};

export default AreaProgressGauge;
