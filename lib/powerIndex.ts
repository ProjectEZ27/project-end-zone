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
    if (!resSaison.ok) {
      console.error('powerIndex: resSaison pas ok', resSaison.status)
      return []
    }
    const dataSaison = await resSaison.json()
    const items: any[] = dataSaison.items ?? []
    console.log('powerIndex: nombre items reçus', items.length)

    const equipes = await Promise.all(
      items.map(async (item) => {
        try {
          const predictives: any[] = item?.predictives ?? []
          const rangStat = predictives.find((s) => s.name === 'fpirank')
          const fpiStat = predictives.find((s) => s.name === 'fpi')
          const rang = rangStat?.value ?? null

          const teamRef = item?.team?.$ref as string | undefined
          if (!teamRef || !rang) {
            console.error('powerIndex: teamRef ou rang manquant', { teamRef, rang })
            return null
          }

          const resTeam = await fetch(teamRef, { next: { revalidate: 60 * 60 * 24 * 7 } })
          if (!resTeam.ok) {
            console.error('powerIndex: fetch team pas ok', resTeam.status, teamRef)
            return null
          }
          const dataTeam = await resTeam.json()
          const espnCode = dataTeam?.abbreviation as string | undefined
          const code = espnCode ? (ESPN_CODE_VERS_CODE_SITE[espnCode] ?? espnCode) : null

          if (!code) {
            console.error('powerIndex: code manquant', { espnCode, teamRef })
            return null
          }
          return { code, rang, fpi: fpiStat?.value ?? null }
        } catch (e) {
          console.error('powerIndex: exception sur une équipe', e)
          return null
        }
      })
    )

    const resultat = equipes.filter((e): e is EquipePower => e !== null)
    console.log('powerIndex: équipes valides trouvées', resultat.length)

    return resultat.sort((a, b) => a.rang - b.rang)
  } catch (e) {
    console.error('powerIndex: erreur générale', e)
    return []
  }
}