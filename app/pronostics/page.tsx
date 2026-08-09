import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { selectPronostic } from './actions'
import { TeamBadge, NOMS_EQUIPES } from '@/lib/teamBadge'
import SelecteurSemaine from './SelecteurSemaine'

export default async function Pronostics({ searchParams }: { searchParams: Promise<{ semaine?: string }> }) {
  const { semaine: semaineParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: toutesLesSemaines } = await supabase
    .from('semaines')
    .select('id, nom')
    .order('id', { ascending: true })

  let semaine
  if (semaineParam) {
    const { data } = await supabase
      .from('semaines')
      .select('*')
      .eq('id', semaineParam)
      .single()
    semaine = data
  } else {
    const { data } = await supabase
      .from('semaines')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    semaine = data
  }

  if (!semaine) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏈 Pronostics</h1>
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

  const { data: mesPronostics } = await supabase
    .from('pronostics')
    .select('*')
    .eq('utilisateur_id', user.id)
    .in('match_id', matchIds)

  const mesPronosticsMap = new Map((mesPronostics ?? []).map((p) => [p.match_id, p]))
  const nombreFaits = mesPronostics?.length ?? 0
  const nombreTotal = matchs?.length ?? 0

  // Pronostics de TOUT LE MONDE sur les matchs déjà verrouillés (règle de visibilité)
  const matchsVerrouilles = (matchs ?? []).filter((m) => m.statut !== 'a_venir').map((m) => m.id)

  let tousLesPronosticsMap = new Map<string, { pseudo: string; equipe_choisie: string }[]>()
  if (matchsVerrouilles.length > 0) {
    const { data: pronosticsPublics } = await supabase
      .from('pronostics')
      .select('match_id, utilisateur_id, equipe_choisie')
      .in('match_id', matchsVerrouilles)

    if (pronosticsPublics && pronosticsPublics.length > 0) {
      const userIds = [...new Set(pronosticsPublics.map((p) => p.utilisateur_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, pseudo')
        .in('id', userIds)

      for (const p of pronosticsPublics) {
        const pseudo = profilesData?.find((pr) => pr.id === p.utilisateur_id)?.pseudo ?? 'Joueur inconnu'
        const liste = tousLesPronosticsMap.get(p.match_id) ?? []
        liste.push({ pseudo, equipe_choisie: p.equipe_choisie })
        tousLesPronosticsMap.set(p.match_id, liste)
      }
    }
  }

 const indexActuel = toutesLesSemaines?.findIndex((s) => s.id === semaine.id) ?? -1
  const semainePrecedente = indexActuel > 0 ? toutesLesSemaines?.[indexActuel - 1] : null
  const semaineSuivante = indexActuel !== -1 && indexActuel < (toutesLesSemaines?.length ?? 0) - 1 ? toutesLesSemaines?.[indexActuel + 1] : null

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        {matchs?.map((match) => {
          const monPronostic = mesPronosticsMap.get(match.id)
          const verrouille = match.statut !== 'a_venir'
          const termine = match.statut === 'termine'
          const bonPronostic = termine && monPronostic?.equipe_choisie === match.equipe_gagnante
          const autresPronostics = tousLesPronosticsMap.get(match.id) ?? []

          return (
            <div key={match.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, opacity: verrouille && !termine ? 0.7 : 1 }}>
              <p style={{ fontSize: 12, color: '#666' }}>
                {new Date(match.coup_envoi).toLocaleString('fr-FR')}
                {verrouille && !termine && ' · Verrouillé'}
                {termine && ' · Terminé'}
              </p>

              {termine ? (
                <div>
                  <p style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {match.equipe_a} {match.score_a} - {match.score_b} {match.equipe_b}
                  </p>
                  {monPronostic && (
                    <p>{bonPronostic ? '✅ Bon pronostic' : '❌ Mauvais pronostic'} (tu avais mis {monPronostic.equipe_choisie})</p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <form action={selectPronostic}>
                  <input type="hidden" name="match_id" value={match.id} />
                  <input type="hidden" name="equipe" value={match.equipe_a} />
                  <button
                    type="submit"
                    disabled={verrouille}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: monPronostic?.equipe_choisie === match.equipe_a ? 'bold' : 'normal',
                      backgroundColor: monPronostic?.equipe_choisie === match.equipe_a ? '#C8352E' : '#16233F',
                    }}
                  >
                    <TeamBadge code={match.equipe_a} size={28} />
                    {NOMS_EQUIPES[match.equipe_a] ?? match.equipe_a}
                  </button>
                </form>
                  <form action={selectPronostic}>
                  <input type="hidden" name="match_id" value={match.id} />
                  <input type="hidden" name="equipe" value={match.equipe_b} />
                  <button
                    type="submit"
                    disabled={verrouille}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: monPronostic?.equipe_choisie === match.equipe_b ? 'bold' : 'normal',
                      backgroundColor: monPronostic?.equipe_choisie === match.equipe_b ? '#C8352E' : '#16233F',
                    }}
                  >
                    <TeamBadge code={match.equipe_b} size={28} />
                    {NOMS_EQUIPES[match.equipe_b] ?? match.equipe_b}
                  </button>
                </form>
                </div>
              )}

              {verrouille && autresPronostics.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#444', textAlign: 'left' }}>
                  <strong>Pronostics de la ligue :</strong>
                  {autresPronostics.map((p, i) => (
                    <div key={i}>{p.pseudo} : {p.equipe_choisie}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}