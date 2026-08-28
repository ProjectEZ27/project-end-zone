import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RappelPerso from './RappelPerso'
import AvatarEditor from '@/components/AvatarEditor'
import PseudoEditor from '@/components/PseudoEditor'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import { TbTargetArrow, TbTrendingUp, TbBallAmericanFootball, TbCalendarCheck, TbTrophy, TbCalendar, TbClock } from 'react-icons/tb'
import { calculerClassementSaison } from '@/lib/scoring'

export default async function Profile({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: errorMessage } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ÉTAPE 1 : tout ce qui ne dépend de rien d'autre, en parallèle
  const [profileResult, saisonResult, prochainMatchResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('saisons').select('*').eq('statut', 'en_cours').single(),
    supabase.from('matchs').select('coup_envoi, semaine_id').neq('statut', 'termine').order('coup_envoi', { ascending: true }).limit(1).maybeSingle(),
  ])

  const profile = profileResult.data
  const saison = saisonResult.data
  const prochainMatchData = prochainMatchResult.data

  let semaineActuelleData: { id: number; nom: string } | null = null
  if (prochainMatchData) {
    const { data } = await supabase.from('semaines').select('id, nom').eq('id', prochainMatchData.semaine_id).single()
    semaineActuelleData = data
  } else {
    const { data } = await supabase.from('semaines').select('id, nom').order('id', { ascending: false }).limit(1).single()
    semaineActuelleData = data
  }

  // ÉTAPE 2 : trois chaînes indépendantes entre elles, chacune en parallèle des autres
  async function calculerStatsSaison() {
    let totalPronostics = 0
    let totalCorrects = 0
    let meilleureSemaine = 0
    let semainesParfaites = 0
    const resultatsParSemaine: { nom: string; corrects: number; total: number }[] = []

    if (!saison) return { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine }

    const { data: semaines } = await supabase
      .from('semaines')
      .select('*')
      .eq('saison_id', saison.id)
      .order('id', { ascending: true })

    if (!semaines || semaines.length === 0) return { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine }

    const semaineIds = semaines.map((s) => s.id)
    const { data: matchs } = await supabase
      .from('matchs')
      .select('*')
      .in('semaine_id', semaineIds)

    if (!matchs || matchs.length === 0) return { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine }

    const matchIds = matchs.map((m) => m.id)
    const { data: pronostics } = await supabase
      .from('pronostics')
      .select('*')
      .eq('utilisateur_id', user!.id)
      .in('match_id', matchIds)

    if (!pronostics) return { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine }

    const matchMap = new Map(matchs.map((m) => [m.id, m]))

    totalPronostics = pronostics.filter((p) => {
      const match = matchMap.get(p.match_id)
      return match && match.statut === 'termine'
    }).length

    totalCorrects = pronostics.filter((p) => {
      const match = matchMap.get(p.match_id)
      return match && match.statut === 'termine' && p.equipe_choisie === match.equipe_gagnante
    }).length

    for (const semaine of semaines) {
      const matchsDeLaSemaine = matchs.filter((m) => m.semaine_id === semaine.id)
      const matchsTermines = matchsDeLaSemaine.filter((m) => m.statut === 'termine')
      if (matchsTermines.length === matchsDeLaSemaine.length && matchsDeLaSemaine.length > 0) {
        const mesPronosSemaine = pronostics.filter((p) =>
          matchsDeLaSemaine.some((m) => m.id === p.match_id)
        )
        const corrects = mesPronosSemaine.filter((p) => {
          const match = matchMap.get(p.match_id)
          return match && p.equipe_choisie === match.equipe_gagnante
        }).length

        if (corrects > meilleureSemaine) meilleureSemaine = corrects
        if (corrects === matchsDeLaSemaine.length) semainesParfaites++

        resultatsParSemaine.push({ nom: semaine.nom, corrects, total: matchsDeLaSemaine.length })
      }
    }

    return { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine }
  }

  async function calculerClassement() {
    if (!saison) return { monRang: null as number | null, totalJoueursClassement: 0, mesPoints: 0 }
    const classementSaison = await calculerClassementSaison(supabase, saison.id)
    const monIndex = classementSaison.findIndex((j) => j.utilisateur_id === user!.id)
    return {
      monRang: monIndex >= 0 ? monIndex + 1 : null,
      totalJoueursClassement: classementSaison.length,
      mesPoints: monIndex >= 0 ? classementSaison[monIndex].score_saison : 0,
    }
  }

  async function calculerMatchsAPronostiquer() {
    if (!semaineActuelleData) return 0

    const { data: matchsSemaineActuelle } = await supabase
      .from('matchs')
      .select('id')
      .eq('semaine_id', semaineActuelleData.id)
      .eq('statut', 'a_venir')

    if (!matchsSemaineActuelle || matchsSemaineActuelle.length === 0) return 0

    const idsMatchsSemaine = matchsSemaineActuelle.map((m) => m.id)
    const { data: pronosSemaineActuelle } = await supabase
      .from('pronostics')
      .select('match_id')
      .eq('utilisateur_id', user!.id)
      .in('match_id', idsMatchsSemaine)

    const idsDejaFaits = new Set((pronosSemaineActuelle ?? []).map((p) => p.match_id))
    return idsMatchsSemaine.filter((id) => !idsDejaFaits.has(id)).length
  }

  const [
    { totalPronostics, totalCorrects, meilleureSemaine, semainesParfaites, resultatsParSemaine },
    { monRang, totalJoueursClassement, mesPoints },
    matchsAPronostiquer,
  ] = await Promise.all([
    calculerStatsSaison(),
    calculerClassement(),
    calculerMatchsAPronostiquer(),
  ])

  const tauxReussite = totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0

  const stats = [
    { icon: <TbTargetArrow size={18} />, valeur: `${tauxReussite}%`, label: 'Taux de réussite' },
    { icon: <TbTrendingUp size={18} />, valeur: meilleureSemaine, label: 'Meilleure semaine' },
    { icon: <TbBallAmericanFootball size={18} />, valeur: totalPronostics, label: 'Pronostics faits' },
    { icon: <TbCalendarCheck size={18} />, valeur: semainesParfaites, label: 'Semaines parfaites' },
  ]

  const formatDateProchainMatch = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Profil.png)',
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

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        <AvatarEditor currentAvatarId={profile?.avatar_id ?? 1}>
          <PseudoEditor currentPseudo={profile?.pseudo ?? 'Profil'} />
        </AvatarEditor>

        {errorMessage && (
          <p style={{ color: '#e05252', marginTop: 8 }}>⚠️ {errorMessage}</p>
        )}
        {profile?.equipe_favorite && (
          <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4 }}>
            Équipe favorite :{' '}
            <span style={{ color: '#C8352E', fontWeight: 600 }}>
              {NOMS_EQUIPES[profile.equipe_favorite] ?? profile.equipe_favorite}
            </span>
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#16233F',
              border: '0.5px solid #33415a',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'left',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#2a1418', color: '#E8544C',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{s.valeur}</div>
                <div style={{ fontSize: 10, color: '#9fb0c9' }}>{s.label}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#C8352E' }} />
            </div>
          ))}
        </div>

        {/* BLOC MA SAISON */}
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <TbTrophy size={16} color="#EF9F27" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Ma saison {saison?.nom ?? ''}</span>
          </div>

          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 14 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#0b1220', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#9fb0c9' }}>CLASSEMENT</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{monRang ? `${monRang}e` : '—'}</div>
                <div style={{ fontSize: 9, color: '#7a8aa5' }}>
                  {totalJoueursClassement > 0 ? `sur ${totalJoueursClassement} joueurs` : ''}
                </div>
              </div>
              <div style={{ background: '#0b1220', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#9fb0c9' }}>TOTAL POINTS</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{mesPoints} pts</div>
                <div style={{ fontSize: 9, color: '#7a8aa5' }}>cette saison</div>
              </div>
            </div>

            {resultatsParSemaine.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: '#9fb0c9', marginBottom: 8 }}>
                  Évolution de mon pourcentage de réussite
                </div>
                {(() => {
                  const pourcentages = resultatsParSemaine.map((r) => r.total > 0 ? (r.corrects / r.total) * 100 : 0)
                  const minReel = Math.min(...pourcentages)
                  const maxReel = Math.max(...pourcentages)

                  // Axe ajusté à la fourchette réelle, avec un peu de marge, arrondi aux 10 les plus proches
                  let axisMin = Math.max(0, Math.floor((minReel - 10) / 10) * 10)
                  let axisMax = Math.min(100, Math.ceil((maxReel + 10) / 10) * 10)
                  if (axisMax - axisMin < 20) {
                    axisMin = Math.max(0, axisMin - 10)
                    axisMax = Math.min(100, axisMax + 10)
                  }
                  const axisMid = Math.round((axisMin + axisMax) / 2)

                  const points = resultatsParSemaine.map((r, i) => {
                    const pct = r.total > 0 ? (r.corrects / r.total) * 100 : 0
                    const x = 26 + (i * (280 / Math.max(resultatsParSemaine.length - 1, 1)))
                    const y = 90 - ((pct - axisMin) / (axisMax - axisMin)) * 80
                    return { x, y }
                  })
                  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

                  return (
                    <svg viewBox="0 0 320 100" style={{ width: '100%', height: 'auto' }}>
                      <line x1="24" y1="10" x2="310" y2="10" stroke="#1c2942" strokeWidth="1" />
                      <line x1="24" y1="50" x2="310" y2="50" stroke="#1c2942" strokeWidth="1" />
                      <line x1="24" y1="90" x2="310" y2="90" stroke="#1c2942" strokeWidth="1" />
                      <text x="0" y="13" fontSize="7" fill="#5a6b85">{axisMax}%</text>
                      <text x="4" y="53" fontSize="7" fill="#5a6b85">{axisMid}%</text>
                      <text x="6" y="93" fontSize="7" fill="#5a6b85">{axisMin}%</text>
                      <polyline points={polyline} fill="none" stroke="#C8352E" strokeWidth="2.5" />
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 3} fill={i === points.length - 1 ? '#EF9F27' : '#C8352E'} />
                      ))}
                    </svg>
                  )
                })()}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#5a6b85', marginTop: 2, padding: '0 24px 0 26px' }}>
                  {resultatsParSemaine.map((r, i) => (
                    <span key={i}>{r.nom.replace('Week ', 'S')}</span>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 16, paddingTop: 14, borderTop: '0.5px solid #33415a' }}>
              <div style={{ textAlign: 'center' }}>
                <TbCalendar size={14} color="#7a8aa5" style={{ display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: 9, color: '#7a8aa5', marginTop: 3 }}>Semaine actuelle</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{semaineActuelleData?.nom ?? '—'}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TbClock size={14} color="#7a8aa5" style={{ display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: 9, color: '#7a8aa5', marginTop: 3 }}>Prochain match</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                  {prochainMatchData ? formatDateProchainMatch(prochainMatchData.coup_envoi) : '—'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TbBallAmericanFootball size={14} color="#7a8aa5" style={{ display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: 9, color: '#7a8aa5', marginTop: 3 }}>À pronostiquer</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{matchsAPronostiquer} match{matchsAPronostiquer > 1 ? 's' : ''}</div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ marginTop: 16, padding: 16, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, textAlign: 'left' }}>
          <RappelPerso actif={profile?.rappel_perso_actif ?? false} />
        </div>
      </div>
    </div>
  )
}