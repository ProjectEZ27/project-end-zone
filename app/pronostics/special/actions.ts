'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitSpecialPick(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const type = formData.get('type') as string
  const saison_id = formData.get('saison_id') as string
  const choix = formData.get('choix') as string

  // Date limite fixe pour l'instant : 1er septembre 2026 (avant le coup d'envoi de la saison)
  const date_limite = '2026-09-01T00:00:00Z'

  // Regarder si un pronostic de ce type existe déjà pour cette saison
  const { data: existant } = await supabase
    .from('pronostics_speciaux')
    .select('id')
    .eq('utilisateur_id', user.id)
    .eq('saison_id', saison_id)
    .eq('type', type)
    .single()

  if (existant) {
    await supabase
      .from('pronostics_speciaux')
      .update({ choix })
      .eq('id', existant.id)
  } else {
    await supabase
      .from('pronostics_speciaux')
      .insert({
        utilisateur_id: user.id,
        saison_id: saison_id,
        type: type,
        choix: choix,
        date_limite: date_limite,
      })
  }

  revalidatePath('/pronostics/special')
}