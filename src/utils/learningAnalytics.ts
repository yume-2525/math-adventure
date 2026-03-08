/**
 * 学習分析レポート生成（AI通訳レイヤー）
 *
 * ゲーム内の数値データ（スコア・クリア状況・ステージ名など）を、
 * AI（Gemini）が理解しやすい「言葉」に翻訳するためのモジュールです。
 * プロンプトに渡す前に、生データを自然なレポート文にまとめます。
 */

import type { ScoreData } from '../utils/scoreStorage';
import { getAreaIdByStageId, getAreaById } from '../constants/areas';

/**
 * 今日の学習内容を、AIが読みやすいテキストレポートにまとめる
 *
 * @param completedMissionStageIds 今日のミッションのうちクリア済みのステージID一覧
 * @param bestScores ステージ別のベストスコア（キーはステージIDの文字列）
 * @param todayMissionStageIds 今日のミッションに含まれるステージID一覧
 * @returns AI用の自然言語レポート（プロンプトにそのまま渡せる形）
 */
export function generateLearningReport(
  completedMissionStageIds: number[],
  bestScores: Record<string, ScoreData>,
  todayMissionStageIds: number[]
): string {
  const completed = completedMissionStageIds.filter((id) => todayMissionStageIds.includes(id));
  if (completed.length === 0) {
    return '今日はまだ冒険に出ていないようです。';
  }

  const totalCount = todayMissionStageIds.length;
  const completedCount = completed.length;

  // エリアごとのクリア数を集計
  const areaSummary: Record<string, number> = {};
  let totalScore = 0;

  for (const stageId of completed) {
    const areaId = getAreaIdByStageId(stageId);
    if (areaId) {
      areaSummary[areaId] = (areaSummary[areaId] ?? 0) + 1;
    }
    const data = bestScores[String(stageId)];
    if (data?.bestScore != null) {
      totalScore += data.bestScore;
    }
  }

  const avgScore = totalScore / completedCount;

  // エリア名をリスト化
  const areaNames = Object.keys(areaSummary)
    .map((id) => getAreaById(id)?.name)
    .filter(Boolean)
    .join('、');

  // スコアに応じた評価メッセージ（AIへのヒント）
  let performanceNote = '一生懸命取り組んでいます。';
  if (avgScore >= 9000) performanceNote = '完璧な理解度で、非常にスピーディーに解けています。天才的です！';
  else if (avgScore >= 8000) performanceNote = 'とても優秀な成績で、正確に計算できています。';
  else if (avgScore >= 7000) performanceNote = '合格ラインをしっかり超えて、着実に実力をつけています。';

  return `
【今日の学習レポート】
- ミッション達成度: ${completedCount} / ${totalCount} ステージクリア
- 挑戦したエリア: ${areaNames}
- 平均スコア: ${Math.floor(avgScore)}点
- パフォーマンス評価: ${performanceNote}

このデータを元に、相棒恐竜として子供を褒めてあげてください。
`.trim();
}
