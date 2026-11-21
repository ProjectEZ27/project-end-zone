import { SupabaseClient } from '@supabase/supabase-js'
import { calculerClassementSaison } from '@/lib/scoring'
import { estMatchNul } from '@/lib/matchNul'
import { REGIONS } from '@/lib/regions'

/*
 * Classement des régions.
 * Un joueur « actif » compte dans la moyenne de sa région. Il faut :
 *  - avoir pronostiqué dès la Week 1 ;
 *  - ne pas avoir raté plus de MAX_PRONOS_RATES pronostics sur les matchs déjà terminés ;
 *  - n'avoir raté AUCUN pronostic des playoffs (matchs déjà terminés).
 * Les matchs nuls ne comptent pas. Les joueurs non actifs restent dans leur ligue, seule la moyenne les ignore.
 */
export const MAX_PRONOS_RATES = 10

export type JoueurRegion = {
  utilisateur_id: string
  pseudo: string
  score_saison: number
  avatar_id: number
  photo_chemin: string | null
}

export type StatutJoueur = {
  actif: boolean
  presentSemaine1: boolean
  rates: number
  ratesPlayoffs: number
}

export type StatRegion = {
  code: string
  nom: string
  actifs: JoueurRegion[]
  moyenne: number
}

// Lit toute une table par paquets (la base limite chaque lecture)
async function lireTout<T>(
  lire: (de: number, a: number) => PromiseLike<{ data: T[] | null }>
): Promise<T[]> {
  const taille = 5000
  const tout: T[] = []
  for (let de = 0; ; de += taille) {
    const { data } = await lire(de, de + taille - 1)
    const lot = data ?? []
    tout.push(...lot)
    if (lot.length < taille) break
  }
  return tout
}

export async function chargerClassementRegions(supabase: SupabaseClient, saisonId: number) {
  const [classement, { data: profils }, { data: semaines }] = await Promise.all([
    calculerClassementSaison(supabase, saisonId),
    supabase
      .from('profiles')
      .select('id, pseudo, region, avatar_id, photo_chemin')
      .not('region', 'is', null)
      .range(0, 9999),
    supabase.from('semaines').select('id, nom').eq('saison_id', saisonId),
  ])

  const joueurs = profils ?? []
  const semaineIds = (semaines ?? []).map((s) => s.id)
  const matchs = semaineIds.length > 0
    ? await lireTout<{ id: number; semaine_id: number; statut: string; score_a: number | null; score_b: number | null }>(
        (de, a) => supabase.from('matchs').select('id, semaine_id, statut, score_a, score_b').in('semaine_id', semaineIds).order('id').range(de, a)
      )
    : []
  const idsMatchs = matchs.map((m) => m.id)
  const pronostics = idsMatchs.length > 0
    ? await lireTout<{ utilisateur_id: string; match_id: number }>(
        (de, a) => supabase.from('pronostics').select('utilisateur_id, match_id').in('match_id', idsMatchs).order('id').range(de, a)
      )
    : []

  // Semaine 1 = la première semaine qui a des matchs ; playoffs = les semaines qui ne s'appellent pas « Week N »
  const semaine1 = matchs.length > 0 ? Math.min(...matchs.map((m) => m.semaine_id)) : null
  const playoffs = new Set((semaines ?? []).filter((s) => !/^week\s*\d+$/i.test(String(s.nom).trim())).map((s) => s.id))
  const matchsSemaine1 = new Set(matchs.filter((m) => m.semaine_id === semaine1).map((m) => m.id))
  const matchsJoues = matchs.filter((m) => m.statut === 'termine' && !estMatchNul(m))

  const pronosParJoueur = new Map<string, Set<number>>()
  for (const p of pronostics) {
    if (!pronosParJoueur.has(p.utilisateur_id)) pronosParJoueur.set(p.utilisateur_id, new Set())
    pronosParJoueur.get(p.utilisateur_id)!.add(p.match_id)
  }

  const statuts = new Map<string, StatutJoueur>()
  for (const j of joueurs) {
    const faits = pronosParJoueur.get(j.id) ?? new Set<number>()
    const rates = matchsJoues.filter((m) => !faits.has(m.id)).length
    const ratesPlayoffs = matchsJoues.filter((m) => playoffs.has(m.semaine_id) && !faits.has(m.id)).length
    const presentSemaine1 = [...faits].some((id) => matchsSemaine1.has(id))
    statuts.set(j.id, {
      presentSemaine1,
      rates,
      ratesPlayoffs,
      actif: presentSemaine1 && rates <= MAX_PRONOS_RATES && ratesPlayoffs === 0,
    })
  }

  const scoreParJoueur = new Map(classement.map((c) => [c.utilisateur_id, c.score_saison]))
  const profilParId = new Map(joueurs.map((j) => [j.id, j]))

  const regions: StatRegion[] = REGIONS.map((r) => {
    const actifs: JoueurRegion[] = joueurs
      .filter((j) => j.region === r.code && statuts.get(j.id)?.actif)
      .map((j) => ({
        utilisateur_id: j.id,
        pseudo: j.pseudo,
        score_saison: scoreParJoueur.get(j.id) ?? 0,
        avatar_id: j.avatar_id ?? 1,
        photo_chemin: j.photo_chemin ?? null,
      }))
      .sort((a, b) => b.score_saison - a.score_saison)
    const total = actifs.reduce((somme, j) => somme + j.score_saison, 0)
    return { code: r.code, nom: r.nom, actifs, moyenne: actifs.length > 0 ? total / actifs.length : 0 }
  })

  // Tri : meilleure moyenne d'abord ; les régions sans joueur actif en bas
  regions.sort((a, b) => {
    if ((a.actifs.length > 0) !== (b.actifs.length > 0)) return a.actifs.length > 0 ? -1 : 1
    if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne
    return b.actifs.length - a.actifs.length
  })

  return { regions, statuts, profilParId }
}

export function formaterMoyenne(valeur: number) {
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

export function raisonNonActif(s: StatutJoueur) {
  if (!s.presentSemaine1) return "tu n'avais pas pronostiqué la Week 1"
  if (s.ratesPlayoffs > 0) return 'tu as raté des pronostics de playoffs'
  if (s.rates > MAX_PRONOS_RATES) return `${s.rates} pronostics ratés (${MAX_PRONOS_RATES} maximum)`
  return ''
}