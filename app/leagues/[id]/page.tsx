import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { acceptMembership, rejectMembership } from './actions'

export default async function LeagueDetail({ params }: { params: Promise<{ id: string }> }) {
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
  
  let demandes: any[] = []
  if (estCommissaire) {
    const { data: adhesionsData } = await supabase
      .from('adhesions')
      .select('id, utilisateur_id')
      .eq('ligue_id', id)
      .eq('statut', 'en_attente')

    if (adhesionsData && adhesionsData.length > 0) {
      const userIds = adhesionsData.map((a) => a.utilisateur_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, pseudo')
        .in('id', userIds)

      demandes = adhesionsData.map((a) => ({
        ...a,
        pseudo: profilesData?.find((p) => p.id === a.utilisateur_id)?.pseudo ?? 'Joueur inconnu',
      }))
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏈 {league.nom}</h1>
      <p>{league.taille_max} joueurs max · Statut : {league.statut}</p>

      <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={`/leagues/${id}/pronostics`} style={{ padding: '8px 16px', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
         🏈 Pronostics
        </Link>
        <Link href={`/leagues/${id}/classement`} style={{ padding: '8px 16px', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          🏆 Classement
        </Link>
        <Link href={`/leagues/${id}/membres`} style={{ padding: '8px 16px', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          👥 Membres
        </Link>
        <Link href={`/leagues/${id}/historique`} style={{ padding: '8px 16px', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
          📜 Historique
        </Link>
        {estCommissaire && (
          <Link href={`/leagues/${id}/parametres`} style={{ padding: '8px 16px', border: '1px solid #33415a', borderRadius: 6, textDecoration: 'none', color: 'white' }}>
            ⚙️ Paramètres
          </Link>
        )}
      </div>

      {estCommissaire && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>Tu es le commissaire de cette ligue</strong></p>
          <p>Code d'invitation : <strong>{league.code_invitation}</strong></p>
          <p>Code de secours : <strong>{league.code_secours}</strong></p>
        </div>
      )}

      {estCommissaire && demandes.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>Demandes en attente ({demandes.length})</strong></p>
          {demandes.map((demande) => (
            <div key={demande.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span>{demande.pseudo}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <form action={acceptMembership}>
                  <input type="hidden" name="adhesion_id" value={demande.id} />
                  <button type="submit" style={{ padding: '4px 8px' }}>✅ Accepter</button>
                </form>
                <form action={rejectMembership}>
                  <input type="hidden" name="adhesion_id" value={demande.id} />
                  <button type="submit" style={{ padding: '4px 8px' }}>❌ Refuser</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}