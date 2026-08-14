'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  const nouveauPseudo = (formData.get('pseudo') as string)?.trim()

  if (!nouveauPseudo || nouveauPseudo.length < 2) {
    redirect('/profile?error=' + encodeURIComponent('Le pseudo doit faire au moins 2 caractères'))
  }

  const { error } = await supabase
    .from('profiles')
    .update({ pseudo: nouveauPseudo })
    .eq('id', user.id)

  if (error) {
    const message = error.code === '23505'
      ? 'Ce pseudo est déjà pris par un autre joueur'
      : error.message
    redirect('/profile?error=' + encodeURIComponent(message))
  }

  revalidatePath('/profile')
  revalidatePath('/')
  revalidatePath('/classement')
}