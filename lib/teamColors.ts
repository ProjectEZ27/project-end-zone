export interface TeamColor {
  primary: string
  primaryRgb: string
  dark: string
}

export const COULEURS_EQUIPES: Record<string, TeamColor> = {
  ARI: { primary: '#97233F', primaryRgb: '151, 35, 63', dark: '#4a1120' },
  ATL: { primary: '#A71930', primaryRgb: '167, 25, 48', dark: '#530c18' },
  BAL: { primary: '#241773', primaryRgb: '36, 23, 115', dark: '#120b3a' },
  BUF: { primary: '#00338D', primaryRgb: '0, 51, 141', dark: '#001a47' },
  CAR: { primary: '#0085CA', primaryRgb: '0, 133, 202', dark: '#004365' },
  CHI: { primary: '#0B162A', primaryRgb: '11, 22, 42', dark: '#050b15' },
  CIN: { primary: '#FB4F14', primaryRgb: '251, 79, 20', dark: '#7d280a' },
  CLE: { primary: '#FF3C00', primaryRgb: '255, 60, 0', dark: '#801e00' },
  DAL: { primary: '#003594', primaryRgb: '0, 53, 148', dark: '#001a4a' },
  DEN: { primary: '#FB4F14', primaryRgb: '251, 79, 20', dark: '#7d280a' },
  DET: { primary: '#0076B6', primaryRgb: '0, 118, 182', dark: '#003b5b' },
  GB:  { primary: '#203731', primaryRgb: '32, 55, 49', dark: '#101c19' },
  HOU: { primary: '#03202F', primaryRgb: '3, 32, 47', dark: '#010f17' },
  IND: { primary: '#002C5F', primaryRgb: '0, 44, 95', dark: '#001630' },
  JAX: { primary: '#006778', primaryRgb: '0, 103, 120', dark: '#00343c' },
  KC:  { primary: '#E31837', primaryRgb: '227, 24, 55', dark: '#710c1b' },
  LA:  { primary: '#003594', primaryRgb: '0, 53, 148', dark: '#001a4a' },
  LAC: { primary: '#0080C6', primaryRgb: '0, 128, 198', dark: '#004063' },
  LV:  { primary: '#000000', primaryRgb: '40, 40, 40', dark: '#000000' },
  MIA: { primary: '#008E97', primaryRgb: '0, 142, 151', dark: '#00474c' },
  MIN: { primary: '#4F2683', primaryRgb: '79, 38, 131', dark: '#281342' },
  NE:  { primary: '#002244', primaryRgb: '0, 34, 68', dark: '#001122' },
  NO:  { primary: '#9F8149', primaryRgb: '159, 129, 73', dark: '#4a3c22' },
  NYG: { primary: '#0B2265', primaryRgb: '11, 34, 101', dark: '#051133' },
  NYJ: { primary: '#125740', primaryRgb: '18, 87, 64', dark: '#092c20' },
  PHI: { primary: '#004C54', primaryRgb: '0, 76, 84', dark: '#00262a' },
  PIT: { primary: '#1a1a1a', primaryRgb: '26, 26, 26', dark: '#000000' },
  SEA: { primary: '#002244', primaryRgb: '0, 34, 68', dark: '#00112a' },
  SF:  { primary: '#AA0000', primaryRgb: '170, 0, 0', dark: '#550000' },
  TB:  { primary: '#D50A0A', primaryRgb: '213, 10, 10', dark: '#6b0505' },
  TEN: { primary: '#0C2340', primaryRgb: '12, 35, 64', dark: '#061120' },
  WAS: { primary: '#5A1414', primaryRgb: '90, 20, 20', dark: '#2d0a0a' },
}

export function getCouleurEquipe(code: string): TeamColor {
  return COULEURS_EQUIPES[code] ?? { primary: '#333333', primaryRgb: '51, 51, 51', dark: '#1a1a1a' }
}