import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { calculerClassementSaison, calculerClassementSemaine, calculerHistoriqueSemaines } from '@/lib/scoring'
import LeagueSubNav from '@/components/LeagueSubNav'

export default async function ClassementLigue({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string; semaine?: string }>
}) {
  const { id } = await params
  const { mode, semaine: semaineParam } = await searchParams
  const vueSemaine = mode === 'semaine'
  const vueHistorique = mode === 'historique'

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

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  if (!saison) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏆 Classement — {league.nom}</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', id)
    .eq('saison_id', saison.id)
    .eq('statut', 'actif')

  const membresIds = new Set((adhesions ?? []).map((a) => a.utilisateur_id))

  const { data: semaines } = await supabase
    .from('semaines')
    .select('id, nom, statut')
    .eq('saison_id', saison.id)
    .order('id', { ascending: true })

  let semaineActive: { id: number; nom: string } | null = null
  if (vueSemaine && semaines && semaines.length > 0) {
    if (semaineParam) {
      semaineActive = semaines.find((s) => String(s.id) === semaineParam) ?? null
    }
    if (!semaineActive) {
      const cloturees = semaines.filter((s) => s.statut === 'cloturee')
      semaineActive = cloturees.length > 0 ? cloturees[cloturees.length - 1] : semaines[semaines.length - 1]
    }
  }

  let lignes: { utilisateur_id: string; pseudo: string; score: number }[] = []
  let historique: { semaines: { id: number; nom: string }[]; lignes: { utilisateur_id: string; pseudo: string; scores: number[] }[] } | null = null

  if (vueHistorique) {
    historique = await calculerHistoriqueSemaines(supabase, saison.id, membresIds)
  } else if (vueSemaine && semaineActive) {
    const classementSemaine = await calculerClassementSemaine(supabase, semaineActive.id)
    lignes = classementSemaine
      .filter((j) => membresIds.has(j.utilisateur_id))
      .map((j) => ({ utilisateur_id: j.utilisateur_id, pseudo: j.pseudo, score: j.score_semaine }))
  } else {
    const classementComplet = await calculerClassementSaison(supabase, saison.id)
    lignes = classementComplet
      .filter((j) => membresIds.has(j.utilisateur_id))
      .map((j) => ({ utilisateur_id: j.utilisateur_id, pseudo: j.pseudo, score: j.score_saison }))
  }

  const boutonStyle = (actif: boolean) => ({
    padding: '6px 14px',
    borderRadius: 6,
    textDecoration: 'none',
    color: 'white',
    backgroundColor: actif ? '#C8352E' : '#16233F',
  })

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Ligue.png)',
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center', color: 'white' }}>
      <LeagueSubNav ligueId={id} ligueNom={league.nom} actif="classement" />
      <p>Saison {saison.nom}</p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <Link href={`/leagues/${id}/classement?mode=saison`} style={boutonStyle(!vueSemaine && !vueHistorique)}>
          Saison
        </Link>
        <Link href={`/leagues/${id}/classement?mode=semaine`} style={boutonStyle(vueSemaine)}>
          Semaine
        </Link>
        <Link href={`/leagues/${id}/classement?mode=historique`} style={boutonStyle(vueHistorique)}>
          Historique
        </Link>
      </div>

      {vueSemaine && semaines && semaines.length > 0 && (
        <form method="GET" style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <input type="hidden" name="mode" value="semaine" />
          <select name="semaine" defaultValue={semaineActive?.id} style={{ padding: 6 }}>
            {semaines.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}{s.statut === 'ouverte' ? ' (en cours)' : ''}
              </option>
            ))}
          </select>
          <button type="submit" style={{ padding: '6px 12px' }}>Voir</button>
        </form>
      )}

      {vueHistorique ? (
        !historique || historique.semaines.length === 0 ? (
          <p style={{ marginTop: 24 }}>Aucune semaine clôturée pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: 8, textAlign: 'left', position: 'sticky', left: 0, backgroundColor: '#0d1420' }}>Joueur</th>
                  {historique.semaines.map((s) => (
                    <th key={s.id} style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {s.nom.replace('Week ', 'S')}
                    </th>
                  ))}
                  <th style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {historique.lignes.map((joueur) => (
                  <tr key={joueur.utilisateur_id} style={{ borderBottom: '1px solid #eee', fontWeight: joueur.utilisateur_id === user.id ? 'bold' : 'normal' }}>
                    <td style={{ padding: 8, textAlign: 'left', position: 'sticky', left: 0, backgroundColor: '#0d1420' }}>{joueur.pseudo}</td>
                    {joueur.scores.map((score, i) => (
                      <td key={i} style={{ padding: '8px 6px', textAlign: 'right' }}>{score}</td>
                    ))}
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>
                      {joueur.scores.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : lignes.length === 0 ? (
        <p style={{ marginTop: 24 }}>Aucun résultat pour le moment.</p>
      ) : (
        <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>#</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Joueur</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((joueur, index) => {
              const medaille = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
              return (
                <tr key={joueur.utilisateur_id} style={{ borderBottom: '1px solid #eee', fontWeight: joueur.utilisateur_id === user.id ? 'bold' : 'normal' }}>
                  <td style={{ padding: 8 }}>{index + 1} {medaille ?? ''}</td>
                  <td style={{ padding: 8 }}>{joueur.pseudo}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{joueur.score}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      </div>
    </div>
  )
}