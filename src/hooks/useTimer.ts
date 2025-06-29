// src/hooks/useTimer.ts
import { useState, useEffect, useRef } from 'react';

// カスタムタイマーフックのインターフェース
interface UseTimerProps {
  totalTime: number; // 合計時間 (ミリ秒)
  onTimeout: () => void; // タイムアウト時に呼び出すコールバック関数 (useCallbackでラップ推奨)
  shouldStartTimer: boolean; // タイマーが動作中かどうか (親コンポーネントから制御)
  problemStartTimeRef: React.MutableRefObject<number>; // 問題開始時刻を保持するRef
}

/**
 * requestAnimationFrame を使って時間切れを監視するカスタムフック
 * @param {number} totalTime - タイマーの合計時間 (ms)
 * @param {function} onTimeout - タイムアウト時に呼び出すコールバック関数 (useCallbackでラップ推奨)
 * @param {boolean} shouldStartTimer - タイマーを開始/継続するかどうか (trueで開始/継続、falseで停止)
 * @param {React.MutableRefObject<number>} problemStartTimeRef - 問題開始時刻を保持するRef
 */
export const useTimer = ({ totalTime, onTimeout, shouldStartTimer, problemStartTimeRef }: UseTimerProps) => {
  const timerIdRef = useRef<number | null>(null); // requestAnimationFrame IDを保持

  useEffect(() => {
    // shouldStartTimer が true の場合のみタイマーを起動
    if (shouldStartTimer) {
      // 既にタイマーが動いている場合はクリア (念のため)
      if (timerIdRef.current) {
        cancelAnimationFrame(timerIdRef.current);
      }

      console.log('--- useTimer: タイマー起動 ---');

      const checkTime = () => {
        const now = Date.now();
        const elapsed = now - problemStartTimeRef.current;

        // デバッグログ: カスタムフック内で時間経過を追跡
        console.log('useTimer - elapsed:', elapsed, 'remaining:', totalTime - elapsed);

        if (elapsed >= totalTime) {
          console.log('useTimer - TIMEOUT!');
          // タイムアウトしたらタイマーを停止
          if (timerIdRef.current) {
            cancelAnimationFrame(timerIdRef.current);
            timerIdRef.current = null; // IDをクリア
          }
          onTimeout(); // 親コンポーネントにタイムアウトを通知
        } else {
          // 次のフレームを要求
          timerIdRef.current = requestAnimationFrame(checkTime);
        }
      };

      // 初回の requestAnimationFrame を開始
      timerIdRef.current = requestAnimationFrame(checkTime);

    } else {
      // shouldStartTimer が false になったらタイマーを停止
      if (timerIdRef.current) {
        console.log('--- useTimer: タイマー停止 ---');
        cancelAnimationFrame(timerIdRef.current);
        timerIdRef.current = null; // IDをクリア
      }
    }

    // クリーンアップ関数: コンポーネントがアンマウントされるとき、または shouldStartTimer が変わるときに呼ばれる
    return () => {
      if (timerIdRef.current) {
        console.log('--- useTimer: クリーンアップ実行 ---');
        cancelAnimationFrame(timerIdRef.current);
        timerIdRef.current = null; // IDをクリア
      }
    };
    // onTimeout は useCallback でラップされているので、参照が変わらない限り再実行されない
    // problemStartTimeRef は Ref なので、.current を通してアクセスすれば依存配列に不要
  }, [shouldStartTimer, totalTime, onTimeout, problemStartTimeRef]); // 依存配列: shouldStartTimer で起動/停止を制御
};