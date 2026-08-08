import { SupabaseClient } from '@supabase/supabase-js'

type ScoreJoueur = {
  utilisateur_id: string
  pseudo: string
  score_saison: number
  meilleure_semaine: number
  semaines_parfaites: number
}

export async function calculerClassementSaison(
  supabase: SupabaseClient,
  saison_id: number
): Promise<ScoreJoueur[]> {
  // 1. Toutes les semaines de cette saison
  const { data: semaines } = await supabase
    .from('semaines')
    .select('*')
    .eq('saison_id', saison_id)

  if (!semaines || semaines.length === 0) return []

  const semaineIds = semaines.map((s) => s.id)

  // 2. Tous les matchs de ces semaines
  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .in('semaine_id', semaineIds)

  if (!matchs || matchs.length === 0) return []

  const matchIds = matchs.map((m) => m.id)

  // 3. Tous les pronostics sur ces matchs
  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchIds)

  if (!pronostics || pronostics.length === 0) return []

  // 4. Tous les pseudos concernés
  const userIds = [...new Set(pronostics.map((p) => p.utilisateur_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', userIds)

  const pseudoMap = new Map((profiles ?? []).map((p) => [p.id, p.pseudo]))

  // Structure pratique : match_id -> match
  const matchMap = new Map(matchs.map((m) => [m.id, m]))

  // Regrouper les scores par utilisateur, puis par semaine
  const scoresParUtilisateur = new Map<string, Map<number, number>>()

  for (const semaine of semaines) {
    const matchsDeLaSemaine = matchs.filter((m) => m.semaine_id === semaine.id)
    const matchsTermines = matchsDeLaSemaine.filter((m) => m.statut === 'termine')

    // Pour chaque utilisateur ayant pronostiqué cette semaine
    for (const userId of userIds) {
      const mesPronosSemaine = pronostics.filter(
        (p) => p.utilisateur_id === userId && matchsDeLaSemaine.some((m) => m.id === p.match_id)
      )

      let corrects = 0
      for (const prono of mesPronosSemaine) {
        const match = matchMap.get(prono.match_id)
        if (match && match.statut === 'termine' && prono.equipe_choisie === match.equipe_gagnante) {
          corrects++
        }
      }

      let scoreSemaine = corrects * (semaine.points_par_pronostic ?? 1)

      // Bonus, seulement si tous les matchs de la semaine sont terminés
      if (matchsTermines.length === matchsDeLaSemaine.length && matchsDeLaSemaine.length > 0) {
        if (semaine.seuil_bonus_2 && corrects >= semaine.seuil_bonus_2) {
          scoreSemaine += semaine.bonus_2 ?? 0
        } else if (semaine.seuil_bonus_1 && corrects >= semaine.seuil_bonus_1) {
          scoreSemaine += semaine.bonus_1 ?? 0
        }
        if (corrects === matchsDeLaSemaine.length) {
          scoreSemaine += semaine.bonus_perfect ?? 0
        }
      }

      if (!scoresParUtilisateur.has(userId)) {
        scoresParUtilisateur.set(userId, new Map())
      }
      scoresParUtilisateur.get(userId)!.set(semaine.id, scoreSemaine)
    }
  }

  // Construction du résultat final
  const resultat: ScoreJoueur[] = []
  for (const [userId, scoresSemaines] of scoresParUtilisateur) {
    const scores = [...scoresSemaines.values()]
    const scoreSaison = scores.reduce((a, b) => a + b, 0)
    const meilleureSemaine = scores.length > 0 ? Math.max(...scores) : 0
    const semainesParfaites = semaines.filter((s) => {
      const matchsSemaine = matchs.filter((m) => m.semaine_id === s.id)
      return scoresSemaines.get(s.id) !== undefined &&
        matchsSemaine.length > 0 &&
        matchsSemaine.every((m) => m.statut === 'termine')
    }).length

    resultat.push({
      utilisateur_id: userId,
      pseudo: pseudoMap.get(userId) ?? 'Joueur inconnu',
      score_saison: scoreSaison,
      meilleure_semaine: meilleureSemaine,
      semaines_parfaites: semainesParfaites, // simplifié pour l'instant, à affiner plus tard
    })
  }

  // Tri par score décroissant
  resultat.sort((a, b) => b.score_saison - a.score_saison)

  return resultat
}