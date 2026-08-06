import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createLeague } from './actions'

export default async function CreateLeague() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏈 Créer une ligue</h1>
      <p>Rassemble tes amis pour la saison NFL</p>

      <form action={createLeague} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <input
          type="text"
          name="nom"
          placeholder="Nom de la ligue"
          required
          style={{ padding: 10 }}
        />
        <input
          type="number"
          name="taille_max"
          placeholder="Nombre max de joueurs"
          defaultValue={20}
          min={2}
          max={50}
          style={{ padding: 10 }}
        />
        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          Créer la ligue
        </button>
      </form>
    </div>
  )
}