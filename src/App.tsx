import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import AreaSelectScreen from './components/AreaSelectScreen';
import StageSelectScreen from './components/StageSelectScreen';
import BattleScreen from './components/BattleScreen';
import ResultScreen from './components/ResultScreen';
import type { StageConfig, BattleLogEntry, ScoreData } from './types/game';
import { areas } from './constants/areas';
import { loadScores, saveScore } from './utils/scoreStorage';
import { 
  playGameOver, 
  playClick, 
  manageBgm 
} from './utils/soundManager';

function App() {
  const [screen, setScreen] = useState<'start' | 'area' | 'select' | 'battle' | 'result'>('start');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [lastBattleLog, setLastBattleLog] = useState<BattleLogEntry[]>([]);
  const [wasGameClear, setWasGameClear] = useState(false);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState('');
  const [bestScores, setBestScores] = useState<Record<string, ScoreData>>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setBestScores(loadScores());
  }, []);

  // ★★★ BGMを管理する、唯一のuseEffect ★★★
  useEffect(() => {
    // ユーザーが一度もクリックしていなければ、何もしない
    if (!hasInteracted) return;

    let bgmSrc: string | null = null;

    switch (screen) {
      case 'area':
      case 'select':
        bgmSrc = '/sounds/エリアステージ選択画面.mp3';
        break;
      case 'battle':
        bgmSrc = '/sounds/恐竜の世界.mp3';
        break;
      case 'result':
        bgmSrc = wasGameClear ? '/sounds/勝利画面.mp3' : '/sounds/敗北画面.mp3';
        break;
      case 'start':
        bgmSrc = null; // nullを渡すとBGMが停止する
        break;
    }
    
    manageBgm(bgmSrc);

  }, [screen, wasGameClear, hasInteracted]);


  // --- これ以降のボタン用関数は、BGMの再生命令を一切行わない ---

  const handleStartGame = () => {
    playClick();
    setHasInteracted(true); // 最初の操作を記録
    setScreen('area');
  };

  const handleBackToStart = () => {
    playClick();
    setScreen('start');
  };

  const handleAreaSelect = (areaId: string) => {
    playClick();
    setSelectedAreaId(areaId);
    setScreen('select');
  };
  
  const handleBackToAreaSelect = () => {
    playClick();
    setScreen('area');
  };

  const handleStageSelect = (stage: StageConfig) => {
    playClick();
    setSelectedStage(stage);
    setScreen('battle');
  };

  const handleBattleComplete = (log: BattleLogEntry[], isClear: boolean) => {
    // 勝利・敗北の効果音はBattleScreenに任せる
    if (!isClear) {
      playGameOver();
    }
    
    if (!selectedStage) return;
    
    const correctAnswers = log.filter(l => l.isCorrect).length;
    const totalAttempts = log.length;
    const mistakes = totalAttempts - correctAnswers;
    const accuracyScore = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 5000 : 0;
    const sumOfTimeSaved = log.filter(l => l.isCorrect).reduce((sum, l) => sum + (selectedStage.totalTime - l.timeTaken), 0);
    const maxPossibleTimeSaved = correctAnswers * selectedStage.totalTime;
    const timeBonusScore = maxPossibleTimeSaved > 0 ? (sumOfTimeSaved / maxPossibleTimeSaved) * 5000 : 0;
    const mistakePenalty = totalAttempts > 0 ? (mistakes / totalAttempts) * 5000 : 0;
    const finalScore = Math.max(0, Math.round(accuracyScore + timeBonusScore - mistakePenalty));
    
    let finalRank = 'D';
    if (finalScore >= 9000) finalRank = 'S';
    else if (finalScore >= 7500) finalRank = 'A';
    else if (finalScore >= 5000) finalRank = 'B';
    else if (finalScore >= 2500) finalRank = 'C';

     saveScore(selectedStage.id, finalScore, finalRank);
    setBestScores(loadScores());
    setLastBattleLog(log);
    setWasGameClear(isClear);
    setScore(finalScore);
    setRank(finalRank);
    setScreen('result');
  };

  const handleGoToSelect = () => {
    playClick();
    setScreen('select');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'start':
        return <StartScreen onStartGame={handleStartGame} />;
      
      case 'area':
        return (
          <AreaSelectScreen
            areas={areas.map(a => ({ id: a.id, name: a.name }))}
            onAreaSelect={handleAreaSelect}
            onBackToStart={handleBackToStart}
          />
        );

      case 'select': {
        const currentArea = areas.find(a => a.id === selectedAreaId);
        if (!currentArea) {
            return (
                <AreaSelectScreen
                    areas={areas.map(a => ({ id: a.id, name: a.name }))}
                    onAreaSelect={handleAreaSelect}
                    onBackToStart={handleBackToStart}
                />
            );
        }
        return (
          <StageSelectScreen
            stages={currentArea.stages}
            onStageSelect={handleStageSelect}
            onBackToAreaSelect={handleBackToAreaSelect}
            bestScores={bestScores}
          />
        );
      }

      case 'battle':
        if (selectedStage) {
          return (
            <BattleScreen
              key={selectedStage.id}
              stageConfig={selectedStage}
              onBattleComplete={handleBattleComplete}
            />
          );
        }
        return null;

      case 'result':
        return (
          <ResultScreen
            isGameClear={wasGameClear}
            battleLog={lastBattleLog}
            onGoToSelect={handleGoToSelect}
            score={score}
            rank={rank}
            bestScore={bestScores[selectedStage?.id || '']?.bestScore}
          />
        );

      default:
        return <StartScreen onStartGame={handleStartGame} />;
    }
  };

  return <div className="App font-sans">{renderScreen()}</div>;
}

export default App;