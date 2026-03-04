/**
 * エリア1〜5のたまご・恐竜ドット絵アセット定義
 *
 * 参照先の対応:
 * - AreaSelectScreen から渡る area.id: 'area1' | 'area2' | 'area3' | 'area4' | 'area5'
 * - AREA_ID_TO_KEY: area1→grassland, area2→desert, area3→volcano, area4→snow, area5→swamp
 * - 実際のファイル: public/images/ に {key}_egg_01_normal.png 等（拡張子は .png または .png.png に合わせる）
 */
const BASE = '/images';

export type DinoAssetKey = 'grassland' | 'desert' | 'volcano' | 'snow' | 'swamp';

export interface AreaDinoAssets {
  egg1: string;
  egg2: string;
  egg3: string;
  egg4?: string;
  baby: string;
}

export const DINO_ASSETS: Record<DinoAssetKey, AreaDinoAssets> = {
  grassland: {
    egg1: `${BASE}/grassland_egg_01_normal.png.png`,
    egg2: `${BASE}/grassland_egg_02_cracked.png.png`,
    egg3: `${BASE}/grassland_egg_03_heavy.png.png`,
    egg4: `${BASE}/grassland_egg_04_hatching.png.png`,
    baby: `${BASE}/grassland_dino_05_baby.png.png`,
  },
  desert: {
    egg1: `${BASE}/desert_egg_01_normal.png.png`,
    egg2: `${BASE}/desert_egg_02_cracked.png.png`,
    egg3: `${BASE}/desert_egg_03_heavy.png.png`,
    egg4: `${BASE}/desert_egg_04_hatching.png.png`,
    baby: `${BASE}/desert_dino_05_baby.png.png`,
  },
  volcano: {
    egg1: `${BASE}/volcano_egg_01_normal.png.png`,
    egg2: `${BASE}/volcano_egg_02_cracked.png.png`,
    egg3: `${BASE}/volcano_egg_03_heavy.png.png`,
    egg4: `${BASE}/volcano_egg_04_hatching.png.png`,
    baby: `${BASE}/volcano_dino_05_baby.png.png`,
  },
  snow: {
    egg1: `${BASE}/snow_egg_01_normal.png.png`,
    egg2: `${BASE}/snow_egg_02_cracked.png.png`,
    egg3: `${BASE}/snow_egg_03_heavy.png.png`,
    egg4: `${BASE}/snow_egg_04_hatching.png.png`,
    baby: `${BASE}/snow_dino_05_baby.png.png`,
  },
  swamp: {
    egg1: `${BASE}/swamp_egg_01_normal.png.png`,
    egg2: `${BASE}/swamp_egg_02_cracked.png.png`,
    egg3: `${BASE}/swamp_egg_03_heavy.png.png`,
    baby: `${BASE}/swamp_dino_05_baby.png.png`,
  },
};

/** area.id（area1〜area5）→ DINO_ASSETS のキー */
const AREA_ID_TO_KEY: Record<string, DinoAssetKey> = {
  area1: 'grassland',
  area2: 'desert',
  area3: 'volcano',
  area4: 'snow',
  area5: 'swamp',
};

/**
 * エリアID（area1〜area5）から DINO_ASSETS を取得する
 * 該当しない場合は undefined
 */
export function getDinoAssetsByAreaId(areaId: string): AreaDinoAssets | undefined {
  const key = AREA_ID_TO_KEY[areaId];
  const assets = key ? DINO_ASSETS[key] : undefined;
  if (import.meta.env.DEV) {
    console.log('[dinoAssets] getDinoAssetsByAreaId', { areaId, key, resolved: !!assets, paths: assets });
  }
  return assets;
}
