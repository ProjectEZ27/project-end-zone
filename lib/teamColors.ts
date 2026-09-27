export interface TeamColor {
  primary: string
  primaryRgb: string
  secondary: string
  dark: string
}

export const COULEURS_EQUIPES: Record<string, TeamColor> = {
  ARI: { primary: '#97233F', primaryRgb: '151, 35, 63',  secondary: '#FFB612', dark: '#4a1120' },
  ATL: { primary: '#A71930', primaryRgb: '167, 25, 48',  secondary: '#A5ACAF', dark: '#530c18' },
  BAL: { primary: '#241773', primaryRgb: '36, 23, 115',  secondary: '#9E7C0C', dark: '#120b3a' },
  BUF: { primary: '#00338D', primaryRgb: '0, 51, 141',   secondary: '#C60C30', dark: '#001a47' },
  CAR: { primary: '#0085CA', primaryRgb: '0, 133, 202',  secondary: '#BFC0BF', dark: '#004365' },
  CHI: { primary: '#0B162A', primaryRgb: '11, 22, 42',   secondary: '#C83803', dark: '#050b15' },
  CIN: { primary: '#FB4F14', primaryRgb: '251, 79, 20',  secondary: '#000000', dark: '#7d280a' },
  CLE: { primary: '#FF3C00', primaryRgb: '255, 60, 0',   secondary: '#311D00', dark: '#801e00' },
  DAL: { primary: '#003594', primaryRgb: '0, 53, 148',   secondary: '#869397', dark: '#001a4a' },
  DEN: { primary: '#FB4F14', primaryRgb: '251, 79, 20',  secondary: '#002244', dark: '#7d280a' },
  DET: { primary: '#0076B6', primaryRgb: '0, 118, 182',  secondary: '#B0B7BC', dark: '#003b5b' },
  GB:  { primary: '#203731', primaryRgb: '32, 55, 49',   secondary: '#FFB612', dark: '#101c19' },
  HOU: { primary: '#03202F', primaryRgb: '3, 32, 47',    secondary: '#A71930', dark: '#010f17' },
  IND: { primary: '#002C5F', primaryRgb: '0, 44, 95',    secondary: '#A2AAAD', dark: '#001630' },
  JAX: { primary: '#006778', primaryRgb: '0, 103, 120',  secondary: '#D7A22A', dark: '#00343c' },
  KC:  { primary: '#E31837', primaryRgb: '227, 24, 55',  secondary: '#FFB81C', dark: '#710c1b' },
  LA:  { primary: '#003594', primaryRgb: '0, 53, 148',   secondary: '#FFA300', dark: '#001a4a' },
  LAC: { primary: '#0080C6', primaryRgb: '0, 128, 198',  secondary: '#FFC20E', dark: '#004063' },
  LV:  { primary: '#000000', primaryRgb: '40, 40, 40',   secondary: '#A5ACAF', dark: '#000000' },
  MIA: { primary: '#008E97', primaryRgb: '0, 142, 151',  secondary: '#FC4C02', dark: '#00474c' },
  MIN: { primary: '#4F2683', primaryRgb: '79, 38, 131',  secondary: '#FFC62F', dark: '#281342' },
  NE:  { primary: '#002244', primaryRgb: '0, 34, 68',    secondary: '#C60C30', dark: '#001122' },
  NO:  { primary: '#9F8149', primaryRgb: '159, 129, 73', secondary: '#000000', dark: '#4a3c22' },
  NYG: { primary: '#0B2265', primaryRgb: '11, 34, 101',  secondary: '#A71930', dark: '#051133' },
  NYJ: { primary: '#125740', primaryRgb: '18, 87, 64',   secondary: '#000000', dark: '#092c20' },
  PHI: { primary: '#004C54', primaryRgb: '0, 76, 84',    secondary: '#A5ACAF', dark: '#00262a' },
  PIT: { primary: '#1a1a1a', primaryRgb: '26, 26, 26',   secondary: '#FFB612', dark: '#000000' },
  SEA: { primary: '#002244', primaryRgb: '0, 34, 68',    secondary: '#69BE28', dark: '#00112a' },
  SF:  { primary: '#AA0000', primaryRgb: '170, 0, 0',    secondary: '#B3995D', dark: '#550000' },
  TB:  { primary: '#D50A0A', primaryRgb: '213, 10, 10',  secondary: '#FF7900', dark: '#6b0505' },
  TEN: { primary: '#0C2340', primaryRgb: '12, 35, 64',   secondary: '#4B92DB', dark: '#061120' },
  WAS: { primary: '#5A1414', primaryRgb: '90, 20, 20',   secondary: '#FFB612', dark: '#2d0a0a' },
}

export function getCouleurEquipe(code: string): TeamColor {
  return COULEURS_EQUIPES[code] ?? { primary: '#333333', primaryRgb: '51, 51, 51', secondary: '#C8352E', dark: '#1a1a1a' }
}

export function estCouleurClaire(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance >= 128
}

// Couleur à utiliser comme accent sur un fond sombre : la primaire si elle est
// assez lumineuse pour ressortir, sinon la secondaire (généralement plus claire).
export function getCouleurAccent(code: string): string {
  const { primary, secondary } = getCouleurEquipe(code)
  const r = parseInt(primary.slice(1, 3), 16)
  const g = parseInt(primary.slice(3, 5), 16)
  const b = parseInt(primary.slice(5, 7), 16)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance < 60 ? secondary : primary
}