import { SupabaseClient } from '@supabase/supabase-js'
import { estMatchNul, seuilsSemaine } from '@/lib/matchNul'

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
  saison_id: number,
  options?: { avantSemaineId?: number }
): Promise<ScoreJoueur[]> {
  // 1. Toutes les semaines de cette saison (régulière ET playoffs, aucune distinction)
  const { data: toutesSemaines } = await supabase
    .from('semaines')
    .select('*')
    .eq('saison_id', saison_id)

  if (!toutesSemaines || toutesSemaines.length === 0) return []

  // Option : ne garder que les semaines AVANT une semaine donnée (pour comparer les classements)
  const avantId = options?.avantSemaineId
  const semaines = avantId != null
    ? toutesSemaines.filter((s) => s.id < avantId)
    : toutesSemaines

  if (semaines.length === 0) return []

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
    .range(0, 9999)

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

    // Les matchs nuls ne comptent pas : la semaine a un match de moins
    const matchsComptes = matchsDeLaSemaine.filter((m) => !estMatchNul(m))
    const regles = seuilsSemaine(semaine, matchsComptes.length, matchsDeLaSemaine.length)

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
        if (matchsComptes.length > 0 && corrects === matchsComptes.length) {
          scoreSemaine += regles.bonus_perfect ?? 0
        } else if (regles.seuil_bonus_2 && corrects >= regles.seuil_bonus_2) {
          scoreSemaine += regles.bonus_2 ?? 0
        } else if (regles.seuil_bonus_1 && corrects >= regles.seuil_bonus_1) {
          scoreSemaine += regles.bonus_1 ?? 0
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
        // Vraiment parfaite = semaine complète ET tous les pronostics corrects (hors matchs nuls)
        parfaite: semaineComplete && matchsComptes.length > 0 && corrects === matchsComptes.length,
        pourcentage: matchsComptes.length > 0 ? (corrects / matchsComptes.length) * 100 : 0,
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

  // Les matchs nuls ne comptent pas : la semaine a un match de moins
  const matchsComptes = matchs.filter((m) => !estMatchNul(m))
  const regles = seuilsSemaine(semaine, matchsComptes.length, matchs.length)

  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchIds)
    .range(0, 9999)

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
      if (matchsComptes.length > 0 && corrects === matchsComptes.length) {
        score += regles.bonus_perfect ?? 0
      } else if (regles.seuil_bonus_2 && corrects >= regles.seuil_bonus_2) {
        score += regles.bonus_2 ?? 0
      } else if (regles.seuil_bonus_1 && corrects >= regles.seuil_bonus_1) {
        score += regles.bonus_1 ?? 0
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
  // 1. Les semaines de la saison, dans l'ordre
  const { data: semaines } = await supabase
    .from('semaines')
    .select('*')
    .eq('saison_id', saison_id)
    .order('id', { ascending: true })

  if (!semaines || semaines.length === 0) {
    return { semaines: [], lignes: [] }
  }

  // 2. Tous leurs matchs, en une seule lecture
  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .in('semaine_id', semaines.map((s) => s.id))
    .range(0, 4999)

  // Une semaine apparaît dans l'historique dès que tous ses matchs sont terminés
  // (le statut des semaines reste « ouverte » toute la saison, on ne peut donc pas s'y fier)
  const semainesTerminees = semaines.filter((s) => {
    const siens = (matchs ?? []).filter((m) => m.semaine_id === s.id)
    return siens.length > 0 && siens.every((m) => m.statut === 'termine')
  })
  if (semainesTerminees.length === 0) {
    return { semaines: [], lignes: [] }
  }

  const idsTerminees = new Set(semainesTerminees.map((s) => s.id))
  const matchsTermines = (matchs ?? []).filter((m) => idsTerminees.has(m.semaine_id))
  const matchMap = new Map(matchsTermines.map((m) => [m.id, m]))

  // 3. Les pronostics des membres sur ces matchs, en une seule lecture
  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchsTermines.map((m) => m.id))
    .in('utilisateur_id', [...membresIds])
    .range(0, 9999)

  // 4. Les pseudos
  const userIds = [...new Set((pronostics ?? []).map((p) => p.utilisateur_id))]
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, pseudo').in('id', userIds)
    : { data: [] as { id: string; pseudo: string }[] }
  const pseudoMap = new Map((profiles ?? []).map((p) => [p.id, p.pseudo]))

  // Score de chaque joueur pour chaque semaine (mêmes règles que calculerClassementSemaine)
  const scoresParSemaine = new Map<number, Map<string, number>>()
  for (const semaine of semainesTerminees) {
    const matchsDeLaSemaine = matchsTermines.filter((m) => m.semaine_id === semaine.id)
    const matchsComptes = matchsDeLaSemaine.filter((m) => !estMatchNul(m))
    const regles = seuilsSemaine(semaine, matchsComptes.length, matchsDeLaSemaine.length)
    const idsMatchs = new Set(matchsDeLaSemaine.map((m) => m.id))
    const pronosSemaine = (pronostics ?? []).filter((p) => idsMatchs.has(p.match_id))

    const map = new Map<string, number>()
    for (const userId of new Set(pronosSemaine.map((p) => p.utilisateur_id))) {
      const corrects = pronosSemaine.filter((p) => {
        if (p.utilisateur_id !== userId) return false
        const match = matchMap.get(p.match_id)
        return match && match.statut === 'termine' && p.equipe_choisie === match.equipe_gagnante
      }).length

      let score = corrects * (semaine.points_par_pronostic ?? 1)
      if (matchsComptes.length > 0 && corrects === matchsComptes.length) {
        score += regles.bonus_perfect ?? 0
      } else if (regles.seuil_bonus_2 && corrects >= regles.seuil_bonus_2) {
        score += regles.bonus_2 ?? 0
      } else if (regles.seuil_bonus_1 && corrects >= regles.seuil_bonus_1) {
        score += regles.bonus_1 ?? 0
      }
      map.set(userId, score)
    }
    scoresParSemaine.set(semaine.id, map)
  }

  const lignes = [...membresIds]
    .filter((uid) => [...scoresParSemaine.values()].some((m) => m.has(uid)))
    .map((uid) => ({
      utilisateur_id: uid,
      pseudo: pseudoMap.get(uid) ?? 'Joueur inconnu',
      scores: semainesTerminees.map((s) => scoresParSemaine.get(s.id)?.get(uid) ?? 0),
    }))
    // Du plus grand total au plus petit
    .sort((a, b) => b.scores.reduce((x, y) => x + y, 0) - a.scores.reduce((x, y) => x + y, 0))

  return {
    semaines: semainesTerminees.map((s) => ({ id: s.id, nom: s.nom, statut: s.statut })),
    lignes,
  }
}