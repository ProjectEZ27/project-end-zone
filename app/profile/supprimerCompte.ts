'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { creerNotification } from '@/lib/notifications'

/**
 * Supprime définitivement le compte du joueur connecté et toutes ses données.
 * 1. Ses ligues : le membre actif le plus ancien devient commissaire (et est prévenu) ;
 *    une ligue où il était seul est supprimée.
 * 2. Ses pronostics, pronostics spéciaux, adhésions, réactions, notifications, photos et suivis de rappels.
 * 3. Son profil, puis son compte de connexion.
 * Renvoie un message d'erreur si quelque chose bloque (rien n'est alors à moitié supprimé côté compte).
 */
export async function supprimerMonCompte(formData: FormData): Promise<{ ok: false; message: string } | void> {
  if (String(formData.get('confirmation') ?? '').trim() !== 'SUPPRIMER') {
    return { ok: false, message: 'Écris SUPPRIMER en majuscules pour confirmer' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const uid = user.id

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const echec = (etape: string, message?: string) => {
    console.error(`[supprimerMonCompte] ${etape} :`, message)
    return { ok: false as const, message: "La suppression n'a pas pu se faire. Réessaie, ou écris-nous à projectendzone27@gmail.com." }
  }

  // 1. Les ligues dont il est commissaire
  const { data: sesLigues, error: errLigues } = await admin.from('ligues').select('id, nom').eq('commissaire_id', uid)
  if (errLigues) return echec('lecture des ligues', errLigues.message)

  for (const ligue of sesLigues ?? []) {
    const { data: membres } = await admin
      .from('adhesions')
      .select('utilisateur_id, date_entree, created_at')
      .eq('ligue_id', ligue.id)
      .eq('statut', 'actif')
      .neq('utilisateur_id', uid)
      .order('date_entree', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(1)

    const successeur = membres?.[0]?.utilisateur_id
    if (successeur) {
      const { error } = await admin.from('ligues').update({ commissaire_id: successeur }).eq('id', ligue.id)
      if (error) return echec('passage de commissaire', error.message)
      await creerNotification({
        userId: successeur,
        type: 'ligue',
        titre: 'Tu es commissaire',
        message: `Le commissaire de la ligue ${ligue.nom} a quitté Project End Zone : tu prends sa place.`,
        lien: `/leagues/${ligue.id}`,
        cle: `nouveau-commissaire:${ligue.id}:${successeur}`,
      })
    } else {
      // Ligue où il était seul : supprimée avec sa photo éventuelle
      await admin.from('adhesions').delete().eq('ligue_id', ligue.id)
      const { error } = await admin.from('ligues').delete().eq('id', ligue.id)
      if (error) return echec('suppression de ligue', error.message)
      await supprimerDossier(admin.storage, 'photos', `ligues/${ligue.id}`)
      await supprimerDossier(admin.storage, 'photos-attente', `ligues/${ligue.id}`)
    }
  }

  // 2. Ses données de jeu et de suivi
  const suppressions: [string, string][] = [
    ['pronostics', 'utilisateur_id'],
    ['pronostics_speciaux', 'utilisateur_id'],
    ['adhesions', 'utilisateur_id'],
    ['journal_reactions', 'utilisateur_id'],
    ['recaps_lus', 'utilisateur_id'],
    ['rappels_perso_envoyes', 'utilisateur_id'],
    ['notifications', 'user_id'],
    ['photos_perso', 'user_id'],
  ]
  for (const [table, colonne] of suppressions) {
    const { error } = await admin.from(table).delete().eq(colonne, uid)
    if (error) return echec(`suppression dans ${table}`, error.message)
  }
  await supprimerDossier(admin.storage, 'photos', `profils/${uid}`)
  await supprimerDossier(admin.storage, 'photos-attente', `profils/${uid}`)

  // 3. Le profil, puis le compte de connexion
  const { error: errProfil } = await admin.from('profiles').delete().eq('id', uid)
  if (errProfil) return echec('suppression du profil', errProfil.message)
  const { error: errCompte } = await admin.auth.admin.deleteUser(uid)
  if (errCompte) return echec('suppression du compte', errCompte.message)

  await supabase.auth.signOut({ scope: 'local' })
  redirect('/compte-supprime')
}

/** Supprime tous les fichiers d'un dossier de photos (sans erreur si le dossier est vide). */
async function supprimerDossier(stockage: ReturnType<typeof createAdminClient>['storage'], bucket: string, dossier: string) {
  try {
    const { data } = await stockage.from(bucket).list(dossier, { limit: 1000 })
    const chemins = (data ?? []).filter((f) => f.name).map((f) => `${dossier}/${f.name}`)
    if (chemins.length > 0) await stockage.from(bucket).remove(chemins)
  } catch (e) {
    console.error('[supprimerMonCompte] photos :', e)
  }
}