import React from 'react';
import { motion } from 'framer-motion';
import { getDinoAssetsByAreaId } from '../constants/dinoAssets';

const PIXELATED_CLASS = 'object-contain w-full h-full [image-rendering:pixelated]';

interface AreaProgressGaugeProps {
  current: number;
  total: number;
  areaImage?: string;
  areaId?: string;
  /** true のとき「current/total」のテキストを非表示（エリア名に統合する場合など） */
  hideProgressText?: boolean;
  /** 表示サイズを1.5倍にする（エリア選択画面用） */
  large?: boolean;
}

const AreaProgressGauge: React.FC<AreaProgressGaugeProps> = ({ current, total, areaImage, areaId, hideProgressText, large }) => {
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
  const assets = areaId ? getDinoAssetsByAreaId(areaId) : undefined;

  const getEggImageSrc = () => {
    if (!assets) return null;
    if (eggState === 'hatched') return assets.baby;
    if (eggState === 'cracked-heavy') return assets.egg3;
    if (eggState === 'cracked-light') return assets.egg2;
    return assets.egg1;
  };

  const eggImageSrc = getEggImageSrc();
  if (import.meta.env.DEV && eggImageSrc) {
    console.log('[AreaProgressGauge] img src', { areaId, eggState, src: eggImageSrc });
  }

  const sizeClass = large ? 'w-36 h-36' : 'w-24 h-24';
  const iconClass = large ? 'w-[4.5rem] h-[4.5rem]' : 'w-12 h-12';

  return (
    <div className={`relative flex items-center ${sizeClass}`}>
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
        {eggImageSrc ? (
          <motion.div
            initial={eggState === 'hatched' ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={iconClass}
          >
            <img
              src={eggImageSrc}
              alt={eggState === 'hatched' ? '恐竜' : 'たまご'}
              className={PIXELATED_CLASS}
            />
          </motion.div>
        ) : eggState === 'hatched' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={iconClass}
          >
            {areaImage ? (
              <img src={areaImage} alt="恐竜" className={`w-full h-full object-contain [image-rendering:pixelated]`} />
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
            className={`${iconClass} relative`}
          >
            <div className="w-full h-full bg-gradient-to-b from-amber-100 to-amber-200 rounded-full border-2 border-amber-300" />
            {eggState === 'cracked-heavy' && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                <path d="M 32 10 Q 20 15, 15 25 Q 10 35, 12 45 Q 14 55, 20 58 Q 25 60, 30 58 Q 35 56, 38 52" fill="none" stroke="#8b5a3c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 32 10 Q 44 15, 49 25 Q 54 35, 52 45 Q 50 55, 44 58 Q 39 60, 34 58 Q 29 56, 26 52" fill="none" stroke="#8b5a3c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 20 30 L 44 35" fill="none" stroke="#8b5a3c" strokeWidth="1.5" />
                <path d="M 25 40 L 39 42" fill="none" stroke="#8b5a3c" strokeWidth="1.5" />
              </svg>
            )}
            {eggState === 'cracked-light' && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                <path d="M 32 10 Q 25 20, 20 30 Q 18 40, 22 50" fill="none" stroke="#8b5a3c" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 32 10 Q 39 20, 44 30 Q 46 40, 42 50" fill="none" stroke="#8b5a3c" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </motion.div>
        )}
      </div>

      {!hideProgressText && (
        <div className="absolute left-full ml-3 text-sm font-bold text-gray-700 whitespace-nowrap">
          {current}/{total}
        </div>
      )}
    </div>
  );
};

export default AreaProgressGauge;
