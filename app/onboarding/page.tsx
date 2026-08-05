import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { saveOnboarding } from './actions'

export default async function Onboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏈 Bienvenue !</h1>
      <p>Choisis ton pseudo pour commencer</p>

      <form action={saveOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <input
          type="text"
          name="pseudo"
          placeholder="Ton pseudo"
          required
          style={{ padding: 10 }}
        />
        <input
          type="text"
          name="equipe_favorite"
          placeholder="Ton équipe NFL favorite (facultatif)"
          style={{ padding: 10 }}
        />
        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          C'est parti
        </button>
      </form>
    </div>
  )
}