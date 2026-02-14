import type { AreaConfig } from '../types/game';
import { CalculationPresets } from '../utils/mathLogic';

/**
 * エリアとステージの設定データ
 * 新しいエリアやステージを追加する場合は、このファイルを編集してください
 */
export const areas: AreaConfig[] = [
  {
    id: 'area1',
    name: 'はじまりの草原',
    description: '初心者向けのエリアです',
    image: '/images/世界地図.png',
    stages: [
      {
        id: 1,
        name: 'ステージ1：かんたんなたしざん',
        backgroundImage: '/images/草原.png',
        enemyImage: '/images/stage1-1.png',
        enemyHP: 500,
        totalTime: 10000,
        calculationSettings: CalculationPresets.singleDigitAdditionNoCarry,
        damageOnMiss: 25,
      },
      {
        id: 2,
        name: 'ステージ2：たしざんとひきざん',
        backgroundImage: '/images/草原.png',
        enemyImage: '/images/stage1-1.png',
        enemyHP: 800,
        totalTime: 8000,
        calculationSettings: CalculationPresets.singleDigitAdditionSubtraction,
        damageOnMiss: 50,
      },
    ],
  },
  {
    id: 'area2',
    name: 'しんぴの森',
    description: '中級者向けのエリアです',
    image: '/images/世界地図.png',
    stages: [
      {
        id: 3,
        name: 'ステージ3：むずかしいバトル',
        backgroundImage: '/images/森林.png',
        enemyImage: '/images/stage1-1.png',
        enemyHP: 1200,
        totalTime: 6000,
        calculationSettings: CalculationPresets.mixedOperations,
        damageOnMiss: 75,
      },
      {
        id: 4,
        name: 'ステージ4：九九のれんしゅう！',
        backgroundImage: '/images/森林.png',
        enemyImage: '/images/stage1-1.png',
        enemyHP: 1000,
        totalTime: 7000,
        calculationSettings: CalculationPresets.multiplicationTable,
        damageOnMiss: 60,
      },
    ],
  },
  // 新しいエリアを追加する場合は、ここに追加してください
  // {
  //   id: 'area3',
  //   name: '砂漠の遺跡',
  //   description: '上級者向けのエリアです',
  //   image: '/images/世界地図.png',
  //   stages: [
  //     {
  //       id: 5,
  //       name: 'ステージ5：二桁の計算',
  //       backgroundImage: '/images/砂漠.png',
  //       enemyImage: '/images/stage1-1.png',
  //       enemyHP: 1500,
  //       totalTime: 5000,
  //       calculationSettings: CalculationPresets.twoDigitAdditionSubtraction,
  //       damageOnMiss: 100,
  //     },
  //   ],
  // },
];

/**
 * ステージIDからステージ設定を取得するヘルパー関数
 */
export function getStageById(stageId: number): import('../types/game').StageConfig | undefined {
  for (const area of areas) {
    const stage = area.stages.find(s => s.id === stageId);
    if (stage) return stage;
  }
  return undefined;
}

/**
 * エリアIDからエリア設定を取得するヘルパー関数
 */
export function getAreaById(areaId: string): AreaConfig | undefined {
  return areas.find(a => a.id === areaId);
}
