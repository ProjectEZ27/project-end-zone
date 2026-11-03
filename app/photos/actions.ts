'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ADMIN_ID } from '@/lib/admin'
import { creerNotification } from '@/lib/notifications'

export async function envoyerPhoto(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Tu dois être connecté.' }

  const type = String(formData.get('type'))
  const cible = String(formData.get('cible'))
  const fichier = formData.get('fichier')

  if (type !== 'profil' && type !== 'ligue') return { ok: false, message: 'Demande invalide.' }
  if (type === 'profil' && cible !== user.id) return { ok: false, message: 'Demande invalide.' }
  if (!(fichier instanceof File) || fichier.size === 0 || fichier.size > 500_000) {
    return { ok: false, message: 'Image invalide ou trop lourde.' }
  }

  const dossier = type === 'profil' ? `profils/${user.id}` : `ligues/${cible}`
  const chemin = `${dossier}/${Date.now()}.jpg`

  const { error: erreurEnvoi } = await supabase.storage
    .from('photos')
    .upload(chemin, fichier, { contentType: 'image/jpeg' })
  if (erreurEnvoi) return { ok: false, message: "L'envoi a échoué, réessaie." }

  const { error: erreurBase } = await supabase.from('photos_perso').insert({ type, cible, chemin })
  if (erreurBase) return { ok: false, message: "L'envoi a échoué, réessaie." }

  if (user.id !== ADMIN_ID) {
    let message = 'Une nouvelle photo est en attente de validation.'
    if (type === 'profil') {
      const { data: profil } = await supabase.from('profiles').select('pseudo').eq('id', user.id).maybeSingle()
      if (profil?.pseudo) message = `Photo de profil de ${profil.pseudo}.`
    } else {
      const { data: ligue } = await supabase.from('ligues').select('nom').eq('id', cible).maybeSingle()
      if (ligue?.nom) message = `Photo de la ligue ${ligue.nom}.`
    }
    await creerNotification({
      userId: ADMIN_ID,
      type: 'photo',
      titre: 'Photo à valider',
      message,
      lien: '/admin/photos',
      cle: `photo-a-valider:${chemin}`,
    })
  }

  revalidatePath('/profile')
  return { ok: true, message: 'Photo envoyée, elle sera visible après validation.' }
}

export async function retirerPhotoProfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ photo_chemin: null }).eq('id', user.id)
  revalidatePath('/profile')
}