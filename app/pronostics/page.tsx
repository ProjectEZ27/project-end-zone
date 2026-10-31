import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import SelecteurSemaine from './SelecteurSemaine'
import MatchLine from '@/components/MatchLine'
import { SpecialPicksPreseason, SpecialPicksAvantPlayoffs, SpecialPicksRecap } from '@/components/SpecialPicksCards'
import { grouperMatchsParCreneau } from '@/lib/groupMatchsByCreneau'
import WeekGroupHeader from '@/components/WeekGroupHeader'
import { estSemaineOuverte, calculerDateOuverture } from '@/lib/semaineOuverture'
import { getPowerIndexRanking } from '@/lib/powerIndex'
import { RESUMES_EQUIPES } from '@/lib/resumesEquipes'
import { calculerBilanEquipes } from '@/lib/bilanEquipes'
import ToggleAllInfos from '@/components/ToggleAllInfos'
import { estMatchNul, seuilsSemaine } from '@/lib/matchNul'
import { orienter } from '@/lib/domicile'
import DirectRafraichisseur from '@/components/DirectRafraichisseur'
import ResultatsRafraichisseur from '@/components/ResultatsRafraichisseur'

// Après la fin d'une semaine, on reste sur ses résultats pendant ce nombre d'heures
// (compté depuis le dernier coup d'envoi de la semaine), sauf si la semaine suivante a déjà commencé.
const HEURES_MAINTIEN_SEMAINE_TERMINEE = 36

