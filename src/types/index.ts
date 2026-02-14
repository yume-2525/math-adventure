/**
 * 後方互換性のため、game.tsから型を再エクスポート
 * 新しいコードでは types/game.ts を直接インポートすることを推奨します
 */
export type {
  StageConfig,
  BattleLogEntry,
  ResultScreenProps,
  ScoreData,
  AreaConfig,
  CalculationSettings,
} from './game';