import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { lancerSaisonSuivante } from './actions'

export default async function RelanceLigue({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: saisonActuelle } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  const { data: saisonSuivante } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'a_venir')
    .order('id', { ascending: true })
    .limit(1)
    .single()

  if (!saisonSuivante) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🔄 Lancer la saison suivante</h1>
        <p>Aucune saison "à venir" n'est configurée pour le moment.</p>
      </div>
    )
  }

  let membres: { id: string; pseudo: string }[] = []
  if (saisonActuelle) {
    const { data: adhesions } = await supabase
      .from('adhesions')
      .select('utilisateur_id')
      .eq('ligue_id', id)
      .eq('saison_id', saisonActuelle.id)
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
      }))
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>🔄 Lancer la saison suivante</h1>
      <p>Prochaine saison : {saisonSuivante.nom}</p>
      <p style={{ color: '#666', fontSize: 14 }}>
        Décoche les joueurs que tu ne veux pas garder pour la nouvelle saison.
      </p>

      <form action={lancerSaisonSuivante} style={{ marginTop: 24, textAlign: 'left' }}>
        <input type="hidden" name="ligue_id" value={id} />
        <input type="hidden" name="saison_suivante_id" value={saisonSuivante.id} />

        {membres.map((membre) => (
          <label key={membre.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
            <input type="checkbox" name="garder" value={membre.id} defaultChecked />
            {membre.pseudo}
          </label>
        ))}

        <button type="submit" style={{ padding: 10, marginTop: 16, width: '100%' }}>
          Confirmer et lancer la saison {saisonSuivante.nom}
        </button>
      </form>
    </div>
  )
}