import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinLeagueForm from './JoinLeagueForm'
import AuthRecoveryListener from './AuthRecoveryListener'
import { genererJournalSemaine } from '@/lib/journal'
import LandingPage from '@/components/LandingPage'
import LeagueLogo from '@/components/LeagueLogo'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  const [profileResult, adhesionsResult, semaineClotureeResult] = await Promise.all([
  supabase.from('profiles').select('pseudo').eq('id', user.id).single(),
  supabase.from('adhesions').select('ligue_id, ligues(id, nom, logo_id)').eq('utilisateur_id', user.id).eq('statut', 'actif'),
  supabase.from('semaines').select('id, nom').eq('statut', 'cloturee').order('id', { ascending: false }).limit(1).single()
])

const profile = profileResult.data
if (!profile) {
  redirect('/onboarding')
}

const adhesions = adhesionsResult.data
const liguesBrutes = (adhesions ?? [])
  .map((a: any) => a.ligues)
  .filter(Boolean)

const mesLigues = Array.from(
  new Map(liguesBrutes.map((l: any) => [l.id, l])).values()
)

// Journal du mardi : on cherche la dernière semaine clôturée (la plus récente terminée)
const derniereSemaineCloturee = semaineClotureeResult.data

const journalPhrases = derniereSemaineCloturee
  ? await genererJournalSemaine(supabase, derniereSemaineCloturee.id)
  : []

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <img src="/logo-officiel.png" alt="Project End Zone" style={{ width: 160, margin: '0 auto', display: 'block' }} />
      <p>Connecté en tant que {profile.pseudo}</p>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/pronostics" style={{ padding: 12, backgroundColor: '#C8352E', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          🏈 Faire mes pronostics
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {mesLigues.map((ligue: any) => (
              <Link
                key={ligue.id}
                href={`/leagues/${ligue.id}`}
                style={{
                  aspectRatio: '1 / 1',
                  backgroundColor: '#16233F',
                  border: '1px solid #33415a',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: 12,
                  textDecoration: 'none',
                  color: 'white',
                }}
              >
                <div style={{ position: 'relative', width: '62%', aspectRatio: '1 / 1' }}>
                  <LeagueLogo logoId={ligue.logo_id ?? 1} size={200} leagueName={ligue.nom} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                  {ligue.nom}
                </div>
              </Link>
            ))}
          </div>
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
  <Link href="/contact" style={{ color: '#666' }}>Nous contacter</Link>
</div>
    </div>
  )
}