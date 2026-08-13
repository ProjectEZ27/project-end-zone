import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { saveOnboarding } from './actions'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

export default async function Onboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const equipes = Object.entries(NOMS_EQUIPES).sort((a, b) => a[1].localeCompare(b[1]))

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
        <select name="equipe_favorite" defaultValue="" style={{ padding: 10 }}>
          <option value="">Ton équipe NFL favorite (facultatif)</option>
          {equipes.map(([code, nom]) => (
            <option key={code} value={code}>{nom}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          C'est parti
        </button>
      </form>
    </div>
  )
}