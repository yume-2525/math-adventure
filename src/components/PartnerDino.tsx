import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDinoAssetsByAreaId } from '../constants/dinoAssets';
import { getPartnerMessage, getRandomChatter } from '../utils/dailyMission';

const PIXELATED_CLASS = 'object-contain w-full h-full [image-rendering:pixelated]';

export interface PartnerDinoProps {
  /** 相棒の種類（エリアIDで baby 画像・性格を決定） */
  areaId: string;
  /** 今日のミッションクリア数 (0〜5) */
  completedCount: number;
  /** 今日すでにエサをあげたか */
  isFedToday: boolean;
  /** AIセリフ生成中は true（吹き出しに「考え中」表示） */
  isAiLoading?: boolean;
  /** 今日生成されたAIのセリフ（ある場合は固定メッセージより優先） */
  aiMessage?: string | null;
  /** エサやりボタン押下時に呼ばれる（好感度・lastFedDate の更新は呼び出し側で実施） */
  onFeed: () => void | Promise<void>;
}

const PartnerDino: React.FC<PartnerDinoProps> = ({
  areaId,
  completedCount,
  isFedToday,
  isAiLoading = false,
  aiMessage = null,
  onFeed,
}) => {
  const assets = getDinoAssetsByAreaId(areaId);
  const imageSrc = assets?.baby;
  const fixedMessage = getPartnerMessage(areaId, completedCount, isFedToday);
  const canFeed = completedCount === 5 && !isFedToday;
  const [isBouncing, setIsBouncing] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [tappedMessage, setTappedMessage] = useState('');
  const [tapBounce, setTapBounce] = useState(false);

  const handleFeed = useCallback(() => {
    if (!canFeed) return;
    onFeed();
    setIsBouncing(true);
  }, [canFeed, onFeed]);

  const handleDinoClick = useCallback(() => {
    if (canFeed) {
      handleFeed();
      return;
    }
    setTappedMessage(getRandomChatter(areaId, isFedToday ? 'fed' : 'idle'));
    setIsTapped(true);
    setTapBounce(true);
  }, [canFeed, isFedToday, areaId, handleFeed]);

  useEffect(() => {
    if (!isTapped) return;
    const t = window.setTimeout(() => setIsTapped(false), 2500);
    return () => window.clearTimeout(t);
  }, [isTapped]);

  const message = isTapped ? tappedMessage : (aiMessage?.trim() ? aiMessage : fixedMessage);

  const isBounceActive = isBouncing || tapBounce;
  const animateState = isBouncing
    ? { y: [0, -20, 0], scale: [1, 1.2, 1] }
    : tapBounce
      ? { y: [0, -14, 0], scale: [1, 1.2, 1] }
      : { y: [0, -5, 0] };
  const transitionState = isBounceActive
    ? { duration: 0.4, ease: 'easeOut' as const }
    : { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-md">
      <div className="flex items-end gap-2 flex-shrink-0">
        <motion.div
          animate={animateState}
          transition={transitionState}
          onAnimationComplete={() => {
            if (isBouncing) setIsBouncing(false);
            if (tapBounce) setTapBounce(false);
          }}
          className="w-14 h-14 flex-shrink-0 flex items-center justify-center"
        >
          <button
            type="button"
            onClick={handleDinoClick}
            className="w-full h-full cursor-pointer block focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-full"
            aria-label="相棒の恐竜をタップ"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="相棒の恐竜"
                className={PIXELATED_CLASS}
              />
            ) : (
              <div className="w-full h-full bg-amber-200 rounded-full flex items-center justify-center text-2xl">
                🦕
              </div>
            )}
          </button>
        </motion.div>
        {canFeed && (
          <button
            type="button"
            onClick={handleFeed}
            className="flex-shrink-0 text-sm font-bold py-2 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-400 whitespace-nowrap"
          >
            🍖（お肉）をあげる
          </button>
        )}
      </div>

      {/* 吹き出し（Speech Bubble） */}
      <div className="relative flex-1 min-w-0 w-full">
        <div className="bg-white border-2 border-gray-300 rounded-xl px-3 py-2 shadow-md">
          {isAiLoading ? (
            <p className="text-sm text-gray-500 leading-relaxed animate-pulse">
              ……（考え中）
            </p>
          ) : (
            <p className="text-sm text-gray-800 leading-relaxed">{message}</p>
          )}
        </div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 hidden sm:block"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid #d1d5db',
          }}
        />
      </div>
    </div>
  );
};

export default PartnerDino;
