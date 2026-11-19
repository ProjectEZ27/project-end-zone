'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function selectPronostic(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const match_id = formData.get('match_id') as string
  const equipe = formData.get('equipe') as string

  // Vérifier que le match n'est pas verrouillé (par statut OU par l'heure du coup d'envoi)
  // et regarder si un pronostic existe déjà pour ce match : les deux lectures en même temps
  const [{ data: match }, { data: existant }] = await Promise.all([
    supabase
      .from('matchs')
      .select('statut, coup_envoi, equipe_a, equipe_b')
      .eq('id', match_id)
      .single(),
    supabase
      .from('pronostics')
      .select('id')
      .eq('utilisateur_id', user.id)
      .eq('match_id', match_id)
      .maybeSingle(),
  ])

  if (!match || match.statut !== 'a_venir' || new Date() >= new Date(match.coup_envoi)) {
    return
  }

  // Sécurité : l'équipe choisie doit être l'une des deux équipes du match
  if (equipe !== match.equipe_a && equipe !== match.equipe_b) {
    return
  }

  if (existant) {
    // Modifier le pronostic existant
    await supabase
      .from('pronostics')
      .update({
        equipe_choisie: equipe,
        derniere_modification: new Date().toISOString(),
      })
      .eq('id', existant.id)
  } else {
    // Créer un nouveau pronostic
    await supabase
      .from('pronostics')
      .insert({
        utilisateur_id: user.id,
        match_id: match_id,
        equipe_choisie: equipe,
      })
  }

  revalidatePath('/pronostics')
}
const TYPES_SPECIAUX = ['super_bowl_preseason', 'mvp', 'super_bowl_avant_playoffs']

/**
 * Date limite d'un pronostic spécial :
 *  - avant la saison (Super Bowl, MVP) : coup d'envoi du tout premier match de la saison ;
 *  - avant les playoffs : coup d'envoi du premier match de la semaine « Wild Card ».
 * Renvoie null si les matchs concernés ne sont pas encore dans la base (rien n'est alors bloqué).
 */
async function dateLimiteSpecial(
  supabase: Awaited<ReturnType<typeof createClient>>,
  saison_id: string,
  type: string
): Promise<string | null> {
  const { data: semaines } = await supabase.from('semaines').select('id, nom').eq('saison_id', saison_id)
  if (!semaines || semaines.length === 0) return null

  const ids =
    type === 'super_bowl_avant_playoffs'
      ? semaines.filter((s) => s.nom?.toLowerCase().trim() === 'wild card').map((s) => s.id)
      : semaines.map((s) => s.id)
  if (ids.length === 0) return null

  const { data: premier } = await supabase
    .from('matchs')
    .select('coup_envoi')
    .in('semaine_id', ids)
    .order('coup_envoi', { ascending: true })
    .limit(1)
    .maybeSingle()

  return premier?.coup_envoi ?? null
}

export async function submitSpecialPick(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const type = formData.get('type') as string
  const saison_id = formData.get('saison_id') as string
  const autre_joueur = formData.get('autre_joueur') as string
  const choix_menu = formData.get('choix') as string
  const choix = (autre_joueur?.trim() ? autre_joueur.trim() : choix_menu ?? '').slice(0, 60)

  // Sécurité : seuls les pronostics spéciaux connus sont acceptés
  if (!TYPES_SPECIAUX.includes(type) || !choix || /[<>]/.test(choix)) {
    return
  }

  // Sécurité : après la date limite, le serveur refuse (même si la page est restée ouverte)
  const limite = await dateLimiteSpecial(supabase, saison_id, type)
  if (limite && new Date() >= new Date(limite)) {
    return
  }
  const date_limite = limite ?? new Date().toISOString()

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

  revalidatePath('/pronostics')
}

// Enregistre que le joueur a lu le récap d'une semaine, puis l'envoie là où il a cliqué.
export async function marquerRecapLu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const semaineId = Number(formData.get('semaine_id'))
  const destination = formData.get('destination')

  if (!Number.isInteger(semaineId)) {
    redirect('/pronostics')
  }

  const { error } = await supabase
    .from('recaps_lus')
    .insert({ utilisateur_id: user.id, semaine_id: semaineId })

  // 23505 = déjà enregistré : pas un problème. Toute autre erreur est notée dans les journaux
  // mais ne bloque pas le joueur (le cookie ci-dessous prend le relais).
  if (error && error.code !== '23505') {
    console.error('[recap] non enregistré en base :', error.message)
  }

  // Mémorisation de secours dans le navigateur : le récap ne revient pas, même si la base a refusé
  const jar = await cookies()
  jar.set(`recap_lu_${semaineId}_${user.id}`, '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })

  if (destination === 'resultats') {
    redirect(`/pronostics?semaine=${semaineId}`)
  }
  // Récap lu : /pronostics ouvre maintenant directement la semaine suivante
  redirect('/pronostics')
}

// Mémorise sur le COMPTE du joueur (et non sur l'appareil) que l'animation du récap a déjà été vue
export async function marquerRecapAnime(semaineId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const deja: number[] = Array.isArray(user.user_metadata?.recaps_animes) ? user.user_metadata.recaps_animes : []
  if (deja.includes(semaineId)) return

  const { error } = await supabase.auth.updateUser({
    data: { recaps_animes: [...deja, semaineId].slice(-20) },
  })
  if (error) console.error('[marquerRecapAnime]', error.message)
}