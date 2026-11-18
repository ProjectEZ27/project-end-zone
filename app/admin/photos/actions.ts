'use server'

import { createClient } from '@/lib/supabase/server'
import { ADMIN_ID } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { creerNotification, marquerNotificationLue } from '@/lib/notifications'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function stockage() {
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!).storage
}

/**
 * Photo validée : on la copie du dossier privé « photos-attente » vers le dossier public « photos ».
 * Renvoie false si la copie a échoué (la photo reste alors en attente).
 * Les anciennes photos, envoyées avant ce changement, sont déjà dans le dossier public : rien à copier.
 */
async function publierPhoto(chemin: string): Promise<boolean> {
  const s = stockage()
  const { data: fichier, error: erreurLecture } = await s.from('photos-attente').download(chemin)
  if (erreurLecture || !fichier) {
    const { data: dejaPublique } = await s.from('photos').list(chemin.split('/').slice(0, -1).join('/'), {
      search: chemin.split('/').pop(),
    })
    return (dejaPublique ?? []).length > 0
  }
  const { error: erreurDepot } = await s.from('photos').upload(chemin, fichier, { contentType: 'image/jpeg', upsert: true })
  if (erreurDepot) {
    console.error('[photos] publication échouée :', erreurDepot.message)
    return false
  }
  await s.from('photos-attente').remove([chemin])
  return true
}

async function changerStatut(id: number, statut: 'validee' | 'refusee') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_ID) return
  const { data: photo } = await supabase
    .from('photos_perso')
    .select('type, cible, chemin')
    .eq('id', id)
    .maybeSingle()
  if (!photo) return

  if (statut === 'validee') {
    // La photo doit être dans le dossier public AVANT d'être affichée
    const publiee = await publierPhoto(photo.chemin)
    if (!publiee) return
  } else {
    // Photo refusée : elle est supprimée, plus personne ne peut la voir
    await stockage().from('photos-attente').remove([photo.chemin])
    await stockage().from('photos').remove([photo.chemin])
  }

  const { error } = await supabase.from('photos_perso').update({ statut }).eq('id', id)

  if (!error) {
    await marquerNotificationLue(ADMIN_ID, `photo-a-valider:${photo.chemin}`)

    // Qui prévenir : le joueur (photo de profil) ou le commissaire (photo de ligue)
    let destinataire: string | null = null
    let sujet = 'Ta photo de profil'
    let lien = '/profile'
    if (photo.type === 'profil') {
      destinataire = String(photo.cible)
    } else {
      const { data: ligue } = await supabase
        .from('ligues')
        .select('nom, commissaire_id')
        .eq('id', photo.cible)
        .maybeSingle()
      destinataire = ligue?.commissaire_id ?? null
      sujet = `La photo de ta ligue${ligue?.nom ? ` ${ligue.nom}` : ''}`
      lien = `/leagues/${photo.cible}`
    }

    if (destinataire) {
      await creerNotification({
        userId: destinataire,
        type: 'photo',
        titre: statut === 'validee' ? 'Photo validée' : 'Photo refusée',
        message:
          statut === 'validee'
            ? `${sujet} est approuvée et visible par tous.`
            : `${sujet} n'a pas été acceptée. Tu peux en envoyer une autre.`,
        lien,
        cle: `photo-resultat:${photo.chemin}`,
      })
    }
  }

  revalidatePath('/admin/photos')
  revalidatePath('/')
}

export async function validerPhoto(id: number) {
  await changerStatut(id, 'validee')
}

export async function refuserPhoto(id: number) {
  await changerStatut(id, 'refusee')
}