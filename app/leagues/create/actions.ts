'use server'
 
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TAILLE_MAX_GRATUITE } from '@/lib/paliersLigue'
import { verifierNomLigue, MESSAGE_NOM_PRIS } from '@/lib/nomLigue'
 
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
 
  const verification = verifierNomLigue(formData.get('nom'))
  if (!verification.ok) {
    redirect('/leagues/create?error=' + encodeURIComponent(verification.message))
  }
  const nom = verification.nom

  // Sécurité anti double appui : une ligue du même nom créée par ce joueur il y a moins d'une minute
  // est la même demande, envoyée deux fois. On renvoie vers celle-là au lieu d'en créer une deuxième.
  const ligueToutJusteCreee = async () => {
    const { data } = await supabase
      .from('ligues')
      .select('id, nom')
      .eq('commissaire_id', user.id)
      .gte('created_at', new Date(Date.now() - 60_000).toISOString())
    return (data ?? []).find((l) => l.nom.trim().toLowerCase() === nom.toLowerCase()) ?? null
  }
  const dejaCreee = await ligueToutJusteCreee()
  if (dejaCreee) {
    redirect('/leagues/' + dejaCreee.id)
  }
  // Première saison : seules les ligues gratuites (50 joueurs max) existent
  const taille_max = TAILLE_MAX_GRATUITE
  const logo_id = Number(formData.get('logo_id')) || 1
 
  const code_invitation = generateCode(8)
  const code_secours = generateCode(8)
 
  const { data: league, error } = await supabase
    .from('ligues')
    .insert({
      nom: nom,
      commissaire_id: user.id,
      taille_max: taille_max,
      logo_id: logo_id,
      code_invitation: code_invitation,
      code_secours: code_secours,
    })
    .select('id')
    .single()
 
  if (error) {
    // 23505 = ce nom existe déjà (la base refuse deux ligues du même nom)
    if (error.code === '23505') {
      const doublon = await ligueToutJusteCreee()
      if (doublon) redirect('/leagues/' + doublon.id)
      redirect('/leagues/create?error=' + encodeURIComponent(MESSAGE_NOM_PRIS))
    }
    console.error('[creerLigue]', error.message)
    redirect('/leagues/create?error=' + encodeURIComponent("La ligue n'a pas pu être créée, réessaie"))
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
    console.error('[creerLigue] adhésion du commissaire', adhesionError.message)
    redirect('/leagues/' + league.id + '?error=' + encodeURIComponent("Ta ligue est créée mais ton inscription a échoué, contacte-nous"))
  }
 
  redirect('/leagues/' + league.id)
}