import { SupabaseClient } from '@supabase/supabase-js'

export type SemaineReference = { id: number; nom: string; terminee: boolean }

// Dernière semaine dont le premier match a commencé (c'est elle qui sert de départ aux flèches)
export async function trouverSemaineReference(
  supabase: SupabaseClient,
  saisonId: number
): Promise<SemaineReference | null> {
  const { data: semaines } = await supabase
    .from('semaines')
    .select('id, nom')
    .eq('saison_id', saisonId)

  if (!semaines || semaines.length === 0) return null

  const ids = semaines.map((s) => s.id)
  const { data: dernier } = await supabase
    .from('matchs')
    .select('semaine_id')
    .in('semaine_id', ids)
    .lte('coup_envoi', new Date().toISOString())
    .order('coup_envoi', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!dernier) return null

  const semaine = semaines.find((s) => s.id === dernier.semaine_id)
  if (!semaine) return null

  const { data: matchs } = await supabase
    .from('matchs')
    .select('statut')
    .eq('semaine_id', semaine.id)

  const liste = matchs ?? []
  const terminee = liste.length > 0 && liste.every((m) => m.statut === 'termine')

  return { id: semaine.id, nom: semaine.nom, terminee }
}

// Places gagnées (positif) ou perdues (négatif) entre le classement "avant" et le classement "actuel"
export function calculerDeltas(actuel: string[], avant: string[]): Map<string, number> {
  const actuelSet = new Set(actuel)
  const avantFiltre = avant.filter((id) => actuelSet.has(id))
  const avantSet = new Set(avantFiltre)
  // Les joueurs absents "avant" (nouveaux) sont placés en fin de liste, sans flèche
  const avantComplet = [...avantFiltre, ...actuel.filter((id) => !avantSet.has(id))]
  const rangAvant = new Map(avantComplet.map((id, i) => [id, i + 1]))

  const deltas = new Map<string, number>()
  actuel.forEach((id, i) => {
    if (!avantSet.has(id)) return
    const rang = rangAvant.get(id)
    if (rang == null) return
    const delta = rang - (i + 1)
    if (delta !== 0) deltas.set(id, delta)
  })
  return deltas
}