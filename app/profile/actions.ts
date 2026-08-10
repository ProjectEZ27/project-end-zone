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