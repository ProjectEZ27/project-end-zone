import { createClient } from '@supabase/supabase-js'
import { tribunalActuel } from '@/lib/accueil'
import { creerNotification } from '@/lib/notifications'

/**
 * Appelé par la tâche automatique des résultats : dès que le Tribunal est ouvert (1 h après la fin du
 * dernier match de la semaine), envoie la notification à tous les joueurs qui ne l'ont pas désactivée.
 * Une seule notification par joueur et par semaine (clé « tribunal-<semaine> »).
 */
export async function notifierTribunalATous(): Promise<number> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const t = await tribunalActuel(supabase)
  if (!t || !t.enVedette) return 0

  let joueurs: { id: string; notif_journal_actif?: boolean | null }[] = []
  const avecOption = await supabase.from('profiles').select('id, notif_journal_actif')
  if (!avecOption.error) {
    joueurs = avecOption.data ?? []
  } else {
    // La colonne de l'option n'existe pas encore : tout le monde est considéré comme inscrit
    const { data } = await supabase.from('profiles').select('id')
    joueurs = data ?? []
  }

  const cibles = joueurs.filter((j) => j.notif_journal_actif !== false)
  for (const j of cibles) {
    await creerNotification({
      userId: j.id,
      type: 'journal',
      titre: `⚖️ Le ${t.nom} est ouvert`,
      message: 'Viens voir qui a été jugé dans ta ligue.',
      lien: '/leagues',
      cle: `tribunal-${t.semaineId}`,
    })
  }
  return cibles.length
}