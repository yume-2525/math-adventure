import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick } from '../utils/soundManager';

interface HatchingAnimationProps {
  areaImage?: string;
  areaName: string;
  onComplete: () => void;
}

type HatchingStep = 'premonition' | 'hatching' | 'celebration' | 'complete';

const HatchingAnimation: React.FC<HatchingAnimationProps> = ({ areaImage, areaName, onComplete }) => {
  const [step, setStep] = useState<HatchingStep>('premonition');

  const handleNext = () => {
    playClick();
    if (step === 'premonition') {
      setStep('hatching');
      // 孵化アニメーション後に自動で祝福へ
      setTimeout(() => {
        setStep('celebration');
      }, 2000);
    } else if (step === 'celebration') {
      setStep('complete');
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        onClick={step === 'premonition' || step === 'celebration' ? handleNext : undefined}
      >
        {step === 'premonition' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center relative"
          >
            <h3 className="text-2xl font-bold mb-4">たまごに変化が...？</h3>
            <div className="text-lg text-gray-600 mb-6">
              {areaName}のたまごが何かを感じているようです...
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-4 right-4 text-2xl cursor-pointer"
              onClick={handleNext}
            >
              ▶
            </motion.div>
          </motion.div>
        )}

        {step === 'hatching' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* たまごの震えアニメーション */}
            <motion.div
              animate={{
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="w-48 h-48 relative"
            >
              <div className="w-full h-full bg-gradient-to-b from-amber-100 to-amber-200 rounded-full border-4 border-amber-300 relative overflow-hidden">
                {/* ヒビのアニメーション */}
                <motion.svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 200 200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const x1 = 100 + Math.cos(angle) * 30;
                    const y1 = 100 + Math.sin(angle) * 30;
                    const x2 = 100 + Math.cos(angle) * 80;
                    const y2 = 100 + Math.sin(angle) * 80;
                    return (
                      <motion.line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#8b5a3c"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      />
                    );
                  })}
                </motion.svg>
              </div>
            </motion.div>

            {/* 光のエフェクト */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2 }}
            />
          </motion.div>
        )}

        {step === 'celebration' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            {/* 紙吹雪エフェクト */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, 1000],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                }}
              />
            ))}

            {/* 恐竜の出現 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-48 h-48 mb-8 relative z-10"
            >
              {areaImage ? (
                <img src={areaImage} alt="恐竜" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center text-8xl">
                  🦕
                </div>
              )}
            </motion.div>

            {/* エリアクリアテキスト */}
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-black text-yellow-400 mb-4 relative z-10"
              style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)' }}
            >
              エリアクリア!!
            </motion.h2>

            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-8 text-2xl cursor-pointer text-white relative z-10"
              onClick={handleNext}
            >
              ▶
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HatchingAnimation;
