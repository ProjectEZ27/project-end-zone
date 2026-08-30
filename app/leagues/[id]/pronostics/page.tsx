import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import MatchHeaderReadOnly from '@/components/MatchHeaderReadOnly'
import PicksColumns from '@/components/PicksColumns'
import LeagueSubNav from '@/components/LeagueSubNav'

export default async function LeaguePronostics({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ semaine?: string }>
}) {
  const { id } = await params
  const { semaine: semaineParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: league, error } = await supabase
    .from('ligues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !league) {
    notFound()
  }

  const estCommissaire = league.commissaire_id === user.id
  let estMembreActif = estCommissaire
  if (!estCommissaire) {
    const { data: monAdhesion } = await supabase
      .from('adhesions')
      .select('statut')
      .eq('ligue_id', id)
      .eq('utilisateur_id', user.id)
      .eq('statut', 'actif')
      .single()
    estMembreActif = !!monAdhesion
  }

  if (!estMembreActif) {
    notFound()
  }

  const [toutesLesSemainesResult, semaineResult] = await Promise.all([
    supabase.from('semaines').select('id, nom').order('id', { ascending: true }),
    semaineParam
      ? supabase.from('semaines').select('*').eq('id', semaineParam).single()
      : supabase.from('semaines').select('*').order('id', { ascending: false }).limit(1).single()
  ])
  const toutesLesSemaines = toutesLesSemainesResult.data ?? []
  const semaine = semaineResult.data

  if (!semaine) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏟️ {league.nom}</h1>
        <p>Aucune semaine ouverte pour le moment.</p>
      </div>
    )
  }

  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .eq('semaine_id', semaine.id)
    .order('coup_envoi', { ascending: true })

  const matchIds = (matchs ?? []).map((m) => m.id)

  // Membres actifs de la ligue (commissaire + adhésions actives)
  const { data: adhesionsData } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', id)
    .eq('statut', 'actif')

  const membreIds = Array.from(new Set([
    league.commissaire_id,
    ...(adhesionsData ?? []).map((a) => a.utilisateur_id),
  ]))

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', membreIds)

  const pseudoParId = new Map((profilesData ?? []).map((p) => [p.id, p.pseudo]))

  const { data: pronosticsLigue } = matchIds.length > 0
    ? await supabase
        .from('pronostics')
        .select('match_id, utilisateur_id, equipe_choisie')
        .in('match_id', matchIds)
        .in('utilisateur_id', membreIds)
    : { data: [] }

  const pronosticsParMatch = new Map<string, { utilisateur_id: string; equipe_choisie: string }[]>()
  for (const p of pronosticsLigue ?? []) {
    const liste = pronosticsParMatch.get(p.match_id) ?? []
    liste.push(p)
    pronosticsParMatch.set(p.match_id, liste)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Ligue.webp)',
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
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center', color: 'white' }}>
      <LeagueSubNav ligueId={id} ligueNom={league.nom} actif="pronostics" />
      <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>Pronostics de tous les membres</p>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {toutesLesSemaines.map((s) => (
          <Link
            key={s.id}
            href={`/leagues/${id}/pronostics?semaine=${s.id}`}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              border: s.id === semaine.id ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
              backgroundColor: s.id === semaine.id ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
              color: s.id === semaine.id ? 'white' : 'rgba(255,255,255,0.6)',
            }}
          >
            {s.nom}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {matchs?.map((match) => {
          const verrouille = match.statut !== 'a_venir'
          const termine = match.statut === 'termine'
          const team1 = { code: match.equipe_a, name: NOMS_EQUIPES[match.equipe_a] ?? match.equipe_a }
          const team2 = { code: match.equipe_b, name: NOMS_EQUIPES[match.equipe_b] ?? match.equipe_b }

          const pronosticsDuMatch = pronosticsParMatch.get(match.id) ?? []
          const idsAyantPronostique = new Set(pronosticsDuMatch.map((p) => p.utilisateur_id))

          const picksGauche = pronosticsDuMatch
            .filter((p) => p.equipe_choisie === team1.code)
            .map((p) => ({
              userId: p.utilisateur_id,
              pseudo: pseudoParId.get(p.utilisateur_id) ?? 'Joueur inconnu',
              correct: termine && match.equipe_gagnante === team1.code,
            }))

          const picksDroite = pronosticsDuMatch
            .filter((p) => p.equipe_choisie === team2.code)
            .map((p) => ({
              userId: p.utilisateur_id,
              pseudo: pseudoParId.get(p.utilisateur_id) ?? 'Joueur inconnu',
              correct: termine && match.equipe_gagnante === team2.code,
            }))

          const nOntPasPronostique = membreIds
            .filter((mid) => !idsAyantPronostique.has(mid))
            .map((mid) => pseudoParId.get(mid) ?? 'Joueur inconnu')

          return (
            <div key={match.id} style={{ marginBottom: 20 }}>
              <MatchHeaderReadOnly
                team1={team1}
                team2={team2}
                finished={termine}
                equipeGagnante={match.equipe_gagnante}
              />

              {verrouille ? (
                <PicksColumns
                  picksGauche={picksGauche}
                  picksDroite={picksDroite}
                  nOntPasPronostique={nOntPasPronostique}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: 14,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#999',
                    marginTop: 4,
                  }}
                >
                  🔒 Coup d'envoi pas encore donné — pronostics masqués
                </div>
              )}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}