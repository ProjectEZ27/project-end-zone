import type { SupabaseClient } from '@supabase/supabase-js'
import { derniereSemaineTerminee, nomDuTribunal, DELAI_TRIBUNAL_MS, DUREE_VEDETTE_MS } from '@/lib/journal'
import { creerNotification } from '@/lib/notifications'
import { calculerClassementSemaine } from '@/lib/scoring'

/*
 * Petites fonctions utilisées par l'Accueil et la page Ligues.
 */

export type TribunalActuel = { semaineId: number; nom: string; exceptionnel: boolean; enVedette: boolean }

/** Dernière semaine terminée : son nom de tribunal, et s'il est « en vedette » (3 jours après l'ouverture). */
export async function tribunalActuel(supabase: SupabaseClient): Promise<TribunalActuel | null> {
  const semaineId = await derniereSemaineTerminee(supabase)
  if (!semaineId) return null
  const [{ data: semaine }, { data: matchs }] = await Promise.all([
    supabase.from('semaines').select('nom').eq('id', semaineId).single(),
    supabase.from('matchs').select('coup_envoi').eq('semaine_id', semaineId),
  ])
  const dernier = (matchs ?? []).map((m) => new Date(m.coup_envoi).getTime()).reduce((x, y) => Math.max(x, y), 0)
  if (!dernier) return null
  const t = nomDuTribunal(semaine?.nom ?? '', new Date(dernier).toISOString())
  const depuis = Date.now() - (dernier + DELAI_TRIBUNAL_MS)
  return { semaineId, nom: t.nom, exceptionnel: t.exceptionnel, enVedette: depuis >= 0 && depuis < DUREE_VEDETTE_MS }
}

export async function journalEnVedette(supabase: SupabaseClient): Promise<boolean> {
  return (await tribunalActuel(supabase))?.enVedette === true
}

/** Notification d'un joueur (ouverture de l'Accueil) : filet de sécurité, la clé évite les doublons. */
export async function notifierTribunal(supabase: SupabaseClient, userId: string, t: TribunalActuel) {
  const { data, error } = await supabase.from('profiles').select('notif_journal_actif').eq('id', userId).maybeSingle()
  // Si la colonne n'existe pas encore, on considère l'option comme cochée
  if (!error && data && (data as any).notif_journal_actif === false) return
  await creerNotification({
    userId,
    type: 'journal',
    titre: `⚖️ Le ${t.nom} est ouvert`,
    message: 'Viens voir qui a été jugé dans ta ligue.',
    lien: '/leagues',
    cle: `tribunal-${t.semaineId}`,
  })
}

/** « Ta dernière semaine » : mes bons pronostics sur la dernière semaine entièrement terminée. */
export type DerniereSemaine = {
  id: number
  nom: string
  bons: number
  total: number
  aPronostique: boolean
  points: number | null // points gagnés cette semaine (bonus compris)
  rang: number | null // rang parmi les joueurs du site cette semaine
  joueurs: number
}

export async function maDerniereSemaine(supabase: SupabaseClient, userId: string): Promise<DerniereSemaine | null> {
  const semaineId = await derniereSemaineTerminee(supabase)
  if (!semaineId) return null

  const [{ data: semaine }, { data: matchs }] = await Promise.all([
    supabase.from('semaines').select('nom').eq('id', semaineId).single(),
    supabase.from('matchs').select('id, equipe_gagnante').eq('semaine_id', semaineId),
  ])
  const ids = (matchs ?? []).map((m) => m.id)
  if (ids.length === 0) return null

  const { data: pronos } = await supabase
    .from('pronostics')
    .select('match_id, equipe_choisie')
    .eq('utilisateur_id', userId)
    .in('match_id', ids)
  const nomSemaine = semaine?.nom ?? 'Dernière semaine'
  if (!pronos || pronos.length === 0) {
    return { id: semaineId, nom: nomSemaine, bons: 0, total: ids.length, aPronostique: false, points: null, rang: null, joueurs: 0 }
  }

  const gagnants = new Map((matchs ?? []).map((m) => [m.id, m.equipe_gagnante]))
  const bons = pronos.filter((p) => gagnants.get(p.match_id) === p.equipe_choisie).length
  // Points de la semaine (avec les bonus) et rang parmi tous les joueurs
  let points: number | null = null
  let rang: number | null = null
  let joueurs = 0
  try {
    const classement = await calculerClassementSemaine(supabase, semaineId)
    joueurs = classement.length
    const moi = classement.find((j) => j.utilisateur_id === userId)
    if (moi) {
      points = moi.score_semaine
      rang = 1 + classement.filter((j) => j.score_semaine > moi.score_semaine).length
    }
  } catch {
    // on affiche au moins les bons pronostics
  }
  return { id: semaineId, nom: nomSemaine, bons, total: ids.length, aPronostique: true, points, rang, joueurs }
}

