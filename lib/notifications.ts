import { createClient } from '@supabase/supabase-js'

export type TypeNotification = 'rappel' | 'badge' | 'ligue' | 'photo' | 'site' | 'journal'

function clientService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Crée une notification pour un joueur. Si une `cle` est donnée et qu'une notification
 * avec la même clé existe déjà pour ce joueur, rien n'est créé (évite les doublons).
 * Ne lève jamais d'erreur : une notification ratée ne doit pas bloquer l'action en cours.
 */
export async function creerNotification(n: {
  userId: string
  type: TypeNotification
  titre: string
  message?: string
  lien?: string
  cle?: string
}) {
  try {
    const supabase = clientService()
    if (n.cle) {
      const { data: existe } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', n.userId)
        .eq('cle', n.cle)
        .maybeSingle()
      if (existe) return
    }
    const { error } = await supabase.from('notifications').insert({
      user_id: n.userId,
      type: n.type,
      titre: n.titre,
      message: n.message ?? null,
      lien: n.lien ?? null,
      cle: n.cle ?? null,
    })
    if (error) console.error('[notifications] création échouée :', error.message)
  } catch (e) {
    console.error('[notifications] erreur inattendue :', e)
  }
}

/** Marque comme lue(s) la ou les notifications d'un joueur portant cette clé. */
export async function marquerNotificationLue(userId: string, cle: string) {
  try {
    const { error } = await clientService().from('notifications').update({ lu: true }).eq('user_id', userId).eq('cle', cle)
    if (error) console.error('[notifications] marquage lu échoué :', error.message)
  } catch (e) {
    console.error('[notifications] erreur inattendue :', e)
  }
}