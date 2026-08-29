import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinLeagueForm from './JoinLeagueForm'
import AuthRecoveryListener from './AuthRecoveryListener'
import { genererJournalSemaine } from '@/lib/journal'
import LandingPage from '@/components/LandingPage'
import LeagueLogo from '@/components/LeagueLogo'
import { calculerClassementSaison } from '@/lib/scoring'
import CountdownBadge from './CountdownBadge'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  const [profileResult, adhesionsResult, semaineClotureeResult, saisonResult, prochainMatchGlobalResult] = await Promise.all([
    supabase.from('profiles').select('pseudo').eq('id', user.id).maybeSingle(),
    supabase.from('adhesions').select('ligue_id, ligues(id, nom, logo_id)').eq('utilisateur_id', user.id).eq('statut', 'actif'),
    supabase.from('semaines').select('id, nom').eq('statut', 'cloturee').order('id', { ascending: false }).limit(1).single(),
    supabase.from('saisons').select('id').eq('statut', 'en_cours').single(),
    supabase.from('matchs').select('semaine_id').neq('statut', 'termine').order('coup_envoi', { ascending: true }).limit(1).maybeSingle(),
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

  // Classement général (toutes ligues confondues, ou sans ligue = tous les joueurs de la saison)
  const totalJoueursClassement = classementSaison.length
  const monIndexClassement = classementSaison.findIndex(j => j.utilisateur_id === user.id)
  const monRangGeneral = monIndexClassement >= 0 ? monIndexClassement + 1 : null
  const mesPointsSaison = monIndexClassement >= 0 ? classementSaison[monIndexClassement].score_saison : 0

  // Taux de réussite global de la saison (même logique que profile/page.tsx)
  let totalPronostics = 0
  let totalCorrects = 0
  if (saisonActuelleId) {
    const { data: semainesSaison } = await supabase
      .from('semaines')
      .select('id')
      .eq('saison_id', saisonActuelleId)

    const semaineIds = (semainesSaison ?? []).map((s) => s.id)
    if (semaineIds.length > 0) {
      const { data: matchsSaison } = await supabase
        .from('matchs')
        .select('id, statut, equipe_gagnante')
        .in('semaine_id', semaineIds)

      const matchIds = (matchsSaison ?? []).map((m) => m.id)
      const matchMap = new Map((matchsSaison ?? []).map((m) => [m.id, m]))

      if (matchIds.length > 0) {
        const { data: mesPronostics } = await supabase
          .from('pronostics')
          .select('match_id, equipe_choisie')
          .eq('utilisateur_id', user.id)
          .in('match_id', matchIds)

        totalPronostics = (mesPronostics ?? []).filter((p) => matchMap.get(p.match_id)?.statut === 'termine').length
        totalCorrects = (mesPronostics ?? []).filter((p) => {
          const m = matchMap.get(p.match_id)
          return m && m.statut === 'termine' && p.equipe_choisie === m.equipe_gagnante
        }).length
      }
    }
  }
  const tauxReussite = totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0

  // Bandeau "Pronostics de la semaine" — semaine dérivée du prochain match non terminé (même logique que Pronostics/Profil)
  let semaineActuelle: { id: number; nom: string } | null = null
  if (prochainMatchGlobalResult.data) {
    const { data } = await supabase.from('semaines').select('id, nom').eq('id', prochainMatchGlobalResult.data.semaine_id).single()
    semaineActuelle = data
  } else {
    const { data } = await supabase.from('semaines').select('id, nom').order('id', { ascending: false }).limit(1).single()
    semaineActuelle = data
  }

  let nombreMatchsSemaine = 0
  let prochainVerrouillage: string | null = null
  if (semaineActuelle) {
    const { count } = await supabase
      .from('matchs')
      .select('id', { count: 'exact', head: true })
      .eq('semaine_id', semaineActuelle.id)
    nombreMatchsSemaine = count ?? 0

    const { data: prochainMatchSemaine } = await supabase
      .from('matchs')
      .select('coup_envoi')
      .eq('semaine_id', semaineActuelle.id)
      .eq('statut', 'a_venir')
      .order('coup_envoi', { ascending: true })
      .limit(1)
      .maybeSingle()

    prochainVerrouillage = prochainMatchSemaine?.coup_envoi ?? null
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

        {semaineActuelle && (
          <Link
            href="/pronostics"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #7a1a15, #C8352E)',
              border: '1px solid #ff6b5f',
              borderRadius: 12,
              padding: 16,
              textDecoration: 'none',
              color: 'white',
              margin: '20px 0',
              textAlign: 'left',
              boxShadow: '0 0 20px rgba(200,53,46,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 3, height: 12, background: 'white' }} />
              <span style={{ fontSize: 10, letterSpacing: 1, color: '#ffd9d5', textTransform: 'uppercase' }}>
                {semaineActuelle.nom}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pronostics de la semaine</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#ffd9d5' }}>
              <span>📅 {nombreMatchsSemaine} match{nombreMatchsSemaine > 1 ? 's' : ''}</span>
              <CountdownBadge cible={prochainVerrouillage} />
            </div>
            <div style={{
              marginTop: 12,
              background: 'white',
              color: '#C8352E',
              fontSize: 13,
              fontWeight: 700,
              padding: 10,
              borderRadius: 8,
              textAlign: 'center',
            }}>
              Faire mes pronostics →
            </div>
          </Link>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 4 }}>
              {monRangGeneral ? `${monRangGeneral}e` : '—'}
            </div>
            <div style={{ fontSize: 9, color: '#9fb0c9' }}>
              {totalJoueursClassement > 0 ? `sur ${totalJoueursClassement} joueurs` : 'classement'}
            </div>
          </div>
          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 4 }}>{mesPointsSaison} pts</div>
            <div style={{ fontSize: 9, color: '#9fb0c9' }}>{tauxReussite}% réussite</div>
          </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
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
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid #33415a', borderRadius: 12, padding: 14 }}>
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