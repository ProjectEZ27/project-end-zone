import { createClient } from '@supabase/supabase-js'
import { tribunalActuel } from '@/lib/accueil'
import { envoyerPushGroupe } from '@/lib/push'

/**
 * Appelé par la tâche automatique des résultats : dès que le Tribunal est ouvert (1 h après la fin du
 * dernier match de la semaine), envoie la notification aux joueurs qui ne l'ont pas désactivée
 * ET qui sont dans au moins une ligue (sans ligue, il n'y a personne à juger).
 * Une seule notification par joueur et par semaine (clé « tribunal-<semaine> »).
 */
export async function notifierTribunalATous(): Promise<number> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const t = await tribunalActuel(supabase)
  if (!t || !t.enVedette) return 0

  // Lecture de tous les joueurs, par pages de 1 000 (la base ne renvoie jamais plus de 1 000 lignes à la fois)
  const joueurs: { id: string; notif_journal_actif?: boolean | null }[] = []
  for (let debut = 0; ; debut += 1000) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, notif_journal_actif')
      .order('id', { ascending: true })
      .range(debut, debut + 999)
    if (error) {
      console.error('[tribunal] lecture des joueurs échouée :', error.message)
      return 0
    }
    joueurs.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }

  // Joueurs qui sont dans au moins une ligue (adhésion active)
  const dansUneLigue = new Set<string>()
  for (let debut = 0; ; debut += 1000) {
    const { data, error } = await supabase
      .from('adhesions')
      .select('utilisateur_id')
      .eq('statut', 'actif')
      .order('utilisateur_id', { ascending: true })
      .order('ligue_id', { ascending: true })
      .range(debut, debut + 999)
    if (error) {
      console.error('[tribunal] lecture des adhésions échouée :', error.message)
      return 0
    }
    for (const a of data ?? []) dansUneLigue.add(String(a.utilisateur_id))
    if (!data || data.length < 1000) break
  }

  const cibles = joueurs.filter((j) => j.notif_journal_actif !== false && dansUneLigue.has(String(j.id)))
  if (cibles.length === 0) return 0

  // Envoi groupé : une seule lecture des notifications déjà créées, puis des envois par paquets de 500.
  // (Avant : deux demandes à la base par joueur, trop lent avec beaucoup de joueurs.)
  const cle = `tribunal-${t.semaineId}`
  const dejaPrevenus = new Set<string>()
  for (let debut = 0; ; debut += 1000) {
    const { data, error } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('cle', cle)
      .order('user_id', { ascending: true })
      .range(debut, debut + 999)
    if (error) {
      console.error('[tribunal] lecture des notifications échouée :', error.message)
      return 0
    }
    for (const n of data ?? []) dejaPrevenus.add(String(n.user_id))
    if (!data || data.length < 1000) break
  }

  const aCreer = cibles
    .filter((j) => !dejaPrevenus.has(String(j.id)))
    .map((j) => ({
      user_id: j.id,
      type: 'journal',
      titre: `⚖️ Le ${t.nom} est ouvert`,
      message: 'Viens voir qui a été jugé dans ta ligue.',
      lien: '/leagues',
      cle,
    }))

  for (let i = 0; i < aCreer.length; i += 500) {
    const { error } = await supabase.from('notifications').insert(aCreer.slice(i, i + 500))
    if (error) {
      console.error('[tribunal] création des notifications échouée :', error.message)
    } else {
      // La même notification part aussi sur les téléphones (appli iPhone / Android)
      await envoyerPushGroupe(
        aCreer.slice(i, i + 500).map((n) => ({ userId: String(n.user_id), titre: n.titre, message: n.message, lien: n.lien }))
      )
    }
  }
  return aCreer.length
}