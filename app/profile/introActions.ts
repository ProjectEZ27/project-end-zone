'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changerIntroAnimation(actif: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({ intro_animation: actif }).eq('id', user.id)

  revalidatePath('/profile')
  revalidatePath('/joueur/[id]', 'page')
}