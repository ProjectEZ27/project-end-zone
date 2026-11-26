import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import type { StatsEquipe } from '@/components/DuelsExpert'

/*
 * « Infos avant le match ».
 *
 * Les infos des équipes (classement, résumés, statistiques des Duels expert) sont remplacées
 * chaque semaine. On en garde donc une « photo » par match dans la table `infos_avant_match` :
 * elle est rafraîchie tant que le match n'a pas commencé, puis figée au coup d'envoi.
 * Après le match, on retrouve ainsi ce qu'on pouvait lire au moment de faire son choix.
 */

export type InfosEquipeMatch = { rang: number | null; texte: string | null; stats: StatsEquipe | null }
// Rangées par code d'équipe (ex. « SF »)
export type InfosMatch = Record<string, InfosEquipeMatch>
export type Photo = { match_id: string; contenu: InfosMatch; signature: string }

// Rattrapage unique, à la mise en place : les matchs joués entre la mise à jour du 25/11 et celle
// du 02/12 n'ont pas de photo, mais les infos du site sont encore celles d'avant ces matchs.
// Passé le 02/12 à 0 h (heure de Paris), cette règle ne s'applique plus jamais.
const DEBUT_RATTRAPAGE = Date.parse('2026-11-25T13:48:00Z')
const FIN_RATTRAPAGE = Date.parse('2026-12-01T23:00:00Z')

// Écriture « stable » (même contenu = même texte, quel que soit l'ordre des champs)
function texteStable(valeur: unknown): string {
  if (Array.isArray(valeur)) return `[${valeur.map(texteStable).join(',')}]`
  if (valeur && typeof valeur === 'object') {
    const o = valeur as Record<string, unknown>
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${texteStable(o[k])}`).join(',')}}`
  }
  return JSON.stringify(valeur) ?? 'null'
}

export function signatureInfos(infos: InfosMatch): string {
  return createHash('sha1').update(texteStable(infos)).digest('hex')
}

/**
 * Pour un match : quelles infos afficher, et faut-il enregistrer une photo ?
 *  - avant le coup d'envoi : les infos du jour, et la photo est mise à jour si elles ont changé ;
 *  - après : la photo, sans jamais la modifier.
 */
export function choisirInfos({
  actuelles,
  photo,
  coupEnvoi,
  commence,
  termine,
  maintenant = Date.now(),
}: {
  actuelles: InfosMatch
  photo?: Photo
  coupEnvoi: string
  commence: boolean
  termine: boolean
  maintenant?: number
}): { infos: InfosMatch | null; figees: boolean; enregistrer: 'rafraichir' | 'rattraper' | null } {
  if (!commence) {
    const change = !photo || photo.signature !== signatureInfos(actuelles)
    return { infos: actuelles, figees: false, enregistrer: change ? 'rafraichir' : null }
  }
  if (photo) return { infos: photo.contenu, figees: true, enregistrer: null }

  const debut = new Date(coupEnvoi).getTime()
  if (debut >= DEBUT_RATTRAPAGE && debut < FIN_RATTRAPAGE && maintenant < FIN_RATTRAPAGE) {
    return { infos: actuelles, figees: true, enregistrer: 'rattraper' }
  }
  // Pas de photo : on n'affiche jamais les infos du jour sous un match terminé
  return { infos: termine ? null : actuelles, figees: false, enregistrer: null }
}

// La table n'est lisible et modifiable que par le site lui-même (clé de service)
function clientService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && cle ? createClient(url, cle) : null
}

/** Photos déjà enregistrées. En cas de souci, la page s'affiche quand même (sans photos). */
export async function lirePhotos(matchIds: string[]): Promise<Map<string, Photo>> {
  const base = clientService()
  if (!base || matchIds.length === 0) return new Map()
  const { data, error } = await base
    .from('infos_avant_match')
    .select('match_id, contenu, signature')
    .in('match_id', matchIds)
  if (error) {
    console.error('[infos avant match] lecture échouée :', error.message)
    return new Map()
  }
  return new Map(((data ?? []) as Photo[]).map((p) => [p.match_id, p]))
}

export async function enregistrerPhotos(aRafraichir: Photo[], aRattraper: Photo[]) {
  const base = clientService()
  if (!base) return
  const maj_le = new Date().toISOString()
  for (const [lignes, garderExistante] of [[aRafraichir, false], [aRattraper, true]] as const) {
    if (lignes.length === 0) continue
    const { error } = await base
      .from('infos_avant_match')
      .upsert(lignes.map((l) => ({ ...l, maj_le })), { onConflict: 'match_id', ignoreDuplicates: garderExistante })
    if (error) console.error('[infos avant match] enregistrement échoué :', error.message)
  }
}