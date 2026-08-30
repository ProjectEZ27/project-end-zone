import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { joinLeague } from './actions'

export default async function JoinLeague({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/leagues/join/' + code)
  }

  const { data: league, error } = await supabase
    .from('ligues')
    .select('*')
    .eq('code_invitation', code)
    .single()

  if (error || !league) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1A1D24' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 24px', textAlign: 'center', color: 'white' }}>
          <h1>😕 Code invalide</h1>
          <p style={{ color: '#999', marginTop: 8 }}>
            Le code d'invitation « {code} » ne correspond à aucune ligue. Vérifie qu'il est bien copié sans espace, ou demande un nouveau lien au commissaire.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 24,
              padding: '10px 20px',
              backgroundColor: '#C8352E',
              borderRadius: 6,
              textDecoration: 'none',
              color: 'white',
            }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1A1D24' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 24px', textAlign: 'center', color: 'white' }}>
        <h1>🏈 Tu rejoins {league.nom}</h1>
        <p>{league.taille_max} joueurs max</p>
        <p>Ta demande sera envoyée au commissaire pour validation.</p>

        <form action={joinLeague}>
          <input type="hidden" name="ligue_id" value={league.id} />
          <button type="submit" style={{ padding: 10, marginTop: 20 }}>
            Demander à rejoindre
          </button>
        </form>
      </div>
    </div>
  )
}