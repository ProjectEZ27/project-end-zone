'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { traduireErreurAuth } from '@/lib/authErrors'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const next = formData.get('next') as string | null

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorUrl = next
      ? `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(traduireErreurAuth(error.message))}`
      : '/login?error=' + encodeURIComponent(traduireErreurAuth(error.message))
    redirect(errorUrl)
  }

  revalidatePath('/', 'layout')
  redirect(next || '/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const next = formData.get('next') as string | null

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `https://projectendzone.fr/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ''}`,
    },
  })

  if (error) {
    const errorUrl = next
      ? `/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(traduireErreurAuth(error.message))}`
      : '/signup?error=' + encodeURIComponent(traduireErreurAuth(error.message))
    redirect(errorUrl)
  }

  const onboardingUrl = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding'

  if (signUpData.session) {
    revalidatePath('/', 'layout')
    redirect(onboardingUrl)
  }

  redirect('/signup/confirmation' + (next ? `?next=${encodeURIComponent(next)}` : ''))
}