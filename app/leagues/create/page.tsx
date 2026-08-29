import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createLeague } from './actions'
import LeagueLogoField from '@/components/LeagueLogoField'

export default async function CreateLeague() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Ligue.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center', color: 'white' }}>
      <h1>🏈 Créer une ligue</h1>
      <p>Rassemble tes amis pour la saison NFL</p>

      <form action={createLeague} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <LeagueLogoField />

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
    </div>
  )
}