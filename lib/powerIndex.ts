import { CLASSEMENT_MANUEL } from './powerRankingManuel'

export interface EquipePower {
  code: string
  rang: number
  fpi: number | null
}

export async function getPowerIndexRanking(_annee: number): Promise<EquipePower[]> {
  return CLASSEMENT_MANUEL.map((code, index) => ({
    code,
    rang: index + 1,
    fpi: null,
  }))
}