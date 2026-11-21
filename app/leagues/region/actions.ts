'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { REGIONS } from '@/lib/regions'

export async function choisirRegion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const region = String(formData.get('region') ?? '')
  const pays = String(formData.get('pays') ?? '').trim()

  if (!REGIONS.some((r) => r.code === region)) {
    redirect('/leagues/region?erreur=' + encodeURIComponent('Choisis une région dans la liste'))
  }
  if (region === 'hors-france' && (!pays || pays.length > 60)) {
    redirect('/leagues/region?erreur=' + encodeURIComponent('Indique ton pays'))
  }

  // Toute la sécurité est dans la base : une seule fois par joueur, inscription directe dans la ligue de la région
  const { error } = await supabase.rpc('choisir_region', {
    p_region: region,
    p_pays: region === 'hors-france' ? pays : null,
  })

  if (error) {
    console.error('[choisirRegion]', error.message)
    const message = error.message.includes('déjà choisie')
      ? 'Tu as déjà choisi ta région pour cette saison'
      : "Ta région n'a pas pu être enregistrée, réessaie"
    redirect('/leagues/region?erreur=' + encodeURIComponent(message))
  }

  redirect('/leagues?region=ok')
}