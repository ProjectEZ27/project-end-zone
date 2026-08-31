// Récupère le classement Power Index (FPI, force des équipes) depuis l'API ESPN.
// ⚠️ API non officielle, non documentée par ESPN.

const ESPN_CODE_VERS_CODE_SITE: Record<string, string> = {
  ARI: 'ARI', ATL: 'ATL', BAL: 'BAL', BUF: 'BUF', CAR: 'CAR', CHI: 'CHI',
  CIN: 'CIN', CLE: 'CLE', DAL: 'DAL', DEN: 'DEN', DET: 'DET', GB: 'GB',
  HOU: 'HOU', IND: 'IND', JAX: 'JAX', KC: 'KC', LAC: 'LAC', LAR: 'LA',
  LV: 'LV', MIA: 'MIA', MIN: 'MIN', NE: 'NE', NO: 'NO', NYG: 'NYG',
  NYJ: 'NYJ', PHI: 'PHI', PIT: 'PIT', SEA: 'SEA', SF: 'SF', TB: 'TB',
  TEN: 'TEN', WSH: 'WAS',
}

export interface EquipePower {
  code: string
  rang: number
  fpi: number | null
}

export async function getPowerIndexRanking(annee: number): Promise<EquipePower[]> {
  try {
    const resSaison = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${annee}/powerindex?limit=40`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    )
    if (!resSaison.ok) return []
    const dataSaison = await resSaison.json()

    const refs: string[] = (dataSaison.items ?? [])
      .map((item: any) => item?.$ref)
      .filter(Boolean)

    if (refs.length === 0) return []

    const equipes = await Promise.all(
      refs.map(async (ref) => {
        try {
          const res = await fetch(ref, { next: { revalidate: 60 * 60 * 24 * 7 } })
          if (!res.ok) return null
          const data = await res.json()

          const stats: any[] = data?.stats ?? []
          const rangStat = stats.find((s) => s.name === 'fpirank')
          const fpiStat = stats.find((s) => s.name === 'fpi')
          const rang = rangStat?.value ?? null

          const teamRef = data?.team?.$ref as string | undefined
          if (!teamRef || !rang) return null

          const resTeam = await fetch(teamRef, { next: { revalidate: 60 * 60 * 24 * 7 } })
          if (!resTeam.ok) return null
          const dataTeam = await resTeam.json()
          const espnCode = dataTeam?.abbreviation as string | undefined
          const code = espnCode ? (ESPN_CODE_VERS_CODE_SITE[espnCode] ?? espnCode) : null

          if (!code) return null
          return { code, rang, fpi: fpiStat?.value ?? null }
        } catch {
          return null
        }
      })
    )

    return equipes
      .filter((e): e is EquipePower => e !== null)
      .sort((a, b) => a.rang - b.rang)
  } catch {
    return []
  }
}