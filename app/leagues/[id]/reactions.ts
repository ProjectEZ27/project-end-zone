'use server'

import { createClient } from '@/lib/supabase/server'
import { REACTIONS } from '@/lib/reactionsJournal'

/*
 * Réagir à un article du journal du mardi.
 * Une seule réaction par joueur et par article : retoucher la même l'enlève, une autre la remplace.
 */
export async function reagirArticle(
  ligueId: number,
  semaineId: number,
  articleId: string,
  emoji: string,
): Promise<{ ok: boolean }> {
  if (!(REACTIONS as readonly string[]).includes(emoji) || !articleId) return { ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  // Il faut être membre actif de la ligue (ou son commissaire)
  const [{ data: adhesion }, { data: ligue }] = await Promise.all([
    supabase.from('adhesions').select('id').eq('ligue_id', ligueId).eq('utilisateur_id', user.id).eq('statut', 'actif').maybeSingle(),
    supabase.from('ligues').select('commissaire_id').eq('id', ligueId).maybeSingle(),
  ])
  if (!adhesion && ligue?.commissaire_id !== user.id) return { ok: false }

  const { data: existante } = await supabase
    .from('journal_reactions')
    .select('id, emoji')
    .eq('ligue_id', ligueId)
    .eq('semaine_id', semaineId)
    .eq('article_id', articleId)
    .eq('utilisateur_id', user.id)
    .maybeSingle()

  if (existante && existante.emoji === emoji) {
    const { error } = await supabase.from('journal_reactions').delete().eq('id', existante.id)
    return { ok: !error }
  }
  if (existante) {
    const { error } = await supabase.from('journal_reactions').update({ emoji }).eq('id', existante.id)
    return { ok: !error }
  }
  const { error } = await supabase.from('journal_reactions').insert({
    ligue_id: ligueId,
    semaine_id: semaineId,
    article_id: articleId,
    utilisateur_id: user.id,
    emoji,
  })
  return { ok: !error }
}