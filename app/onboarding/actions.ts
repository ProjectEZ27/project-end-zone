'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cheminSur } from '@/lib/cheminSur'
import { verifierPseudo } from '@/lib/pseudo'

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const pseudoBrut = formData.get('pseudo')
  const equipe_favorite = formData.get('equipe_favorite') as string
  const avatar_id = parseInt(formData.get('avatar_id') as string) || 1
  // Sécurité : on n'accepte qu'une page du site comme destination
  const nextBrut = formData.get('next') as string | null
  const next = nextBrut ? cheminSur(nextBrut, '') || null : null

  const verification = verifierPseudo(pseudoBrut)
  if (!verification.ok) {
    const url = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent(verification.message)}`
      : '/onboarding?error=' + encodeURIComponent(verification.message)
    redirect(url)
  }
  const pseudo = verification.pseudo

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      pseudo: pseudo,
      equipe_favorite: equipe_favorite || null,
      avatar_id: avatar_id
    })

  if (error) {
    const message = error.code === '23505'
      ? 'Ce pseudo est déjà pris par un autre joueur'
      : "Ton profil n'a pas pu être créé, réessaie"
    if (error.code !== '23505') console.error('[saveOnboarding]', error.message)
    const errorUrl = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`
      : '/onboarding?error=' + encodeURIComponent(message)
    redirect(errorUrl)
  }

  revalidatePath('/')
  redirect(next || '/')
}