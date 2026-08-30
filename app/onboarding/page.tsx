import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/OnboardingForm'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error: errorMessage, next } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const equipes = Object.entries(NOMS_EQUIPES).sort((a, b) => a[1].localeCompare(b[1]))

  return <OnboardingForm equipes={equipes} errorMessage={errorMessage} next={next} />
}