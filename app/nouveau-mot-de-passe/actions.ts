'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { traduireErreurAuth } from '@/lib/authErrors'

export async function definirNouveauMotDePasse(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?error=' + encodeURIComponent('Lien expiré, merci de refaire une demande'))
  }

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/nouveau-mot-de-passe?error=' + encodeURIComponent(traduireErreurAuth(error.message)))
  }

  redirect('/login?error=' + encodeURIComponent('Mot de passe modifié, tu peux te reconnecter'))
}