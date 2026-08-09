import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { modifierLigue } from './actions'

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

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>⚙️ Paramètres — {league.nom}</h1>

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

        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          Enregistrer les modifications
        </button>
      </form>
    </div>
  )
}