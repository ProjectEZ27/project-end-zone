'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function generateCode(length: number) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createLeague(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const nom = formData.get('nom') as string
  const taille_max = Number(formData.get('taille_max'))

  const code_invitation = generateCode(8)
  const code_secours = generateCode(8)

  const { data: league, error } = await supabase
    .from('ligues')
    .insert({
      nom: nom,
      commissaire_id: user.id,
      taille_max: taille_max,
      code_invitation: code_invitation,
      code_secours: code_secours,
    })
    .select()
    .single()

  if (error) {
    redirect('/leagues/create?error=' + encodeURIComponent(error.message))
  }

  // Récupérer la saison en cours
  const { data: saison } = await supabase
    .from('saisons')
    .select('id')
    .eq('statut', 'en_cours')
    .single()

  if (!saison) {
    redirect('/leagues/create?error=' + encodeURIComponent('Aucune saison en cours'))
  }

  // Ajouter automatiquement le commissaire comme membre actif de sa propre ligue
  const { error: adhesionError } = await supabase
    .from('adhesions')
    .insert({
      utilisateur_id: user.id,
      ligue_id: league.id,
      saison_id: saison.id,
      statut: 'actif',
    })

  if (adhesionError) {
    redirect('/leagues/' + league.id + '?error=' + encodeURIComponent(adhesionError.message))
  }

  redirect('/leagues/' + league.id)
}