/** Carte « Ton équipe » : prochain match et dernier résultat de mon équipe favorite. */
export type MatchEquipe = {
  adversaire: string
  domicile: boolean
  coupEnvoi: string
  statut: string
  scoreEquipe: number | null
  scoreAdversaire: number | null
}
export type InfosEquipe = { prochain: MatchEquipe | null; dernier: MatchEquipe | null }

export async function infosMonEquipe(supabase: SupabaseClient, equipe: string): Promise<InfosEquipe> {
  const { data } = await supabase
    .from('matchs')
    .select('equipe_a, equipe_b, score_a, score_b, coup_envoi, statut')
    .or(`equipe_a.eq.${equipe},equipe_b.eq.${equipe}`)
    .order('coup_envoi', { ascending: true })

  const matchs: MatchEquipe[] = (data ?? []).map((m: any) => {
    const estA = m.equipe_a === equipe
    return {
      adversaire: estA ? m.equipe_b : m.equipe_a,
      domicile: estA,
      coupEnvoi: m.coup_envoi,
      statut: m.statut,
      scoreEquipe: estA ? m.score_a : m.score_b,
      scoreAdversaire: estA ? m.score_b : m.score_a,
    }
  })

  const termines = matchs.filter((m) => m.statut === 'termine')
  const restants = matchs.filter((m) => m.statut !== 'termine')
  return {
    dernier: termines.length > 0 ? termines[termines.length - 1] : null,
    prochain: restants.length > 0 ? restants[0] : null,
  }
}

/** Mes ligues, avec rang, nombre de joueurs, demandes en attente (commissaire) et position d'épinglage. */
export type MaLigue = {
  id: number
  nom: string
  logo_id: number | null
  photo_chemin: string | null
  commissaire_id: string | null
  epingle: number | null // 1, 2 ou 3 si épinglée, sinon null
  masquee: boolean // masquée des menus déroulants
  nombreJoueurs: number
  rang: number | null
  demandes: number
}

export async function chargerMesLigues(
  supabase: SupabaseClient,
  userId: string,
  classementSaison: { utilisateur_id: string }[],
): Promise<MaLigue[]> {
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('ligue_id, epingle, masquee, ligues(id, nom, logo_id, photo_chemin, commissaire_id)')
    .eq('utilisateur_id', userId)
    .eq('statut', 'actif')
    .order('ligue_id', { ascending: true })

  const brutes = (adhesions ?? []).filter((a: any) => a.ligues)
  const uniques = Array.from(new Map(brutes.map((a: any) => [a.ligues.id, a])).values()) as any[]
  const ligueIds = uniques.map((a) => a.ligues.id)
  if (ligueIds.length === 0) return []

  const { data: membres } = await supabase
    .from('adhesions')
    .select('ligue_id, utilisateur_id')
    .in('ligue_id', ligueIds)
    .eq('statut', 'actif')
  const membresParLigue = new Map<number, string[]>()
  for (const m of membres ?? []) {
    if (!membresParLigue.has(m.ligue_id)) membresParLigue.set(m.ligue_id, [])
    membresParLigue.get(m.ligue_id)!.push(m.utilisateur_id)
  }

  const idsCommissaire = uniques.filter((a) => a.ligues.commissaire_id === userId).map((a) => a.ligues.id)
  const { data: attente } = idsCommissaire.length > 0
    ? await supabase.from('adhesions').select('ligue_id').in('ligue_id', idsCommissaire).eq('statut', 'en_attente')
    : { data: [] as any[] }
  const demandes = new Map<number, number>()
  for (const d of attente ?? []) demandes.set(d.ligue_id, (demandes.get(d.ligue_id) ?? 0) + 1)

  return uniques.map((a) => {
    const l = a.ligues
    const ids = membresParLigue.get(l.id) ?? []
    const dansLigue = classementSaison.filter((j) => ids.includes(j.utilisateur_id))
    const index = dansLigue.findIndex((j) => j.utilisateur_id === userId)
    return {
      id: l.id,
      nom: l.nom,
      logo_id: l.logo_id,
      photo_chemin: l.photo_chemin,
      commissaire_id: l.commissaire_id,
      epingle: a.epingle ?? null,
      masquee: a.masquee === true,
      nombreJoueurs: ids.length,
      rang: index >= 0 ? index + 1 : null,
      demandes: demandes.get(l.id) ?? 0,
    }
  })
}

/**
 * Ordre des ligues dans les menus déroulants : les épinglées d'abord (dans leur ordre),
 * puis les autres. Les ligues masquées sont retirées, sauf celle qu'on est en train de regarder.
 */
export function liguesPourMenu<T extends { id: number; epingle?: number | null; masquee?: boolean }>(
  ligues: T[],
  idActuel?: number | null,
): T[] {
  return ligues
    .filter((l) => !l.masquee || l.id === idActuel)
    .sort((a, b) => {
      const ea = a.epingle ?? 99
      const eb = b.epingle ?? 99
      return ea !== eb ? ea - eb : a.id - b.id
    })
}