// --- 効果音(SE) ---
export const playClick = () => { new Audio('/sounds/button_pressed.mp3').play(); };
export const playCorrect = () => { new Audio('/sounds/attack.mp3').play(); };
export const playDamage = () => { new Audio('/sounds/damage.mp3').play(); };
export const playStageClear = () => { new Audio('/sounds/victory.mp3').play(); };
export const playGameOver = () => { new Audio('/sounds/lose.mp3').play(); };


// --- BGM ---
// ★★★ アプリで使うBGMを、最初にすべて読み込んでおく ★★★
const bgmFiles = {
  start: new Audio('/sounds/スタート画面.mp3'),
  area: new Audio('/sounds/エリア選択画面.mp3'),
  stageSelect: new Audio('/sounds/ステージ選択画面.mp3'),
  battle: new Audio('/sounds/恐竜の世界.mp3'),
  victory: new Audio('/sounds/勝利画面.mp3'),
  defeat: new Audio('/sounds/敗北画面.mp3'),
};

// 全てのBGMに共通の設定を適用
Object.values(bgmFiles).forEach(bgm => {
  bgm.loop = true;
  bgm.volume = 0.3;
});

let currentBgm: HTMLAudioElement | null = null;

// ★★★ BGMを切り替えるための内部関数 ★★★
const switchBgm = (nextBgm: HTMLAudioElement | null) => {
  // すでに同じ曲が再生中なら何もしない
  if (currentBgm === nextBgm) return;

  // 今流れている曲があれば、停止して最初まで巻き戻す
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }

  // 次の曲を再生
  if (nextBgm) {
    nextBgm.play().catch(error => console.error("BGM Playback Error:", error));
  }
  
  // 現在の曲を更新
  currentBgm = nextBgm;
};

// ★★★ 外部から呼び出すための関数 ★★★
export const playStartBgm = () => switchBgm(bgmFiles.start);
export const playAreaBgm = () => switchBgm(bgmFiles.area);
export const playStageSelectBgm = () => switchBgm(bgmFiles.stageSelect);
export const playBattleBgm = () => switchBgm(bgmFiles.battle);
export const playVictoryBgm = () => switchBgm(bgmFiles.victory);
export const playDefeatBgm = () => switchBgm(bgmFiles.defeat);
export const stopBgm = () => switchBgm(null); // nullを渡すと停止する