export default async function Pronostics({ searchParams }: { searchParams: Promise<{ semaine?: string }> }) {
  const { semaine: semaineParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [toutesLesSemainesResult, semaineParamResult, classement] = await Promise.all([
    supabase.from('semaines').select('id, nom').order('id', { ascending: true }),
    semaineParam
      ? supabase.from('semaines').select('*').eq('id', semaineParam).single()
      : Promise.resolve({ data: null }),
    getPowerIndexRanking(new Date().getFullYear())
  ])
  const toutesLesSemaines = toutesLesSemainesResult.data
  let semaine = semaineParamResult.data
  const rangParEquipe = new Map(classement.map((e) => [e.code, e.rang]))
  const descCourte = (code: string) => {
    return RESUMES_EQUIPES[code]?.texte ?? null
  }

  // Si on affiche par défaut la semaine qui vient de se terminer, on garde ici la semaine suivante à proposer
  let semaineAPasser: { id: number; nom: string } | null = null

  if (!semaine) {
    // Semaine par défaut = celle du prochain match non terminé (chronologiquement),
    // sinon la toute dernière semaine si tout est déjà joué.
    const { data: prochainMatch } = await supabase
      .from('matchs')
      .select('semaine_id, coup_envoi')
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

      // Si la semaine précédente vient de se terminer, on reste sur ses résultats
      const indexNouvelle = toutesLesSemaines?.findIndex((s) => s.id === semaineTrouvee?.id) ?? -1
      if (semaineTrouvee && toutesLesSemaines && indexNouvelle > 0) {
        const precedente = toutesLesSemaines[indexNouvelle - 1]
        const { data: matchsPrecedente } = await supabase
          .from('matchs')
          .select('statut, coup_envoi')
          .eq('semaine_id', precedente.id)

        const liste = matchsPrecedente ?? []
        const toutTermine = liste.length > 0 && liste.every((m) => m.statut === 'termine')

        if (toutTermine) {
          const dernierCoupEnvoi = Math.max(...liste.map((m) => new Date(m.coup_envoi).getTime()))
          const maintenantMs = Date.now()
          const dansLeMaintien = maintenantMs - dernierCoupEnvoi < HEURES_MAINTIEN_SEMAINE_TERMINEE * 3600 * 1000
          const nouvelleSemaineCommencee = maintenantMs >= new Date(prochainMatch.coup_envoi).getTime()

          if (dansLeMaintien && !nouvelleSemaineCommencee) {
            const { data: semainePrecedenteComplete } = await supabase
              .from('semaines')
              .select('*')
              .eq('id', precedente.id)
              .single()
            if (semainePrecedenteComplete) {
              semaine = semainePrecedenteComplete
              semaineAPasser = { id: semaineTrouvee.id, nom: semaineTrouvee.nom }
            }
          }
        }
      }
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
    supabase.from('saisons').select('id, nom').eq('statut', 'en_cours').single()
  ])
  const matchs = matchsResult.data
  const saison = saisonResult.data
  const estSemainePlayoffsVide =
    (!matchs || matchs.length === 0) &&
    (estSemaineWildCard || estSemaineDivisionnaire || estSemaineFinaleConference || estSemaineSuperBowl)

  const matchIds = (matchs ?? []).map((m) => m.id)

  const [bilanParEquipe, mesPronosticsResult, pronosSpeciauxResult] = await Promise.all([
    saison ? calculerBilanEquipes(supabase, saison.id) : Promise.resolve({} as Record<string, { victoires: number; defaites: number }>),
    supabase.from('pronostics').select('*').eq('utilisateur_id', user.id).in('match_id', matchIds),
    saison
      ? supabase.from('pronostics_speciaux').select('type, choix').eq('utilisateur_id', user.id).eq('saison_id', saison.id)
      : Promise.resolve({ data: null })
  ])
  const mesPronostics = mesPronosticsResult.data
  const mesPronosSpeciaux = pronosSpeciauxResult.data ?? []

  const mesPronosticsMap = new Map((mesPronostics ?? []).map((p) => [p.match_id, p]))
  const matchsNuls = (matchs ?? []).filter(estMatchNul)
  const idsMatchsNuls = new Set(matchsNuls.map((m) => m.id))
  const nombreMatchsComptes = (matchs?.length ?? 0) - matchsNuls.length
  const regles = seuilsSemaine(semaine, nombreMatchsComptes, matchs?.length ?? 0)

  const nombreFaits = (mesPronostics ?? []).filter((p) => !idsMatchsNuls.has(p.match_id)).length
  const nombreTotal = nombreMatchsComptes

  const premierMatch = matchs && matchs.length > 0 ? matchs[0] : null
  const semaineOuverte = estPremiereSemaine
    ? true
    : (premierMatch ? estSemaineOuverte(premierMatch.coup_envoi) : true)
  const dateOuverture = premierMatch ? calculerDateOuverture(premierMatch.coup_envoi) : null

  const formatDateOuverture = (date: Date) => {
    const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
    return jour.charAt(0).toUpperCase() + jour.slice(1)
  }

  const maintenant = Date.now()
  const directActif = (matchs ?? []).some((m) => {
    const debutMatch = new Date(m.coup_envoi).getTime()
    return m.statut !== 'termine' && maintenant >= debutMatch - 15 * 60 * 1000 && maintenant - debutMatch < 5 * 3600 * 1000
  })
  const resultatsAttendus = (matchs ?? []).some((m) => {
    const debutMatch = new Date(m.coup_envoi).getTime()
    return m.statut !== 'termine' && maintenant - debutMatch > 2.5 * 3600 * 1000 && maintenant - debutMatch < 48 * 3600 * 1000
  })

  const creneaux = grouperMatchsParCreneau(matchs ?? [])

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Pronostics.webp)',
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
      <DirectRafraichisseur actif={directActif} />
      <ResultatsRafraichisseur actif={resultatsAttendus} />
      <h1>🏈 {semaine.nom}</h1>
      <p>
        +{regles.bonus_1} pt dès {regles.seuil_bonus_1} bons pronos · +{regles.bonus_2} pts dès {regles.seuil_bonus_2} · Perfect week +{regles.bonus_perfect}
      </p>
      {(matchs?.length ?? 0) > 0 && (
        <p style={{ fontSize: 12, color: matchsNuls.length > 0 ? '#f0c869' : 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
          {matchsNuls.length > 0
            ? `${nombreMatchsComptes} matchs comptés · ${matchsNuls.length} ${matchsNuls.length > 1 ? 'matchs nuls non comptabilisés' : 'match nul non comptabilisé'}`
            : `${nombreMatchsComptes} ${nombreMatchsComptes > 1 ? 'matchs' : 'match'} cette semaine`}
        </p>
      )}
      {semaineAPasser ? (
        <div style={{
          border: '1px solid rgba(200,53,46,0.5)',
          background: 'rgba(200,53,46,0.12)',
          borderRadius: 10,
          padding: '12px 14px',
          margin: '12px 0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {semaine.nom} terminée, voici tous les résultats
          </div>
          <a
            href={`/pronostics?semaine=${semaineAPasser.id}`}
            style={{
              display: 'block',
              marginTop: 10,
              background: '#C8352E',
              color: 'white',
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Passer aux pronostics de la {semaineAPasser.nom} →
          </a>
        </div>
      ) : nombreTotal > 0 && (
        nombreFaits === 0 ? (
          <div style={{
            background: 'rgba(200,53,46,0.12)',
            border: '1px solid rgba(200,53,46,0.4)',
            borderRadius: 8,
            padding: '12px 14px',
            margin: '12px 0',
            fontSize: 13,
            color: '#ff8f87',
            textAlign: 'left',
          }}>
            🔴 Aucun pronostic fait pour cette semaine
          </div>
        ) : nombreFaits < nombreTotal ? (
          <div style={{
            background: 'rgba(214,143,31,0.12)',
            border: '1px solid rgba(214,143,31,0.4)',
            borderRadius: 8,
            padding: '12px 14px',
            margin: '12px 0',
            fontSize: 13,
            color: '#f0c869',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            <span>⏳ {nombreFaits} sur {nombreTotal} pronostics faits</span>
            <span style={{ fontSize: 11 }}>Il en reste {nombreTotal - nombreFaits}</span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(46,168,102,0.12)',
            border: '1px solid rgba(46,168,102,0.4)',
            borderRadius: 8,
            padding: '12px 14px',
            margin: '12px 0',
            fontSize: 13,
            color: '#6fe0a0',
            textAlign: 'left',
          }}>
            ✅ Tous tes pronostics sont faits pour cette semaine
          </div>
        )
      )}

      <a href="/infos-equipes" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'linear-gradient(135deg, rgba(200,53,46,0.18), rgba(200,53,46,0.06))',
        border: '1px solid rgba(200,53,46,0.35)',
        borderRadius: 10,
        padding: '12px 14px',
        margin: '16px 0',
        textDecoration: 'none',
        color: 'white',
      }}>
        <span style={{ fontSize: 20 }}>🏈</span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>
          Voir le power ranking complet des 32 équipes
        </span>
        <span style={{ fontSize: 16, color: '#ff9088' }}>→</span>
      </a>

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

      {nombreTotal > 0 && !estSemainePlayoffsVide && (
        <div style={{ marginBottom: 16 }}>
          <ToggleAllInfos />
          <p style={{ color: '#5f6a80', fontSize: 10, textAlign: 'center', margin: '6px 0 0' }}>
            Affiche, match par match, le résumé des deux équipes qui s'affrontent
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
                  const verrouille = match.statut !== 'a_venir' || new Date() >= new Date(match.coup_envoi)
                  const termine = match.statut === 'termine'
                  const [codeG, codeD] = orienter(match.equipe_a, match.equipe_b)
                  const [scoreG, scoreD] = orienter(match.score_a, match.score_b)
                  const [directG, directD] = orienter(match.score_a_direct, match.score_b_direct)
                  return (
                    <MatchLine
                      key={match.id}
                      matchId={match.id}
                      team1={{ code: codeG, name: NOMS_EQUIPES[codeG] ?? codeG }}
                      team2={{ code: codeD, name: NOMS_EQUIPES[codeD] ?? codeD }}
                      score1={scoreG}
                      score2={scoreD}
                      selectedTeam={monPronostic?.equipe_choisie ?? null}
                      locked={verrouille}
                      finished={termine}
                      equipeGagnante={match.equipe_gagnante}
                      scoreDirectA={directG}
                      scoreDirectB={directD}
                      quartTemps={match.quart_temps}
                      tempsRestant={match.temps_restant}
                      rank1={rangParEquipe.get(codeG) ?? null}
                      rank2={rangParEquipe.get(codeD) ?? null}
                      desc1={descCourte(codeG)}
                      desc2={descCourte(codeD)}
                      bilan1={bilanParEquipe[codeG] ?? null}
                      bilan2={bilanParEquipe[codeD] ?? null}
                    />
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {(matchs ?? []).map((match) => {
              const [codeG, codeD] = orienter(match.equipe_a, match.equipe_b)
              const [scoreG, scoreD] = orienter(match.score_a, match.score_b)
              return (
                <MatchLine
                  key={match.id}
                  matchId={match.id}
                  team1={{ code: codeG, name: NOMS_EQUIPES[codeG] ?? codeG }}
                  team2={{ code: codeD, name: NOMS_EQUIPES[codeD] ?? codeD }}
                  score1={scoreG}
                  score2={scoreD}
                  selectedTeam={null}
                  locked={false}
                  finished={false}
                  equipeGagnante={null}
                  ouvert={false}
                  rank1={rangParEquipe.get(codeG) ?? null}
                  rank2={rangParEquipe.get(codeD) ?? null}
                  desc1={descCourte(codeG)}
                  desc2={descCourte(codeD)}
                  bilan1={bilanParEquipe[codeG] ?? null}
                  bilan2={bilanParEquipe[codeD] ?? null}
                />
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}