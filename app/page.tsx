import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { genererJournalSemaine } from '@/lib/journal'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: derniereSemaine } = await supabase
    .from('semaines')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const journal = derniereSemaine
    ? await genererJournalSemaine(supabase, derniereSemaine.id)
    : []

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <img src="/logo-officiel.png" alt="Project End Zone" style={{ width: 200, margin: '0 auto', display: 'block' }} />
      <p>Connecté en tant que : {user.email}</p>
      <p>Bienvenue, {profile.pseudo} !</p>
      <form action="/auth/logout" method="post">
        <button style={{ padding: 10, marginTop: 20 }}>Se déconnecter</button>
      {journal.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, textAlign: 'left' }}>
          <p><strong>📰 Moment fort du mardi</strong></p>
          {journal.map((phrase, i) => (
            <p key={i}>{phrase}</p>
          ))}
        </div>
      )}
      </form>
    </div>
  )
}