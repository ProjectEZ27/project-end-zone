'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifierPseudo } from '@/lib/pseudo'

export async function toggleRappelPerso(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const actif = formData.get('rappel_perso_actif') === 'on'

  await supabase
    .from('profiles')
    .update({ rappel_perso_actif: actif })
    .eq('id', user.id)

  revalidatePath('/profile')
}

export async function changerPseudo(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const verification = verifierPseudo(formData.get('pseudo'))
  if (!verification.ok) {
    redirect('/profile?error=' + encodeURIComponent(verification.message))
  }
  const nouveauPseudo = verification.pseudo

  const { error } = await supabase
    .from('profiles')
    .update({ pseudo: nouveauPseudo })
    .eq('id', user.id)

  if (error) {
    const message = error.code === '23505'
      ? 'Ce pseudo est déjà pris par un autre joueur'
      : "Le pseudo n'a pas pu être changé, réessaie"
    if (error.code !== '23505') console.error('[changerPseudo]', error.message)
    redirect('/profile?error=' + encodeURIComponent(message))
  }

  revalidatePath('/')
  revalidatePath('/classement')
  redirect('/profile')
}

export async function changerAvatar(formData: FormData) {
  const avatar_id = parseInt(formData.get('avatar_id') as string) || 1

  if (avatar_id < 1 || avatar_id > 16) {
    redirect('/profile?error=Avatar invalide')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_id })
    .eq('id', user.id)

  if (error) {
    console.error('[changerAvatar]', error.message)
    redirect('/profile?error=' + encodeURIComponent("L'avatar n'a pas pu être changé, réessaie"))
  }

  redirect('/profile')
}
export async function changerEquipeFavorite(formData: FormData) {
  const nouvelleEquipe = (formData.get('equipe_favorite') as string)?.trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!nouvelleEquipe) {
    redirect('/profile?error=' + encodeURIComponent('Équipe invalide'))
  }

  const { error } = await supabase
    .from('profiles')
    .update({ equipe_favorite: nouvelleEquipe })
    .eq('id', user.id)

  if (error) {
    console.error('[changerEquipeFavorite]', error.message)
    redirect('/profile?error=' + encodeURIComponent("L'équipe n'a pas pu être changée, réessaie"))
  }

  revalidatePath('/profile')
  revalidatePath('/')
}

export async function enregistrerRappels(
  r1Actif: boolean,
  r1Heures: number,
  r2Actif: boolean,
  r2Heures: number
): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Tu dois être connecté.' }

  const autorisees = [36, 24, 12, 6, 3, 1]
  if (!autorisees.includes(r1Heures) || !autorisees.includes(r2Heures)) {
    return { ok: false, message: 'Heure invalide.' }
  }
  if (r1Heures === r2Heures) {
    return { ok: false, message: 'Choisis deux heures différentes.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      rappel_1_actif: !!r1Actif,
      rappel_1_heures: r1Heures,
      rappel_2_actif: !!r2Actif,
      rappel_2_heures: r2Heures,
    })
    .eq('id', user.id)

  if (error) return { ok: false, message: "L'enregistrement a échoué, réessaie." }

  revalidatePath('/profile')
  return { ok: true }
}