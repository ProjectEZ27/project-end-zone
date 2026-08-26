import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinLeagueForm from './JoinLeagueForm'
import AuthRecoveryListener from './AuthRecoveryListener'
import { genererJournalSemaine } from '@/lib/journal'
import LandingPage from '@/components/LandingPage'
import LeagueLogo from '@/components/LeagueLogo'
import { calculerClassementSaison } from '@/lib/scoring'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  const [profileResult, adhesionsResult, semaineClotureeResult, saisonResult] = await Promise.all([
    supabase.from('profiles').select('pseudo').eq('id', user.id).single(),
    supabase.from('adhesions').select('ligue_id, ligues(id, nom, logo_id)').eq('utilisateur_id', user.id).eq('statut', 'actif'),
    supabase.from('semaines').select('id, nom').eq('statut', 'cloturee').order('id', { ascending: false }).limit(1).single(),
    supabase.from('saisons').select('id').eq('statut', 'en_cours').single()
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

  const saisonActuelleId = saisonResult.data?.id

  const classementSaison = saisonActuelleId
    ? await calculerClassementSaison(supabase, saisonActuelleId)
    : []

  const ligueIds = mesLigues.map((l: any) => l.id)
  const { data: tousLesMembres } = ligueIds.length > 0
    ? await supabase.from('adhesions').select('ligue_id, utilisateur_id').in('ligue_id', ligueIds).eq('statut', 'actif')
    : { data: [] as any[] }

  const membresParLigue = new Map<number, string[]>()
  for (const m of tousLesMembres ?? []) {
    if (!membresParLigue.has(m.ligue_id)) membresParLigue.set(m.ligue_id, [])
    membresParLigue.get(m.ligue_id)!.push(m.utilisateur_id)
  }

  function getInfosLigue(ligueId: number) {
    const membres = membresParLigue.get(ligueId) ?? []
    const classementLigue = classementSaison.filter(j => membres.includes(j.utilisateur_id))
    const rangIndex = classementLigue.findIndex(j => j.utilisateur_id === user!.id)
    return {
      nombreJoueurs: membres.length,
      rang: rangIndex >= 0 ? rangIndex + 1 : null,
    }
  }

  // Journal du mardi : on cherche la dernière semaine clôturée (la plus récente terminée)
  const derniereSemaineCloturee = semaineClotureeResult.data

  const journalPhrases = derniereSemaineCloturee
    ? await genererJournalSemaine(supabase, derniereSemaineCloturee.id)
    : []

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fond photo pleine hauteur, joueur à gauche, transparence sombre */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Acceuil.png)',
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

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center' }}>
        <img src="/logo-officiel.png" alt="Project End Zone" style={{ width: 160, margin: '0 auto', display: 'block' }} />
        <p style={{ color: 'white', marginTop: 12 }}>Connecté en tant que {profile.pseudo}</p>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/pronostics" style={{ padding: '14px 16px', backgroundColor: '#C8352E', borderRadius: 10, textDecoration: 'none', color: 'white', textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>🏈 Faire mes pronostics</div>
            <div style={{ fontSize: 12, color: '#f6d3d1', marginTop: 2 }}>Pronostique les matchs de la semaine</div>
          </Link>
          <Link href="/bilan" style={{ padding: '14px 16px', backgroundColor: '#16233F', border: '0.5px solid #33415a', borderRadius: 10, textDecoration: 'none', color: 'white', textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>📊 Mon bilan de saison</div>
            <div style={{ fontSize: 12, color: '#9fb0c9', marginTop: 2 }}>Retrouve tes stats et tes performances</div>
          </Link>
        </div>

        {journalPhrases.length > 0 && (
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #33415a', borderRadius: 8, textAlign: 'left', background: 'rgba(22,35,63,0.6)' }}>
            <h2 style={{ fontSize: 16, marginBottom: 8, color: 'white' }}>📰 Moment fort du mardi</h2>
            {journalPhrases.map((phrase, i) => (
              <p key={i} style={{ margin: '4px 0', color: 'white' }}>{phrase}</p>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 3, height: 14, background: '#C8352E' }} />
            <span style={{ fontSize: 13, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mes ligues</span>
          </div>
          {mesLigues.length === 0 ? (
            <p style={{ color: '#999' }}>Tu ne fais partie d'aucune ligue pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {mesLigues.map((ligue: any) => {
                const { nombreJoueurs, rang } = getInfosLigue(ligue.id)
                const couleurBadge =
                  rang === 1 ? { bg: '#EF9F27', color: '#412402', label: '1er' } :
                  rang === 2 ? { bg: '#B9C1CC', color: '#1c1c1c', label: '2e' } :
                  rang === 3 ? { bg: '#B5651D', color: '#2c1608', label: '3e' } :
                  rang ? { bg: '#33415a', color: 'white', label: `${rang}e` } :
                  null

                return (
                  <Link
                    key={ligue.id}
                    href={`/leagues/${ligue.id}`}
                    style={{
                      aspectRatio: '1 / 1',
                      backgroundColor: '#16233F',
                      border: '0.5px solid #33415a',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: 10,
                      textDecoration: 'none',
                      color: 'white',
                      position: 'relative',
                    }}
                  >
                    {couleurBadge && (
                      <div style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: couleurBadge.bg,
                        color: couleurBadge.color,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 20,
                      }}>
                        {couleurBadge.label}
                      </div>
                    )}
                    <LeagueLogo logoId={ligue.logo_id ?? 1} size={56} leagueName={ligue.nom} />
                    <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                      {ligue.nom}
                    </div>
                    <div style={{ fontSize: 10, color: '#9fb0c9' }}>{nombreJoueurs} joueurs</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 3, height: 14, background: '#C8352E' }} />
            <span style={{ fontSize: 13, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rejoindre une ligue</span>
          </div>
          <JoinLeagueForm />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 0.5, background: '#33415a' }} />
            <span style={{ fontSize: 11, color: '#7a8aa5' }}>ou</span>
            <div style={{ flex: 1, height: 0.5, background: '#33415a' }} />
          </div>
          <Link href="/leagues/create" style={{ padding: 12, display: 'block', textAlign: 'center', border: '0.5px solid #33415a', borderRadius: 8, textDecoration: 'none', color: 'white' }}>
            ➕ Créer une nouvelle ligue
          </Link>
        </div>

        <form action="/auth/logout" method="post" style={{ marginTop: 32 }}>
          <button style={{ padding: 10 }}>Se déconnecter</button>
        </form>

        <div style={{ marginTop: 40, fontSize: 12, color: '#666', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/legal/mentions" style={{ color: '#666' }}>Mentions légales</Link>
          <Link href="/legal/confidentialite" style={{ color: '#666' }}>Confidentialité</Link>
          <Link href="/legal/cgu" style={{ color: '#666' }}>CGU</Link>
          <Link href="/contact" style={{ color: '#666' }}>Nous contacter</Link>
        </div>
      </div>
    </div>
  )
}