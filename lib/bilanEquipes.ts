import { SupabaseClient } from '@supabase/supabase-js'

export interface BilanEquipe {
  victoires: number
  defaites: number
}

export async function calculerBilanEquipes(
  supabase: SupabaseClient,
  saison_id: number
): Promise<Record<string, BilanEquipe>> {
  const { data: semaines } = await supabase
    .from('semaines')
    .select('id')
    .eq('saison_id', saison_id)

  const semaineIds = (semaines ?? []).map((s) => s.id)
  if (semaineIds.length === 0) return {}

  const { data: matchs } = await supabase
    .from('matchs')
    .select('equipe_a, equipe_b, equipe_gagnante, statut')
    .in('semaine_id', semaineIds)
    .eq('statut', 'termine')

  const bilan: Record<string, BilanEquipe> = {}

  const ajouter = (code: string, victoire: boolean) => {
    if (!bilan[code]) bilan[code] = { victoires: 0, defaites: 0 }
    if (victoire) bilan[code].victoires++
    else bilan[code].defaites++
  }

  for (const m of matchs ?? []) {
    if (!m.equipe_gagnante) continue // égalité, non comptabilisée pour l'instant
    const perdant = m.equipe_gagnante === m.equipe_a ? m.equipe_b : m.equipe_a
    ajouter(m.equipe_gagnante, true)
    ajouter(perdant, false)
  }

  return bilan
}