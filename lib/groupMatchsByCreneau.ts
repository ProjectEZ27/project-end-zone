export interface MatchLike {
  id: string
  coup_envoi: string
  statut: string
  [key: string]: any
}

export interface Creneau {
  coupEnvoi: string
  matchs: MatchLike[]
  estActif: boolean
  estVerrouille: boolean
}

export function grouperMatchsParCreneau(matchs: MatchLike[]): Creneau[] {
  const groupesMap = new Map<string, MatchLike[]>()

  for (const match of matchs) {
    const cle = match.coup_envoi
    const liste = groupesMap.get(cle) ?? []
    liste.push(match)
    groupesMap.set(cle, liste)
  }

  const creneauxTries = Array.from(groupesMap.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())

  let actifTrouve = false

  return creneauxTries.map(([coupEnvoi, matchsDuCreneau]) => {
    const estVerrouille = matchsDuCreneau.every((m) => m.statut !== 'a_venir')
    const estActif = !estVerrouille && !actifTrouve

    if (estActif) {
      actifTrouve = true
    }

    return { coupEnvoi, matchs: matchsDuCreneau, estActif, estVerrouille }
  })
}