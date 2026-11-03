'use server'

import { createClient } from '@/lib/supabase/server'
import { ADMIN_ID } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { creerNotification, marquerNotificationLue } from '@/lib/notifications'

async function changerStatut(id: number, statut: 'validee' | 'refusee') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_ID) return
  const { data: photo } = await supabase
    .from('photos_perso')
    .select('type, cible, chemin')
    .eq('id', id)
    .maybeSingle()
  const { error } = await supabase.from('photos_perso').update({ statut }).eq('id', id)

  if (!error && photo) {
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