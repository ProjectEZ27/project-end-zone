import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { modifierLigue, relancerRetardataires } from './actions'
import LeagueSubNav from '@/components/LeagueSubNav'
import DeleteLeagueButton from '@/components/DeleteLeagueButton'

export default async function ParametresLigue({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  if (league.commissaire_id !== user.id) {
    redirect('/leagues/' + id)
  }

  // 1. Membres actifs de la ligue (+ leur saison)
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id, saison_id')
    .eq('ligue_id', id)
    .eq('statut', 'actif')

  let retardataires: { id: string; pseudo: string; fait: number; total: number }[] = []
  let aJourCount = 0

  if (adhesions && adhesions.length > 0) {
    const saisonId = adhesions[0].saison_id

    // 2. Semaine actuellement ouverte pour cette saison
    const { data: semainesOuvertes } = await supabase
      .from('semaines')
      .select('id')
      .eq('saison_id', saisonId)
      .eq('statut', 'ouverte')
      .order('id', { ascending: false })

    const semaineOuverte = semainesOuvertes?.[0] ?? null

    if (semaineOuverte) {
      // 3. Matchs de cette semaine
      const { data: matchs } = await supabase
        .from('matchs')
        .select('id')
        .eq('semaine_id', semaineOuverte.id)

      const totalMatchs = matchs?.length ?? 0
      const matchIds = (matchs ?? []).map((m) => m.id)

      // 4. Pseudos des membres actifs
      const userIds = adhesions.map((a) => a.utilisateur_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, pseudo')
        .in('id', userIds)

      // 5. Pronostics déjà faits par ces membres sur ces matchs
      const { data: pronostics } = await supabase
        .from('pronostics')
        .select('utilisateur_id, match_id')
        .in('utilisateur_id', userIds)
        .in('match_id', matchIds.length > 0 ? matchIds : [-1])

      for (const uid of userIds) {
        const fait = (pronostics ?? []).filter((p) => p.utilisateur_id === uid).length
        const pseudo = profiles?.find((p) => p.id === uid)?.pseudo ?? 'Joueur inconnu'
        if (fait < totalMatchs) {
          retardataires.push({ id: uid, pseudo, fait, total: totalMatchs })
        } else {
          aJourCount++
        }
      }
    }
  } else if (adhesions && adhesions.length > 0) {
    // pas de semaine ouverte : on laisse retardataires vide, le JSX gèrera l'affichage
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
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
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center', color: 'white' }}>
      <LeagueSubNav ligueId={id} ligueNom={league.nom} actif="parametres" estCommissaire={true} />

      <div style={{ marginTop: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, textAlign: 'left' }}>
        <p><strong>Pronostics de la semaine en cours</strong></p>
        {adhesions === null || adhesions.length === 0 ? (
         <p style={{ color: '#999' }}>Aucun membre actif pour l'instant.</p>
        ) : retardataires.length === 0 && aJourCount === 0 ? (
         <p style={{ color: '#999' }}>⚠️ Aucune semaine ouverte trouvée actuellement.</p>
        ) : retardataires.length === 0 ? (
         <p style={{ color: '#4caf50' }}>✅ Tout le monde est à jour !</p>
        ) : (
          <>
            <p>{aJourCount} joueur(s) à jour · {retardataires.length} en retard</p>
            <ul style={{ paddingLeft: 20 }}>
              {retardataires.map((r) => (
                <li key={r.id}>{r.pseudo} — {r.fait}/{r.total} pronostics faits</li>
              ))}
            </ul>
            <form action={relancerRetardataires}>
              <input type="hidden" name="ligue_id" value={id} />
              <button type="submit" style={{ padding: '8px 16px', marginTop: 8 }}>
                📧 Relancer les retardataires
              </button>
            </form>
          </>
        )}
      </div>

      <form action={modifierLigue} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <input type="hidden" name="ligue_id" value={id} />

        <label style={{ textAlign: 'left' }}>
          Nom de la ligue
          <input type="text" name="nom" defaultValue={league.nom} required style={{ padding: 8, width: '100%', marginTop: 4 }} />
        </label>

        <label style={{ textAlign: 'left' }}>
          Taille maximum
          <input type="number" name="taille_max" defaultValue={league.taille_max} min={2} max={50} style={{ padding: 8, width: '100%', marginTop: 4 }} />
        </label>

        <label style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="rappel_1_actif" defaultChecked={league.config_rappels?.rappel_1_actif ?? true} />
          Premier rappel
        </label>
        <select name="delai_1" defaultValue={league.config_rappels?.delais_heures?.[0] ?? 24} style={{ padding: 8, width: '100%', marginTop: -8 }}>
          <option value={48}>48h avant</option>
          <option value={24}>24h avant</option>
          <option value={12}>12h avant</option>
          <option value={6}>6h avant</option>
        </select>

        <label style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <input type="checkbox" name="rappel_2_actif" defaultChecked={league.config_rappels?.rappel_2_actif ?? true} />
          Second rappel
        </label>
        <select name="delai_2" defaultValue={league.config_rappels?.delais_heures?.[1] ?? 3} style={{ padding: 8, width: '100%', marginTop: -8 }}>
          <option value={6}>6h avant</option>
          <option value={3}>3h avant</option>
          <option value={1}>1h avant</option>
        </select>

        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          Enregistrer les modifications
        </button>
      </form>
       <DeleteLeagueButton ligueId={id} ligueNom={league.nom} />
      </div>
    </div>
  )
}