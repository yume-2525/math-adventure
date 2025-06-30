import { useState } from 'react';
import StartScreen from './components/StartScreen';
import StageSelectScreen from './components/StageSelectScreen';
import BattleScreen from './components/BattleScreen';
import ResultScreen from './components/ResultScreen';
import type { StageConfig, BattleLogEntry } from './types';

// ステージ定義 (これは変更なし)
const stages: StageConfig[] = [
  // ... ステージ1, 2, 3 の定義 ...
];

function App() {
  // ★ 画面の状態を管理する state を拡張
  const [screen, setScreen] = useState<'start' | 'select' | 'battle' | 'result'>('start');
  
  // 選択されたステージを管理
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  
  // バトルの結果を管理
  const [lastBattleLog, setLastBattleLog] = useState<BattleLogEntry[]>([]);
  const [wasGameClear, setWasGameClear] = useState(false);

  // --- 画面遷移のハンドラ関数 ---

  const handleStartGame = () => {
    setScreen('select');
  };

  const handleBackToStart = () => {
    setScreen('start');
  };

  const handleStageSelect = (stage: StageConfig) => {
    setSelectedStage(stage);
    setScreen('battle');
  };

  const handleBattleComplete = (log: BattleLogEntry[], isClear: boolean) => {
    setLastBattleLog(log);
    setWasGameClear(isClear);
    setScreen('result');
  };

  const handleGoToSelect = () => {
    setScreen('select');
  };

  // --- 表示する画面を決定 ---

  const renderScreen = () => {
    switch (screen) {
      case 'start':
        return <StartScreen onStartGame={handleStartGame} />;
      
      case 'select':
        return (
          <StageSelectScreen
            stages={stages}
            onStageSelect={handleStageSelect}
            onBackToStart={handleBackToStart}
          />
        );

      case 'battle':
        if (selectedStage) {
          return (
            <BattleScreen
              stageConfig={selectedStage}
              onBattleComplete={handleBattleComplete}
            />
          );
        }
        return null; // ステージが選択されていなければ何も表示しない

      case 'result':
        return (
          <ResultScreen
            isGameClear={wasGameClear}
            battleLog={lastBattleLog}
            onGoToSelect={handleGoToSelect}
          />
        );

      default:
        return <StartScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;