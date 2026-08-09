import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function HistoriqueLigue({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>📜 Historique — {league.nom}</h1>
      <p style={{ color: '#666', marginTop: 24 }}>
        L'historique se remplira au fil des saisons jouées sur Project End Zone.
        Reviens ici une fois la première saison terminée pour voir le palmarès de la ligue !
      </p>
    </div>
  )
}