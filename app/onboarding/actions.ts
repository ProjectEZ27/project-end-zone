'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const pseudo = formData.get('pseudo') as string
  const equipe_favorite = formData.get('equipe_favorite') as string
  const avatar_id = parseInt(formData.get('avatar_id') as string) || 1
  const next = formData.get('next') as string | null

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
      : error.message
    const errorUrl = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`
      : '/onboarding?error=' + encodeURIComponent(message)
    redirect(errorUrl)
  }

  revalidatePath('/')
  redirect(next || '/')
}