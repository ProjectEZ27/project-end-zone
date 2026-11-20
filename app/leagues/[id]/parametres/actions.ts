'use server'
 
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { verifierNomLigue, MESSAGE_NOM_PRIS } from '@/lib/nomLigue'
import { creerNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
 
export async function modifierLigue(formData: FormData) {
  const supabase = await createClient()
 
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
 
  const ligue_id = formData.get('ligue_id') as string
  const delai_1 = Number(formData.get('delai_1'))
  const delai_2 = Number(formData.get('delai_2'))
  const rappel_1_actif = formData.get('rappel_1_actif') === 'on'
  const rappel_2_actif = formData.get('rappel_2_actif') === 'on'
 
  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()
 
  if (!league || league.commissaire_id !== user.id) {
    return
  }

  const { error } = await supabase
    .from('ligues')
    .update({
      config_rappels: {
        rappel_1_actif,
        rappel_2_actif,
        delais_heures: [delai_1, delai_2],
      },
    })
    .eq('id', ligue_id)

  if (error) {
    const message = "Les modifications n'ont pas pu être enregistrées, réessaie"
    console.error('[modifierLigue]', error.message)
    redirect(`/leagues/${ligue_id}/parametres?error=${encodeURIComponent(message)}`)
  }
 
  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/leagues/' + ligue_id + '/parametres')
}

/**
 * Changement de nom, depuis le bouton « Modifier la ligue » de la page de la ligue.
 * Réservé au commissaire. Les autres membres reçoivent une notification.
 */
export async function changerNomLigue(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string

  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id, nom')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Seul le commissaire peut modifier le nom')}`)
  }

  const verification = verifierNomLigue(formData.get('nom'))
  if (!verification.ok) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent(verification.message)}`)
  }
  const nom = verification.nom
  const ancienNom = league.nom as string

  // Rien à faire (et aucune notification) si le nom n'a pas changé
  if (nom === ancienNom) {
    redirect('/leagues/' + ligue_id)
  }

  const { error } = await supabase.from('ligues').update({ nom }).eq('id', ligue_id)

  if (error) {
    const message = error.code === '23505' ? MESSAGE_NOM_PRIS : "Le nom n'a pas pu être changé, réessaie"
    if (error.code !== '23505') console.error('[changerNomLigue]', error.message)
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent(message)}`)
  }

  // Prévenir les autres membres actifs
  const { data: membres } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', ligue_id)
    .eq('statut', 'actif')

  const maintenant = Date.now()
  for (const m of membres ?? []) {
    if (m.utilisateur_id === user.id) continue
    await creerNotification({
      userId: m.utilisateur_id,
      type: 'ligue',
      titre: 'Ta ligue a changé de nom',
      message: `La ligue « ${ancienNom} » s'appelle maintenant « ${nom} ».`,
      lien: `/leagues/${ligue_id}`,
      cle: `nom-ligue:${ligue_id}:${maintenant}`,
    })
  }

  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/leagues')
  revalidatePath('/')
  redirect('/leagues/' + ligue_id)
}