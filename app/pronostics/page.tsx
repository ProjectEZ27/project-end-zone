import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import SelecteurSemaine from './SelecteurSemaine'
import MatchLine from '@/components/MatchLine'
import { SpecialPicksPreseason, SpecialPicksAvantPlayoffs, SpecialPicksRecap } from '@/components/SpecialPicksCards'
import { grouperMatchsParCreneau } from '@/lib/groupMatchsByCreneau'
import WeekGroupHeader from '@/components/WeekGroupHeader'
import { estSemaineOuverte, calculerDateOuverture } from '@/lib/semaineOuverture'

export default async function Pronostics({ searchParams }: { searchParams: Promise<{ semaine?: string }> }) {
  const { semaine: semaineParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [toutesLesSemainesResult, semaineParamResult] = await Promise.all([
    supabase.from('semaines').select('id, nom').order('id', { ascending: true }),
    semaineParam
      ? supabase.from('semaines').select('*').eq('id', semaineParam).single()
      : Promise.resolve({ data: null })
  ])
  const toutesLesSemaines = toutesLesSemainesResult.data
  let semaine = semaineParamResult.data

  if (!semaine) {
    // Semaine par défaut = celle du prochain match non terminé (chronologiquement),
    // sinon la toute dernière semaine si tout est déjà joué.
    const { data: prochainMatch } = await supabase
      .from('matchs')
      .select('semaine_id')
      .neq('statut', 'termine')
      .order('coup_envoi', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (prochainMatch) {
      const { data: semaineTrouvee } = await supabase
        .from('semaines')
        .select('*')
        .eq('id', prochainMatch.semaine_id)
        .single()
      semaine = semaineTrouvee
    } else {
      const { data: derniereSemaine } = await supabase
        .from('semaines')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      semaine = derniereSemaine
    }
  }

  if (!semaine) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏈 Pronostics</h1>
        <p>Aucune semaine ouverte pour le moment.</p>
      </div>
    )
  }

  const indexActuel = toutesLesSemaines?.findIndex((s) => s.id === semaine.id) ?? -1
  const semainePrecedente = indexActuel > 0 ? toutesLesSemaines?.[indexActuel - 1] : null
  const semaineSuivante = indexActuel !== -1 && indexActuel < (toutesLesSemaines?.length ?? 0) - 1 ? toutesLesSemaines?.[indexActuel + 1] : null
  const estPremiereSemaine = semaine.nom?.toLowerCase().trim() === 'week 1'
  const estSemaineWildCard = semaine.nom?.toLowerCase().trim() === 'wild card'
  const estSemaineSuperBowl = semaine.nom?.toLowerCase().trim() === 'super bowl'
  const estSemaineDivisionnaire = semaine.nom?.toLowerCase().trim() === 'divisionnaire'
  const estSemaineFinaleConference = semaine.nom?.toLowerCase().trim() === 'finale de conférence'

  const infosPlaceholderPlayoffs: Record<string, { titre: string; texte: string }> = {
    'wild card': {
      titre: 'Format Wild Card',
      texte: "Les équipes classées 2e à 7e de chaque conférence (AFC et NFC) s'affrontent. Le 1er de chaque conférence est exempté ce tour-ci et attend directement le tour Divisionnaire.",
    },
    'divisionnaire': {
      titre: 'Format Divisionnaire',
      texte: "Le 1er de chaque conférence affronte le vainqueur du Wild Card le moins bien classé. Les deux autres vainqueurs du Wild Card s'affrontent entre eux.",
    },
    'finale de conférence': {
      titre: 'Format Finale de Conférence',
      texte: "Les 2 équipes restantes de l'AFC s'affrontent pour désigner le champion AFC, et pareil côté NFC pour désigner le champion NFC.",
    },
    'super bowl': {
      titre: 'Format Super Bowl',
      texte: "Le champion AFC affronte le champion NFC pour le titre de champion NFL.",
    },
  }


  const [matchsResult, saisonResult] = await Promise.all([
    supabase.from('matchs').select('*').eq('semaine_id', semaine.id).order('coup_envoi', { ascending: true }),
    (estPremiereSemaine || estSemaineWildCard || estSemaineSuperBowl)
      ? supabase.from('saisons').select('id, nom').eq('statut', 'en_cours').single()
      : Promise.resolve({ data: null })
  ])
  const matchs = matchsResult.data
  const saison = saisonResult.data

  const estSemainePlayoffsVide =
    (!matchs || matchs.length === 0) &&
    (estSemaineWildCard || estSemaineDivisionnaire || estSemaineFinaleConference || estSemaineSuperBowl)

  const matchIds = (matchs ?? []).map((m) => m.id)

  const [mesPronosticsResult, pronosSpeciauxResult] = await Promise.all([
    supabase.from('pronostics').select('*').eq('utilisateur_id', user.id).in('match_id', matchIds),
    saison
      ? supabase.from('pronostics_speciaux').select('type, choix').eq('utilisateur_id', user.id).eq('saison_id', saison.id)
      : Promise.resolve({ data: null })
  ])
  const mesPronostics = mesPronosticsResult.data
  const mesPronosSpeciaux = pronosSpeciauxResult.data ?? []

  const mesPronosticsMap = new Map((mesPronostics ?? []).map((p) => [p.match_id, p]))
  const nombreFaits = mesPronostics?.length ?? 0
  const nombreTotal = matchs?.length ?? 0

  const premierMatch = matchs && matchs.length > 0 ? matchs[0] : null
  const semaineOuverte = estPremiereSemaine
    ? true
    : (premierMatch ? estSemaineOuverte(premierMatch.coup_envoi) : true)
  const dateOuverture = premierMatch ? calculerDateOuverture(premierMatch.coup_envoi) : null

  const formatDateOuverture = (date: Date) => {
    const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
    return jour.charAt(0).toUpperCase() + jour.slice(1)
  }

  const creneaux = grouperMatchsParCreneau(matchs ?? [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Pronostics.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {semainePrecedente ? (
          <a href={`/pronostics?semaine=${semainePrecedente.id}`} style={{ padding: 8 }}>← {semainePrecedente.nom}</a>
        ) : <span />}
        {semaineSuivante ? (
          <a href={`/pronostics?semaine=${semaineSuivante.id}`} style={{ padding: 8 }}>{semaineSuivante.nom} →</a>
        ) : <span />}
      </div>

      <SelecteurSemaine semaines={toutesLesSemaines ?? []} semaineActuelle={semaine.id} />
      <h1>🏈 {semaine.nom}</h1>
      <p>
        +{semaine.bonus_1} pt dès {semaine.seuil_bonus_1} bons pronos · +{semaine.bonus_2} pts dès {semaine.seuil_bonus_2} · Perfect week +{semaine.bonus_perfect}
      </p>
      <p><strong>{nombreFaits}/{nombreTotal} pronostics faits</strong></p>

      {estPremiereSemaine && saison && (
        <SpecialPicksPreseason saisonId={saison.id} mesPronosSpeciaux={mesPronosSpeciaux} />
      )}

      {estSemaineWildCard && saison && (
        <SpecialPicksAvantPlayoffs saisonId={saison.id} mesPronosSpeciaux={mesPronosSpeciaux} />
      )}

      {estSemaineSuperBowl && saison && (
        <SpecialPicksRecap mesPronosSpeciaux={mesPronosSpeciaux} />
      )}

      {!semaineOuverte && dateOuverture && (
        <div
          style={{
            position: 'relative',
            borderRadius: 10,
            padding: '16px 18px',
            marginTop: 20,
            marginBottom: 12,
            textAlign: 'center',
            backgroundColor: '#10141f',
            border: '1.5px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ fontSize: 22 }}>🔒</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
            Ouverture des pronostics
          </div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{formatDateOuverture(dateOuverture)}</div>
        </div>
      )}

      {estSemainePlayoffsVide && (
        <div
          style={{
            border: '1px solid rgba(200,53,46,0.35)',
            borderRadius: 10,
            padding: 20,
            marginTop: 20,
            marginBottom: 12,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(200,53,46,0.15), rgba(200,53,46,0.05))',
          }}
        >
          <div style={{ fontSize: 22 }}>🏈</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Matchs à venir
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            {infosPlaceholderPlayoffs[semaine.nom?.toLowerCase().trim() ?? '']?.titre}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0 }}>
            {infosPlaceholderPlayoffs[semaine.nom?.toLowerCase().trim() ?? '']?.texte}
          </p>
        </div>
      )}

      <div>
        {estSemainePlayoffsVide ? null : semaineOuverte ? (
          creneaux.map((creneau) => (
            <div key={creneau.coupEnvoi}>
              <WeekGroupHeader
                coupEnvoi={creneau.coupEnvoi}
                nombreMatchs={creneau.matchs.length}
                estActif={creneau.estActif}
                estVerrouille={creneau.estVerrouille}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {creneau.matchs.map((match) => {
                  const monPronostic = mesPronosticsMap.get(match.id)
                  const verrouille = match.statut !== 'a_venir'
                  const termine = match.statut === 'termine'

                  return (
                    <MatchLine
                      key={match.id}
                      matchId={match.id}
                      team1={{ code: match.equipe_a, name: NOMS_EQUIPES[match.equipe_a] ?? match.equipe_a }}
                      team2={{ code: match.equipe_b, name: NOMS_EQUIPES[match.equipe_b] ?? match.equipe_b }}
                      score1={match.score_a}
                      score2={match.score_b}
                      selectedTeam={monPronostic?.equipe_choisie ?? null}
                      locked={verrouille}
                      finished={termine}
                      equipeGagnante={match.equipe_gagnante}
                    />
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {(matchs ?? []).map((match) => (
              <MatchLine
                key={match.id}
                matchId={match.id}
                team1={{ code: match.equipe_a, name: NOMS_EQUIPES[match.equipe_a] ?? match.equipe_a }}
                team2={{ code: match.equipe_b, name: NOMS_EQUIPES[match.equipe_b] ?? match.equipe_b }}
                score1={match.score_a}
                score2={match.score_b}
                selectedTeam={null}
                locked={false}
                finished={false}
                equipeGagnante={null}
                ouvert={false}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}