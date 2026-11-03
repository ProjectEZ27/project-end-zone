import { SupabaseClient } from '@supabase/supabase-js'
import { calculerClassementSaison, calculerClassementSemaine } from '@/lib/scoring'
import { trouverSemaineReference, calculerDeltas } from '@/lib/mouvements'

// Le récap s'arrête ce nombre d'heures avant le premier match de la semaine suivante
const HEURES_AVANT_SEMAINE_SUIVANTE = 24

export type RecapSemaine = {
  semaineId: number
  semaineNom: string
  semaineSuivante: { id: number; nom: string } | null
  // null = le joueur n'a pas pronostiqué cette semaine
  score: number | null
  rang: number
  nombreJoueurs: number
  // Places gagnées (positif) ou perdues (négatif) au classement général, null si pas de comparaison possible
  delta: number | null
}

/**
 * Renvoie le récap à afficher au joueur, ou null s'il n'y a rien à lui montrer :
 * - la dernière semaine n'est pas terminée,
 * - on est à moins de 24 h du premier match de la semaine suivante,
 * - le joueur a déjà lu ce récap,
 * - le joueur n'a encore aucun pronostic dans la saison.
 */
export async function trouverRecapAAfficher(
  supabase: SupabaseClient,
  userId: string,
  saisonId: number,
  idsLusParCookie: number[] = []
): Promise<RecapSemaine | null> {
  const ref = await trouverSemaineReference(supabase, saisonId)
  if (!ref || !ref.terminee) return null
  if (idsLusParCookie.includes(ref.id)) return null

  const { data: semaines } = await supabase
    .from('semaines')
    .select('id, nom')
    .eq('saison_id', saisonId)
    .order('id', { ascending: true })

  const liste = semaines ?? []
  const index = liste.findIndex((s) => s.id === ref.id)
  const suivante = index !== -1 && index < liste.length - 1 ? liste[index + 1] : null

  // Fin du récap : 24 h avant le premier match de la semaine suivante (si ses matchs sont déjà connus)
  if (suivante) {
    const { data: premierMatch } = await supabase
      .from('matchs')
      .select('coup_envoi')
      .eq('semaine_id', suivante.id)
      .order('coup_envoi', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (premierMatch) {
      const limite = new Date(premierMatch.coup_envoi).getTime() - HEURES_AVANT_SEMAINE_SUIVANTE * 3600 * 1000
      if (Date.now() >= limite) return null
    }
  }

  // Déjà lu ?
  const { data: dejaLu } = await supabase
    .from('recaps_lus')
    .select('semaine_id')
    .eq('utilisateur_id', userId)
    .eq('semaine_id', ref.id)
    .maybeSingle()
  if (dejaLu) return null

  const [classementSemaine, classementActuel, classementAvant] = await Promise.all([
    calculerClassementSemaine(supabase, ref.id),
    calculerClassementSaison(supabase, saisonId),
    calculerClassementSaison(supabase, saisonId, { avantSemaineId: ref.id }),
  ])

  const position = classementActuel.findIndex((j) => j.utilisateur_id === userId)
  // Joueur sans aucun pronostic dans la saison : pas de récap
  if (position === -1) return null

  const monScoreSemaine = classementSemaine.find((j) => j.utilisateur_id === userId)
  const etaitDansLeClassement = classementAvant.some((j) => j.utilisateur_id === userId)

  let delta: number | null = null
  if (etaitDansLeClassement) {
    const deltas = calculerDeltas(
      classementActuel.map((j) => j.utilisateur_id),
      classementAvant.map((j) => j.utilisateur_id)
    )
    delta = deltas.get(userId) ?? 0
  }

  return {
    semaineId: ref.id,
    semaineNom: ref.nom,
    semaineSuivante: suivante ? { id: suivante.id, nom: suivante.nom } : null,
    score: monScoreSemaine ? monScoreSemaine.score_semaine : null,
    rang: position + 1,
    nombreJoueurs: classementActuel.length,
    delta,
  }
}