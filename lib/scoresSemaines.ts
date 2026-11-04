import type { SupabaseClient } from '@supabase/supabase-js'
import { estMatchNul, seuilsSemaine } from '@/lib/matchNul'

export type EtatSemaine = 'terminee' | 'en_cours' | 'a_venir'

export type LigneSemaine = {
  id: number
  nom: string
  etat: EtatSemaine
  /** Score du joueur (semaines terminées seulement) ; null s'il n'a pas pronostiqué */
  score: number | null
}

/**
 * Liste des semaines avec, pour chacune, son état et le score du joueur.
 * Même règle de calcul que le classement de la semaine (bons pronos + bonus), mais en peu de requêtes.
 */
export async function listerSemainesAvecScores(
  supabase: SupabaseClient,
  userId: string
): Promise<LigneSemaine[]> {
  const [{ data: semaines }, { data: matchs }, { data: pronostics }] = await Promise.all([
    supabase.from('semaines').select('*').order('id', { ascending: true }),
    supabase.from('matchs').select('*').range(0, 9999),
    supabase
      .from('pronostics')
      .select('match_id, equipe_choisie')
      .eq('utilisateur_id', userId)
      .range(0, 9999),
  ])

  const matchsParSemaine = new Map<number, NonNullable<typeof matchs>>()
  for (const m of matchs ?? []) {
    const liste = matchsParSemaine.get(m.semaine_id) ?? []
    liste.push(m)
    matchsParSemaine.set(m.semaine_id, liste)
  }
  const choixParMatch = new Map((pronostics ?? []).map((p) => [p.match_id, p.equipe_choisie]))

  let enCoursTrouvee = false
  return (semaines ?? []).map((s): LigneSemaine => {
    const ms = matchsParSemaine.get(s.id) ?? []
    const terminee = ms.length > 0 && ms.every((m) => m.statut === 'termine')

    if (!terminee) {
      // La première semaine non terminée qui a des matchs est la semaine en cours
      const etat: EtatSemaine = !enCoursTrouvee && ms.length > 0 ? 'en_cours' : 'a_venir'
      if (etat === 'en_cours') enCoursTrouvee = true
      return { id: s.id, nom: s.nom, etat, score: null }
    }

    const aPronostique = ms.some((m) => choixParMatch.has(m.id))
    if (!aPronostique) return { id: s.id, nom: s.nom, etat: 'terminee', score: null }

    const comptes = ms.filter((m) => !estMatchNul(m))
    const regles = seuilsSemaine(s, comptes.length, ms.length)
    const corrects = ms.filter((m) => choixParMatch.get(m.id) === m.equipe_gagnante).length
    let score = corrects * (s.points_par_pronostic ?? 1)
    if (comptes.length > 0 && corrects === comptes.length) {
      score += regles.bonus_perfect ?? 0
    } else if (regles.seuil_bonus_2 && corrects >= regles.seuil_bonus_2) {
      score += regles.bonus_2 ?? 0
    } else if (regles.seuil_bonus_1 && corrects >= regles.seuil_bonus_1) {
      score += regles.bonus_1 ?? 0
    }
    return { id: s.id, nom: s.nom, etat: 'terminee', score }
  })
}