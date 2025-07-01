import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import StageSelectScreen from './components/StageSelectScreen';
import BattleScreen from './components/BattleScreen';
import ResultScreen from './components/ResultScreen';
import type { StageConfig, BattleLogEntry, ScoreData } from './types';
import { loadScores, saveScore } from './utils/scoreStorage';

const stages: StageConfig[] = [
  { id: 1, name: 'ステージ1：かんたんなたしざん',enemyImage: '/images/stage1-1.png', enemyHP: 500, totalTime: 10000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['+'], }, damageOnMiss: 25, },
  { id: 2, name: 'ステージ2：たしざんとひきざん',enemyImage: '/images/stage1-1.png', enemyHP: 800, totalTime: 8000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['+', '-'], }, damageOnMiss: 50, },
  { id: 3, name: 'ステージ3：むずかしいバトル',enemyImage: '/images/stage1-1.png', enemyHP: 1200, totalTime: 6000, problemOptions: { digits1: 2, digits2: 1, allowedOperators: ['+', '-', '×'], }, damageOnMiss: 75, },
  { id: 4, name: 'ステージ4：九九のれんしゅう！',enemyImage: '/images/stage1-1.png', enemyHP: 1000, totalTime: 7000, problemOptions: { digits1: 1, digits2: 1, allowedOperators: ['×'], }, damageOnMiss: 60, },
];

function App() {
  const [screen, setScreen] = useState<'start' | 'select' | 'battle' | 'result'>('start');
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [lastBattleLog, setLastBattleLog] = useState<BattleLogEntry[]>([]);
  const [wasGameClear, setWasGameClear] = useState(false);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState('');
  const [bestScores, setBestScores] = useState<Record<string, ScoreData>>({});

  useEffect(() => {
    setBestScores(loadScores());
  }, []);

  const handleStartGame = () => setScreen('select');
  const handleBackToStart = () => setScreen('start');

  const handleStageSelect = (stage: StageConfig) => {
    setSelectedStage(stage);
    setScreen('battle');
  };

  const handleBattleComplete = (log: BattleLogEntry[], isClear: boolean) => {
    console.log("--- バトル終了！ ---");
    console.log("受け取ったログ:", log);

    if (!selectedStage) {
      console.error("ステージが選択されていません！");
      return;
    }

    // スコア計算ロジック...
    const correctAnswers = log.filter(l => l.isCorrect).length;
    const totalAttempts = log.length;
    const mistakes = totalAttempts - correctAnswers;
    const accuracyScore = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 5000 : 0;
    const sumOfTimeSaved = log.filter(l => l.isCorrect).reduce((sum, l) => sum + (selectedStage.totalTime - l.timeTaken), 0);
    const maxPossibleTimeSaved = correctAnswers * selectedStage.totalTime;
    const timeBonusScore = maxPossibleTimeSaved > 0 ? (sumOfTimeSaved / maxPossibleTimeSaved) * 5000 : 0;
    const mistakePenalty = totalAttempts > 0 ? (mistakes / totalAttempts) * 5000 : 0;
    const finalScore = Math.round(accuracyScore + timeBonusScore - mistakePenalty);
    
    let finalRank = 'D';
    if (finalScore >= 9000) finalRank = 'S';
    else if (finalScore >= 7500) finalRank = 'A';
    else if (finalScore >= 5000) finalRank = 'B';
    else if (finalScore >= 2500) finalRank = 'C';

    console.log(`計算結果 => スコア: ${finalScore}, ランク: ${finalRank}`);

    saveScore(selectedStage.id, finalScore, finalRank);
    console.log("スコアをlocalStorageに保存しました。");

    const updatedScores = loadScores();
    console.log("localStorageから再読み込みしたベストスコア:", updatedScores);
    setBestScores(updatedScores);

    setLastBattleLog(log);
    setWasGameClear(isClear);
    setScore(finalScore);
    setRank(finalRank);
    setScreen('result');
    console.log("--- リザルト画面へ遷移します ---");
  };

  const handleGoToSelect = () => setScreen('select');

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
            bestScores={bestScores}
          />
        );
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

  return <div className="App">{renderScreen()}</div>;
}

export default App;