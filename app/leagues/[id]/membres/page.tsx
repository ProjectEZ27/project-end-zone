import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MembresLigue({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  let membres: { id: string; pseudo: string; date_entree: string }[] = []

  if (saison) {
    const { data: adhesions } = await supabase
      .from('adhesions')
      .select('utilisateur_id, date_entree')
      .eq('ligue_id', id)
      .eq('saison_id', saison.id)
      .eq('statut', 'actif')

    if (adhesions && adhesions.length > 0) {
      const userIds = adhesions.map((a) => a.utilisateur_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, pseudo')
        .in('id', userIds)

      membres = adhesions.map((a) => ({
        id: a.utilisateur_id,
        pseudo: profiles?.find((p) => p.id === a.utilisateur_id)?.pseudo ?? 'Joueur inconnu',
        date_entree: a.date_entree,
      }))
    }
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
      <h1>👥 Membres — {league.nom}</h1>
      <p>{membres.length} joueur{membres.length > 1 ? 's' : ''} actif{membres.length > 1 ? 's' : ''}</p>

      <div style={{ marginTop: 24, textAlign: 'left' }}>
        {membres.map((membre) => (
          <div key={membre.id} style={{ borderBottom: '1px solid #eee', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <Link href={`/joueur/${membre.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                {membre.pseudo}
              </Link>
              {membre.id === league.commissaire_id ? ' 👑' : ''}
            </span>
            <span style={{ fontSize: 12, color: '#666' }}>
              Depuis le {new Date(membre.date_entree).toLocaleDateString('fr-FR')}
            </span>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}