import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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
    notFound()
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, textAlign: 'center' }}>
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
  )
}