'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const pseudo = formData.get('pseudo') as string
  const equipe_favorite = formData.get('equipe_favorite') as string

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      pseudo: pseudo,
      equipe_favorite: equipe_favorite || null,
    })

  if (error) {
    redirect('/onboarding?error=' + encodeURIComponent(error.message))
  }

  redirect('/')
}