import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinLeagueForm from './JoinLeagueForm'
import AuthRecoveryListener from './AuthRecoveryListener'
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

  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('ligue_id, ligues(id, nom)')
    .eq('utilisateur_id', user.id)
    .eq('statut', 'actif')

  const liguesBrutes = (adhesions ?? [])
  .map((a: any) => a.ligues)
  .filter(Boolean)

  const mesLigues = Array.from(
  new Map(liguesBrutes.map((l: any) => [l.id, l])).values()
)

  // Journal du mardi : on cherche la dernière semaine clôturée (la plus récente terminée)
  const { data: derniereSemaineCloturee } = await supabase
    .from('semaines')
    .select('id, nom')
    .eq('statut', 'cloturee')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const journalPhrases = derniereSemaineCloturee
    ? await genererJournalSemaine(supabase, derniereSemaineCloturee.id)
    : []

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <AuthRecoveryListener />
      <img src="/logo-officiel.png" alt="Project End Zone" style={{ width: 160, margin: '0 auto', display: 'block' }} />
      <p>Connecté en tant que {profile.pseudo}</p>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/pronostics" style={{ padding: 12, backgroundColor: '#C8352E', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          🏈 Faire mes pronostics
        </Link>
        <Link href="/pronostics/special" style={{ padding: 12, backgroundColor: '#16233F', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          🏆 Pronostics bonus (Super Bowl, MVP)
        </Link>
        <Link href="/bilan" style={{ padding: 12, backgroundColor: '#16233F', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          📊 Mon bilan de saison
        </Link>
      </div>

      {journalPhrases.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #33415a', borderRadius: 8, textAlign: 'left' }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>📰 Moment fort du mardi</h2>
          {journalPhrases.map((phrase, i) => (
            <p key={i} style={{ margin: '4px 0' }}>{phrase}</p>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: 'left' }}>
        <h2>Mes ligues</h2>
        {mesLigues.length === 0 ? (
          <p style={{ color: '#999' }}>Tu ne fais partie d'aucune ligue pour le moment.</p>
        ) : (
          mesLigues.map((ligue: any) => (
            <Link
              key={ligue.id}
              href={`/leagues/${ligue.id}`}
              style={{ display: 'block', padding: 12, marginBottom: 8, border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}
            >
              🏟️ {ligue.nom}
            </Link>
          ))
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: 'left' }}>
        <h2>Rejoindre une ligue</h2>
        <JoinLeagueForm />
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/leagues/create" style={{ padding: 12, display: 'block', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          ➕ Créer une nouvelle ligue
        </Link>
      </div>

      <form action="/auth/logout" method="post" style={{ marginTop: 32 }}>
        <button style={{ padding: 10 }}>Se déconnecter</button>
      </form>

      <div style={{ marginTop: 40, fontSize: 12, color: '#666', display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link href="/legal/mentions" style={{ color: '#666' }}>Mentions légales</Link>
        <Link href="/legal/confidentialite" style={{ color: '#666' }}>Confidentialité</Link>
        <Link href="/legal/cgu" style={{ color: '#666' }}>CGU</Link>
      </div>
    </div>
  )
}