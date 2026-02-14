// --- 効果音(SE) ---
export const playClick = () => { new Audio('/sounds/button_pressed.mp3').play(); };
export const playCorrect = () => { new Audio('/sounds/attack.mp3').play(); };
export const playDamage = () => { new Audio('/sounds/damage.mp3').play(); };
export const playStageClear = () => { new Audio('/sounds/victory.mp3').play(); };
export const playGameOver = () => { new Audio('/sounds/lose.mp3').play(); };


// --- BGM ---
let currentBgm: HTMLAudioElement | null = null;
let currentBgmSrc: string | null = null;

/**
 * BGMを管理する唯一の関数。
 * @param src 再生したい曲のパス。nullを渡すと停止する。
 */
export const manageBgm = (src: string | null) => {
  // 1. 停止命令が来た場合
  if (!src) {
    if (currentBgm) {
      currentBgm.pause();
      currentBgm = null;
      currentBgmSrc = null;
    }
    return;
  }

  // 2. すでに同じ曲が再生中の場合は、何もしない
  const fullSrc = new URL(src, window.location.href).href;
  if (currentBgm && currentBgmSrc === fullSrc) {
    return;
  }

  // 3. 違う曲が再生中か、何も流れていない場合は、新しい曲を再生
  if (currentBgm) {
    currentBgm.pause();
  }
  
  currentBgm = new Audio(src);
  currentBgmSrc = fullSrc;
  currentBgm.loop = true;
  currentBgm.volume = 0.3;
  currentBgm.play().catch(error => {
    console.log("BGMの自動再生がブロックされました。最初のクリック後に再生が開始されます。", error);
  });
};