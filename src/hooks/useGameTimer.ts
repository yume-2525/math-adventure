import { useEffect, useRef, useCallback } from 'react';

interface UseGameTimerProps {
  totalTime: number; // 合計時間 (ミリ秒)
  onTimeout: () => void; // タイムアウト時に呼び出すコールバック関数 (useCallbackでラップ必須)
  shouldStartTimer: boolean; // タイマーが動作中かどうか (親コンポーネントから制御)
  problemStartTimeRef: React.MutableRefObject<number>; // 問題開始時刻のRef
}

/**
 * requestAnimationFrame を使って時間切れを監視し、指定されたコールバックを一度だけ実行するカスタムフック
 * 親コンポーネントの State 更新に影響されにくいよう設計。
 */
export const useGameTimer = ({ totalTime, onTimeout, shouldStartTimer, problemStartTimeRef }: UseGameTimerProps) => {
  const animationFrameIdRef = useRef<number | null>(null); // requestAnimationFrame IDを保持
  const onTimeoutCallbackRef = useRef(onTimeout); // onTimeout 関数の最新参照を保持

  // onTimeout 関数の参照が変わったときに Ref を更新
  useEffect(() => {
    onTimeoutCallbackRef.current = onTimeout;
  }, [onTimeout]);


  useEffect(() => {
    // タイマーを開始すべき場合
    if (shouldStartTimer) {
      // 既に動いているタイマーがあれば念のためクリア
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      console.log('--- useGameTimer: タイマー起動 ---');

      const tick = () => {
        const now = Date.now();
        const elapsed = now - problemStartTimeRef.current;

        // コンソールで残り時間を確認したい場合はこのコメントを外してください
        // console.log('useGameTimer - tick: elapsed:', elapsed, 'remaining:', totalTime - elapsed);

        if (elapsed >= totalTime) {
          console.log('useGameTimer - TIMEOUT!');
          // タイムアウトしたらタイマーを停止
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }
          onTimeoutCallbackRef.current(); // 親に通知 (最新のonTimeout関数を呼び出す)
        } else {
          // 次のフレームを要求
          animationFrameIdRef.current = requestAnimationFrame(tick);
        }
      };

      // 初回の requestAnimationFrame を開始
      animationFrameIdRef.current = requestAnimationFrame(tick);

    } else {
      // タイマーを停止すべき場合
      if (animationFrameIdRef.current) {
        console.log('--- useGameTimer: タイマー停止 ---');
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }

    // クリーンアップ関数: コンポーネントがアンマウントされるとき、または依存配列の値が変わるときに呼ばれる
    return () => {
      if (animationFrameIdRef.current) {
        console.log('--- useGameTimer: クリーンアップ実行 ---');
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [shouldStartTimer, totalTime, problemStartTimeRef, onTimeout]); // 依存配列: shouldStartTimer で起動/停止を制御
};