import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import SelecteurSemaine from './SelecteurSemaine'
import MatchLine from '@/components/MatchLine'
import { SpecialPicksPreseason, SpecialPicksAvantPlayoffs } from '@/components/SpecialPicksCards'
import { grouperMatchsParCreneau } from '@/lib/groupMatchsByCreneau'
import WeekGroupHeader from '@/components/WeekGroupHeader'

export default async function Pronostics({ searchParams }: { searchParams: Promise<{ semaine?: string }> }) {
  const { semaine: semaineParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [toutesLesSemainesResult, semaineResult] = await Promise.all([
    supabase.from('semaines').select('id, nom').order('id', { ascending: true }),
    semaineParam
      ? supabase.from('semaines').select('*').eq('id', semaineParam).single()
      : supabase.from('semaines').select('*').order('id', { ascending: false }).limit(1).single()
  ])
  const toutesLesSemaines = toutesLesSemainesResult.data
  let semaine = semaineResult.data

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

  const [matchsResult, saisonResult] = await Promise.all([
    supabase.from('matchs').select('*').eq('semaine_id', semaine.id).order('coup_envoi', { ascending: true }),
    (estPremiereSemaine || estSemaineWildCard)
      ? supabase.from('saisons').select('id, nom').eq('statut', 'en_cours').single()
      : Promise.resolve({ data: null })
  ])
  const matchs = matchsResult.data
  const saison = saisonResult.data

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

  const creneaux = grouperMatchsParCreneau(matchs ?? [])

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
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

      <div>
        {creneaux.map((creneau) => (
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
        ))}
      </div>
    </div>
  )
}