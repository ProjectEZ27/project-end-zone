'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { traduireErreurAuth } from '@/lib/authErrors'

export async function demanderReinitialisation(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  })

  if (error) {
    redirect('/mot-de-passe-oublie?error=' + encodeURIComponent(traduireErreurAuth(error.message)))
  }

  redirect('/mot-de-passe-oublie?envoye=1')
}