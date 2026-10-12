type MatchLike = {
  statut: string
  score_a: number | null
  score_b: number | null
}

type SemaineLike = {
  seuil_bonus_1?: number | null
  seuil_bonus_2?: number | null
  bonus_1?: number | null
  bonus_2?: number | null
  bonus_perfect?: number | null
}

export function estMatchNul(match: MatchLike): boolean {
  return (
    match.statut === 'termine' &&
    match.score_a !== null &&
    match.score_b !== null &&
    match.score_a === match.score_b
  )
}

const SEUILS_PAR_NOMBRE_DE_MATCHS: Record<number, { seuil1: number; seuil2: number; perfect: number }> = {
  16: { seuil1: 6, seuil2: 12, perfect: 5 },
  15: { seuil1: 6, seuil2: 11, perfect: 5 },
  14: { seuil1: 5, seuil2: 10, perfect: 4 },
  13: { seuil1: 5, seuil2: 9, perfect: 4 },
}

export function seuilsSemaine(
  semaine: SemaineLike,
  nombreMatchsComptes: number,
  nombreMatchsTotal: number
) {
  const base = {
    seuil_bonus_1: semaine.seuil_bonus_1 ?? null,
    seuil_bonus_2: semaine.seuil_bonus_2 ?? null,
    bonus_1: semaine.bonus_1 ?? null,
    bonus_2: semaine.bonus_2 ?? null,
    bonus_perfect: semaine.bonus_perfect ?? null,
  }

  // Pas de match nul : on garde les valeurs de la base
  if (nombreMatchsComptes === nombreMatchsTotal) return base

  const t = SEUILS_PAR_NOMBRE_DE_MATCHS[nombreMatchsComptes]
  if (!t) return base

  return {
    ...base,
    seuil_bonus_1: t.seuil1,
    seuil_bonus_2: t.seuil2,
    bonus_perfect: t.perfect,
  }
}