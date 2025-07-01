import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import AreaSelectScreen from './components/AreaSelectScreen';
import StageSelectScreen from './components/StageSelectScreen';
import BattleScreen from './components/BattleScreen';
import ResultScreen from './components/ResultScreen';
import type { StageConfig, BattleLogEntry, ScoreData } from './types';
import { loadScores, saveScore } from './utils/scoreStorage';
import { 
  playStageClear, 
  playGameOver, 
  playClick, 
  playStartBgm, // ★ インポート
  playAreaBgm,
  playStageSelectBgm,
  playBattleBgm,
  playVictoryBgm,
  playDefeatBgm,
  stopBgm
} from './utils/soundManager';

const areas = [
  { id: 'area1', name: 'はじまりの草原', stages: [
      { id: 1, name: 'ステージ1：かんたんなたしざん', enemyImage: '/images/stage1-1.png', enemyHP: 500, totalTime: 10000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['+'] as const, }, damageOnMiss: 25, },
      { id: 2, name: 'ステージ2：たしざんとひきざん', enemyImage: '/images/stage1-1.png', enemyHP: 800, totalTime: 8000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['+', '-'] as const, }, damageOnMiss: 50, },
  ]},
  { id: 'area2', name: 'しんぴの森', stages: [
      { id: 3, name: 'ステージ3：むずかしいバトル', enemyImage: '/images/stage1-1.png', enemyHP: 1200, totalTime: 6000, problemOptions: { digits1: 2, digits2: 1, allowedOperators: ['+', '-', '×'] as const, }, damageOnMiss: 75, },
      { id: 4, name: 'ステージ4：九九のれんしゅう！', enemyImage: '/images/stage1-1.png', enemyHP: 1000, totalTime: 7000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['×'] as const, }, damageOnMiss: 60, },
  ]},
];

function App() {
  const [screen, setScreen] = useState<'start' | 'area' | 'select' | 'battle' | 'result'>('start');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [lastBattleLog, setLastBattleLog] = useState<BattleLogEntry[]>([]);
  const [wasGameClear, setWasGameClear] = useState(false);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState('');
  const [bestScores, setBestScores] = useState<Record<string, ScoreData>>({});

  useEffect(() => {
    setBestScores(loadScores());
  }, []);

  const handleStartGame = () => {
    playClick();
    playAreaBgm();
    setScreen('area');
  };

  const handleBackToStart = () => {
    playClick();
    playStartBgm(); // ★ BGMを停止する代わりに、スタート画面のBGMを再生
    setScreen('start');
  };

  const handleAreaSelect = (areaId: string) => {
    playClick();
    playStageSelectBgm();
    setSelectedAreaId(areaId);
    setScreen('select');
  };
  
  const handleBackToAreaSelect = () => {
    playClick();
    playAreaBgm();
    setScreen('area');
  };

  const handleStageSelect = (stage: StageConfig) => {
    playClick();
    playBattleBgm();
    setSelectedStage(stage);
    setScreen('battle');
  };

  const handleBattleComplete = (log: BattleLogEntry[], isClear: boolean) => {
    stopBgm();
    if (isClear) {
      playStageClear();
      playVictoryBgm();
    } else {
      playGameOver();
      playDefeatBgm();
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
    playStageSelectBgm();
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