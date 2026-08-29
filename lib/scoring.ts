import { SupabaseClient } from '@supabase/supabase-js'

type ScoreJoueur = {
  utilisateur_id: string
  pseudo: string
  score_saison: number
  meilleure_semaine: number
  semaines_parfaites: number
  meilleur_pourcentage_semaine: number
}

export async function calculerClassementSaison(
  supabase: SupabaseClient,
  saison_id: number
): Promise<ScoreJoueur[]> {
  // 1. Toutes les semaines de cette saison (régulière ET playoffs, aucune distinction)
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
  // Détail par semaine pour le départage : complète ? parfaite ? % de réussite ?
  const detailParUtilisateur = new Map<string, Map<number, { complete: boolean; parfaite: boolean; pourcentage: number }>>()

  for (const semaine of semaines) {
    const matchsDeLaSemaine = matchs.filter((m) => m.semaine_id === semaine.id)
    const matchsTermines = matchsDeLaSemaine.filter((m) => m.statut === 'termine')
    const semaineComplete = matchsDeLaSemaine.length > 0 && matchsTermines.length === matchsDeLaSemaine.length

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
      if (semaineComplete) {
        if (corrects === matchsDeLaSemaine.length) {
          scoreSemaine += semaine.bonus_perfect ?? 0
        } else if (semaine.seuil_bonus_2 && corrects >= semaine.seuil_bonus_2) {
          scoreSemaine += semaine.bonus_2 ?? 0
        } else if (semaine.seuil_bonus_1 && corrects >= semaine.seuil_bonus_1) {
          scoreSemaine += semaine.bonus_1 ?? 0
        }
      }

      if (!scoresParUtilisateur.has(userId)) {
        scoresParUtilisateur.set(userId, new Map())
      }
      scoresParUtilisateur.get(userId)!.set(semaine.id, scoreSemaine)

      if (!detailParUtilisateur.has(userId)) {
        detailParUtilisateur.set(userId, new Map())
      }
      detailParUtilisateur.get(userId)!.set(semaine.id, {
        complete: semaineComplete,
        // Vraiment parfaite = semaine complète ET tous les pronostics corrects
        parfaite: semaineComplete && matchsDeLaSemaine.length > 0 && corrects === matchsDeLaSemaine.length,
        pourcentage: matchsDeLaSemaine.length > 0 ? (corrects / matchsDeLaSemaine.length) * 100 : 0,
      })
    }
  }

  // Construction du résultat final
  const resultat: ScoreJoueur[] = []
  for (const [userId, scoresSemaines] of scoresParUtilisateur) {
    const scores = [...scoresSemaines.values()]
    const scoreSaison = scores.reduce((a, b) => a + b, 0)
    const meilleureSemaine = scores.length > 0 ? Math.max(...scores) : 0

    const details = [...(detailParUtilisateur.get(userId)?.values() ?? [])]
    const semainesTermineesDetails = details.filter((d) => d.complete)

    const semainesParfaites = semainesTermineesDetails.filter((d) => d.parfaite).length
    const meilleurPourcentageSemaine = semainesTermineesDetails.length > 0
      ? Math.max(...semainesTermineesDetails.map((d) => d.pourcentage))
      : 0

    resultat.push({
      utilisateur_id: userId,
      pseudo: pseudoMap.get(userId) ?? 'Joueur inconnu',
      score_saison: scoreSaison,
      meilleure_semaine: meilleureSemaine,
      semaines_parfaites: semainesParfaites,
      meilleur_pourcentage_semaine: meilleurPourcentageSemaine,
    })
  }

  // Tri : 1) score total, 2) semaines parfaites, 3) meilleur % réalisé sur une semaine
  resultat.sort((a, b) => {
    if (b.score_saison !== a.score_saison) return b.score_saison - a.score_saison
    if (b.semaines_parfaites !== a.semaines_parfaites) return b.semaines_parfaites - a.semaines_parfaites
    return b.meilleur_pourcentage_semaine - a.meilleur_pourcentage_semaine
  })

  return resultat
}
type ScoreJoueurSemaine = {
  utilisateur_id: string
  pseudo: string
  score_semaine: number
}

export async function calculerClassementSemaine(
  supabase: SupabaseClient,
  semaine_id: number
): Promise<ScoreJoueurSemaine[]> {
  const { data: semaine } = await supabase
    .from('semaines')
    .select('*')
    .eq('id', semaine_id)
    .single()

  if (!semaine) return []

  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .eq('semaine_id', semaine_id)

  if (!matchs || matchs.length === 0) return []

  const matchIds = matchs.map((m) => m.id)
  const matchsTermines = matchs.filter((m) => m.statut === 'termine')

  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchIds)

  if (!pronostics || pronostics.length === 0) return []

  const userIds = [...new Set(pronostics.map((p) => p.utilisateur_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', userIds)

  const pseudoMap = new Map((profiles ?? []).map((p) => [p.id, p.pseudo]))
  const matchMap = new Map(matchs.map((m) => [m.id, m]))

  const resultat: ScoreJoueurSemaine[] = []

  for (const userId of userIds) {
    const mesPronos = pronostics.filter((p) => p.utilisateur_id === userId)
    const corrects = mesPronos.filter((p) => {
      const match = matchMap.get(p.match_id)
      return match && match.statut === 'termine' && p.equipe_choisie === match.equipe_gagnante
    }).length

    let score = corrects * (semaine.points_par_pronostic ?? 1)

    if (matchsTermines.length === matchs.length && matchs.length > 0) {
      if (corrects === matchs.length) {
        score += semaine.bonus_perfect ?? 0
      } else if (semaine.seuil_bonus_2 && corrects >= semaine.seuil_bonus_2) {
        score += semaine.bonus_2 ?? 0
      } else if (semaine.seuil_bonus_1 && corrects >= semaine.seuil_bonus_1) {
        score += semaine.bonus_1 ?? 0
      }
    }

    resultat.push({
      utilisateur_id: userId,
      pseudo: pseudoMap.get(userId) ?? 'Joueur inconnu',
      score_semaine: score,
    })
  }

  resultat.sort((a, b) => b.score_semaine - a.score_semaine)
  return resultat
}
export async function calculerHistoriqueSemaines(
  supabase: SupabaseClient,
  saison_id: number,
  membresIds: Set<string>
) {
  const { data: semaines } = await supabase
    .from('semaines')
    .select('id, nom, statut')
    .eq('saison_id', saison_id)
    .order('id', { ascending: true })

  if (!semaines || semaines.length === 0) {
    return { semaines: [], lignes: [] }
  }

  const semainesCloturees = semaines.filter((s) => s.statut === 'cloturee')

  const scoresParSemaine = new Map<number, Map<string, number>>()
  const pseudoMap = new Map<string, string>()

  for (const semaine of semainesCloturees) {
    const classement = await calculerClassementSemaine(supabase, semaine.id)
    const map = new Map<string, number>()
    for (const j of classement) {
      map.set(j.utilisateur_id, j.score_semaine)
      pseudoMap.set(j.utilisateur_id, j.pseudo)
    }
    scoresParSemaine.set(semaine.id, map)
  }

  const lignes = [...membresIds]
    .filter((uid) => pseudoMap.has(uid))
    .map((uid) => ({
      utilisateur_id: uid,
      pseudo: pseudoMap.get(uid) ?? 'Joueur inconnu',
      scores: semainesCloturees.map((s) => scoresParSemaine.get(s.id)?.get(uid) ?? 0),
    }))

  return { semaines: semainesCloturees, lignes }
}