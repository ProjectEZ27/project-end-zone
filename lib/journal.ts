import { SupabaseClient } from '@supabase/supabase-js'
import { NOMS_EQUIPES } from './teamBadge'
import { calculerClassementSemaine } from './scoring'
import { estMatchNul } from './matchNul'

/*
 * Journal du mardi — version « banque de phrases ».
 *
 * Les phrases viennent de la table Supabase `journal_phrases`.
 * Le journal d'une ligue est le même à chaque affichage de la page : le choix des
 * phrases est « figé » par la semaine et les membres de la ligue (pas de hasard
 * qui change à chaque rafraîchissement).
 *
 * Règle importante : seuls les joueurs ACTIFS sont cités. Actif = a pronostiqué cette
 * semaine ET au moins une des 3 semaines précédentes (ou début de saison).
 */

type Phrase = { id: string; declencheur_id: string; ton: string; rarete: string; texte: string }
type Variables = Record<string, string | number>
type Stat = [string, string]
type Candidat = { id: string; priorite: number; variables: Variables; joueurs: string[]; stats: Stat[] }

export type Article = {
  id: string
  etiquette: string
  couleur: string
  titre: string
  stats: Stat[]
  texte: string
  fixe?: boolean // rubrique fixe (phrase de la semaine)
  explication?: string // petit rappel pour les termes de jargon (ex. Blowout)
}
export type JournalSemaine = {
  semaine: string
  articles: Article[]
  // vrai pendant 3 jours à partir d'1 h après le dernier match : le tribunal est alors mis en avant
  enVedette: boolean
  diagnostic?: string[] // pour l'administrateur : pourquoi tel article est (ou n'est pas) sorti
  nomTribunal: string // ex. « Tribunal du mardi », « Tribunal des Wild Cards »
  exceptionnel: boolean // vrai si le tribunal ne s'ouvre pas un mardi (saison régulière)
}
const VIDE: JournalSemaine = { semaine: '', articles: [], enVedette: false, nomTribunal: 'Tribunal du mardi', exceptionnel: false }

/** Le tribunal s'ouvre 1 h après la fin supposée du dernier match (coup d'envoi + 4 h). */
export const DELAI_TRIBUNAL_MS = 5 * 3600 * 1000
export const DUREE_VEDETTE_MS = 3 * 86400000

/**
 * Nom du tribunal : par manche en playoffs, sinon le jour d'ouverture (« du mardi » dans le cas normal).
 */
export function nomDuTribunal(nomSemaine: string, dernierMatchIso: string): { nom: string; exceptionnel: boolean } {
  const n = (nomSemaine ?? '').toLowerCase()
  if (n.includes('wild')) return { nom: 'Tribunal des Wild Cards', exceptionnel: false }
  if (n.includes('divisionn')) return { nom: 'Tribunal des Divisionnaires', exceptionnel: false }
  if (n.includes('finale')) return { nom: 'Tribunal des Finales de conférence', exceptionnel: false }
  if (n.includes('super')) return { nom: 'Tribunal du Super Bowl', exceptionnel: false }
  if (!dernierMatchIso) return { nom: 'Tribunal du mardi', exceptionnel: false }
  const ouverture = new Date(new Date(dernierMatchIso).getTime() + DELAI_TRIBUNAL_MS)
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: 'Europe/Paris' }).format(ouverture)
  return { nom: `Tribunal du ${jour}`, exceptionnel: jour !== 'mardi' }
}

// Étiquette, couleur et titre de chaque type d'article
const META: Record<string, { etiquette: string; couleur: string; titre: string; explication?: string }> = {
  A01: { etiquette: 'Sans-faute', couleur: '#3FAE6A', titre: '{p} ne rate rien' },
  A02: { etiquette: 'Blowout', couleur: '#E5483F', titre: '{p} écrase la ligue', explication: 'Blowout : une victoire écrasante, avec un écart énorme sur tous les autres.' },
  A03: { etiquette: "À l'arraché", couleur: '#F0C040', titre: "{p} gagne d'un point" },
  A04: { etiquette: 'Les jumeaux', couleur: '#3CB5A8', titre: '{p} et {p2}, jumeaux au point près' },
  A05: { etiquette: 'Le fiasco', couleur: '#9DB0D6', titre: 'La semaine à effacer pour {p}' },
  A07: { etiquette: 'Ni chaud ni froid', couleur: '#9DB0D6', titre: '{p}, pile dans la moyenne' },
  B01: { etiquette: 'Le flair', couleur: '#F0C040', titre: "{p} l'avait vu venir" },
  B02: { etiquette: 'Match piège', couleur: '#E8883A', titre: '{eq} - {adv}, le piège de la semaine' },
  B03: { etiquette: 'Match cadeau', couleur: '#3FAE6A', titre: '{eq} - {adv}, tout le monde a bon' },
  B04: { etiquette: 'Suspense', couleur: '#F0C040', titre: '{eq} - {adv} se joue à {n} point(s)' },
  B06: { etiquette: 'Kamikaze', couleur: '#E8883A', titre: '{p} seul contre tous' },
  B07: { etiquette: 'Personne ne l\'a vu', couleur: '#E5483F', titre: "Personne n'a vu venir {eq} - {adv}" },
  B09: { etiquette: 'À sens unique', couleur: '#E5483F', titre: '{eq} écrasent {adv}' },
  C01: { etiquette: 'La chute', couleur: '#F08A7E', titre: '{p} perd {n} places' },
  C02: { etiquette: 'Remontada', couleur: '#5B8DEF', titre: '{p} gagne {n} places' },
  C03: { etiquette: 'Nouveau patron', couleur: '#F0C040', titre: '{p} prend la tête' },
  C04: { etiquette: 'Il tient bon', couleur: '#5B8DEF', titre: '{p} reste en tête' },
  C05: { etiquette: 'Sur ses talons', couleur: '#E8883A', titre: '{p} à un point du leader' },
  C06: { etiquette: 'Lanterne rouge', couleur: '#E5483F', titre: '{p} ferme la marche' },
  C07: { etiquette: "L'underdog", couleur: '#5B8DEF', titre: 'Le dernier devient premier', explication: "Underdog : celui que personne n'attendait, l'outsider." },
  C08: { etiquette: 'Duel au sommet', couleur: '#E8883A', titre: '{p} contre {p2} pour la couronne' },
  C09: { etiquette: 'Podium verrouillé', couleur: '#9DB0D6', titre: 'Rien ne bouge sur le podium' },
  C10: { etiquette: 'Chute du roi', couleur: '#F08A7E', titre: '{p} perd le trône' },
  D01: { etiquette: 'Le traître', couleur: '#E5483F', titre: '{p} a trahi {fav}' },
  D02: { etiquette: 'Cœur contre raison', couleur: '#5B8DEF', titre: '{p} a cru en {fav}' },
  D03: { etiquette: 'Derby', couleur: '#E8883A', titre: '{p} contre {p2}, le derby' },
  D04: { etiquette: 'Fan comblé', couleur: '#3FAE6A', titre: '{fav} gagnent, {p} exulte' },
  L01: { etiquette: 'Embouteillage', couleur: '#F0C040', titre: '{n} joueurs en tête de la semaine' },
  L02: { etiquette: 'Les initiés', couleur: '#5B8DEF', titre: "Seulement {n} l'avaient vu venir" },
  L03: { etiquette: 'Le petit club', couleur: '#E8883A', titre: 'Le club des {n} qui se sont plantés' },
  L04: { etiquette: 'Du sommet à la cave', couleur: '#9DB0D6', titre: "{p} et {p2} : {ecart} points d'écart" },
  L05: { etiquette: 'La cave est pleine', couleur: '#9DB0D6', titre: '{n} joueurs au fond de la semaine' },
  E01: { etiquette: "C'est reparti", couleur: '#F0C040', titre: 'Nouvelle saison, nouvelles illusions' },
  E02: { etiquette: 'Halloween', couleur: '#E8883A', titre: "Semaine d'Halloween" },
  E03: { etiquette: 'Thanksgiving', couleur: '#E8883A', titre: 'Semaine de Thanksgiving' },
  E04: { etiquette: 'Noël', couleur: '#3FAE6A', titre: 'Semaine de Noël' },
  E05: { etiquette: 'Mi-saison', couleur: '#9DB0D6', titre: "Mi-saison : l'heure du bilan" },
  E06: { etiquette: 'Dernière ligne droite', couleur: '#F0C040', titre: 'Dernière ligne droite' },
  F01: { etiquette: 'Semaine massacre', couleur: '#E5483F', titre: 'La NFL a massacré la ligue' },
  F02: { etiquette: 'Open bar', couleur: '#3FAE6A', titre: 'Semaine open bar' },
  F03: { etiquette: 'Mouchoir de poche', couleur: '#F0C040', titre: 'Le podium dans un mouchoir' },
  F04: { etiquette: 'Oublis', couleur: '#9DB0D6', titre: 'Des pronostics sont restés en blanc' },
  F08: { etiquette: 'Calme plat', couleur: '#9DB0D6', titre: 'Semaine sans histoire' },
  G01: { etiquette: 'La phrase de la semaine', couleur: '#F0C040', titre: '' },
  G03: { etiquette: 'Mot du dernier', couleur: '#9DB0D6', titre: 'Un mot pour {p}' },
}

// Phrases de secours si la table journal_phrases est vide ou inaccessible
const PHRASES_SECOURS: Record<string, string[]> = {
  A01: ['{p} a fait un sans-faute cette semaine. Perfect week !'],
  A02: ['{p} a écrasé la concurrence cette semaine, sans discussion possible.'],
  A04: ['{p} et {p2} finissent à égalité parfaite cette semaine.'],
  A05: ['{p} signe le score le plus bas de la semaine. Ça arrive à tout le monde.'],
  B01: ['{p} a été le seul à voir venir la victoire surprise de {eq} face à {adv}. Respect.'],
  C01: ['{p} dégringole au classement cette semaine.'],
  C07: ['{p}, dernier au classement de la ligue, signe pourtant la meilleure semaine. Le pur underdog.'],
  F08: ['Semaine sans histoire dans la ligue : rien à signaler.'],
  G01: ['« Un pronostic, c\'est comme un parapluie : on l\'oublie quand il fait beau. »'],
}

const POIDS_RARETE: Record<string, number> = { commune: 12, rare: 4, legendaire: 1 }

// ---------- petits outils ----------

function graine(texte: string): number {
  let h = 2166136261
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function generateur(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function nomEquipe(code: string | null | undefined): string {
  if (!code) return ''
  return NOMS_EQUIPES[code] ?? code
}

// Les noms d'équipes (tous au pluriel : Chiefs, Eagles…) sont écrits « les Chiefs » dans une phrase.
// Dans un score « {eq} - {adv} », on garde le nom seul : « Chiefs - Eagles ».
const CLES_EQUIPES = ['eq', 'adv', 'fav']

function remplir(texte: string, variables: Variables): string | null {
  let resultat = texte
  if (variables.eq !== undefined && variables.adv !== undefined) {
    resultat = resultat.split('{eq} - {adv}').join(`${variables.eq} - ${variables.adv}`)
  }
  for (const [cle, valeur] of Object.entries(variables)) {
    const mot = CLES_EQUIPES.includes(cle) && valeur !== '' ? `les ${valeur}` : String(valeur)
    resultat = resultat.split(`{${cle}}`).join(mot)
  }
  // Une variable manquante : on n'utilise pas cette phrase
  if (/\{\w+\}/.test(resultat)) return null
  return resultat
    .replace(/\bde les\b/g, 'des')
    .replace(/\bDe les\b/g, 'Des')
    .replace(/(^|\s)à les(?=\s)/g, '$1aux')
    .replace(/(^|[\s«])À les(?=\s)/g, '$1Aux')
    .replace(/\ben les\b/g, 'aux')
    .replace(/(^|[.!?] |« )les /g, (m, debut) => `${debut}Les `)
}

function choisirPhrase(
  phrases: Phrase[],
  variables: Variables,
  hasard: () => number
): string | null {
  const possibles = phrases
    .map((p) => ({ p, texte: remplir(p.texte, variables) }))
    .filter((x): x is { p: Phrase; texte: string } => x.texte !== null)
  if (possibles.length === 0) return null
  const total = possibles.reduce((s, x) => s + (POIDS_RARETE[x.p.rarete] ?? 1), 0)
  let tirage = hasard() * total
  for (const x of possibles) {
    tirage -= POIDS_RARETE[x.p.rarete] ?? 1
    if (tirage <= 0) return x.texte
  }
  return possibles[possibles.length - 1].texte
}

/** Lit toutes les lignes d'une requête, par pages de 1000 (limite de Supabase). */
async function toutLire(page: (de: number, a: number) => PromiseLike<{ data: any[] | null }>): Promise<any[]> {
  const tout: any[] = []
  for (let de = 0; de < 50000; de += 1000) {
    const { data } = await page(de, de + 999)
    const lignes = data ?? []
    tout.push(...lignes)
    if (lignes.length < 1000) break
  }
  return tout
}

async function classementCumuleParSemaines(
  supabase: SupabaseClient,
  semaineIds: number[],
  membreIds: string[]
): Promise<Map<string, number>> {
  const totaux = new Map<string, number>()
  for (const id of semaineIds) {
    const classementSemaine = await calculerClassementSemaine(supabase, id)
    for (const joueur of classementSemaine) {
      if (!membreIds.includes(joueur.utilisateur_id)) continue
      totaux.set(joueur.utilisateur_id, (totaux.get(joueur.utilisateur_id) ?? 0) + joueur.score_semaine)
    }
  }
  return totaux
}

function classerParRang(totaux: Map<string, number>): Map<string, number> {
  const tries = [...totaux.entries()].sort((a, b) => b[1] - a[1])
  const rangs = new Map<string, number>()
  tries.forEach(([userId], index) => rangs.set(userId, index + 1))
  return rangs
}

function dateDecalee(coupEnvoi: string): Date {
  // Un match du dimanche soir américain tombe tôt le lendemain en UTC : on recule de 6 h
  return new Date(new Date(coupEnvoi).getTime() - 6 * 3600 * 1000)
}

function quatriemeJeudiNovembre(annee: number): number {
  const premier = new Date(Date.UTC(annee, 10, 1)).getUTCDay() // 0 = dimanche
  const premierJeudi = 1 + ((4 - premier + 7) % 7)
  return premierJeudi + 21
}

// ---------- fonction principale ----------

export async function genererJournalSemaine(
  supabase: SupabaseClient,
  semaine_id: number,
  membreIds: string[]
): Promise<JournalSemaine> {
  const { data: matchs } = await supabase.from('matchs').select('*').eq('semaine_id', semaine_id)
  if (!matchs || matchs.length === 0) return VIDE

  // Pas de journal tant que la semaine n'est pas totalement terminée
  if (matchs.some((m) => m.statut !== 'termine')) return VIDE

  const matchsNonNuls = matchs.filter((m) => !estMatchNul(m) && m.equipe_gagnante)
  const nbMatchs = matchsNonNuls.length
  if (nbMatchs === 0) return VIDE

  const matchIds = matchs.map((m) => m.id)
  const pronostics = await toutLire((de, a) =>
    supabase.from('pronostics').select('*').in('match_id', matchIds).in('utilisateur_id', membreIds).range(de, a)
  )
  if (pronostics.length === 0) return VIDE

  // ----- Semaine, saison, semaines précédentes -----
  const { data: semaineActuelle } = await supabase
    .from('semaines')
    .select('id, saison_id, nom')
    .eq('id', semaine_id)
    .single()

  let idsOrdonnes: number[] = []
  if (semaineActuelle) {
    const { data: toutes } = await supabase
      .from('semaines')
      .select('id')
      .eq('saison_id', semaineActuelle.saison_id)
      .order('id', { ascending: true })
    idsOrdonnes = (toutes ?? []).map((s) => s.id)
  }
  const indexSemaine = idsOrdonnes.indexOf(semaine_id)
  const idsAvant = indexSemaine > 0 ? idsOrdonnes.slice(0, indexSemaine) : []

  // ----- Joueurs actifs -----
  const aPronostique = new Set<string>(pronostics.map((p) => p.utilisateur_id))
  let actifsAvant: Set<string> | null = null
  const troisPrecedentes = idsAvant.slice(-3)
  if (troisPrecedentes.length > 0) {
    const { data: matchsAvant } = await supabase.from('matchs').select('id').in('semaine_id', troisPrecedentes)
    const idsMatchsAvant = (matchsAvant ?? []).map((m) => m.id)
    if (idsMatchsAvant.length > 0) {
      const pronosAvant = await toutLire((de, a) =>
        supabase
          .from('pronostics')
          .select('utilisateur_id')
          .in('match_id', idsMatchsAvant)
          .in('utilisateur_id', [...aPronostique])
          .range(de, a)
      )
      actifsAvant = new Set(pronosAvant.map((p: any) => p.utilisateur_id))
    }
  }
  const actifs = [...aPronostique].filter((id) => actifsAvant === null || actifsAvant.has(id))
  if (actifs.length < 2) return VIDE
  const estActif = new Set(actifs)

  // ----- Profils -----
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo, equipe_favorite')
    .in('id', [...aPronostique])
  const pseudoMap = new Map<string, string>((profiles ?? []).map((p) => [p.id, p.pseudo]))
  const favoriMap = new Map<string, string>(
    (profiles ?? []).filter((p) => p.equipe_favorite).map((p) => [p.id, p.equipe_favorite])
  )
  const pseudo = (id: string) => pseudoMap.get(id) ?? 'Un joueur'

  // ----- Le hasard est figé par semaine et par ligue -----
  const hasard = generateur(graine(`${semaine_id}|${[...membreIds].sort().join(',')}`))
  const tirer = <T,>(liste: T[]): T => liste[Math.floor(hasard() * liste.length)]

  // ----- Scores de la semaine (nombre de bons pronostics) -----
  const matchMap = new Map(matchs.map((m) => [m.id, m]))
  const scores = new Map<string, number>()
  const nbPronos = new Map<string, number>()
  for (const id of actifs) {
    const mes = pronostics.filter((p) => p.utilisateur_id === id)
    nbPronos.set(id, mes.length)
    scores.set(
      id,
      mes.filter((p) => {
        const m = matchMap.get(p.match_id)
        return m && !estMatchNul(m) && p.equipe_choisie === m.equipe_gagnante
      }).length
    )
  }
  const classementActifs = [...scores.entries()].sort((a, b) => b[1] - a[1])
  const meilleur = classementActifs[0][1]
  const pire = classementActifs[classementActifs.length - 1][1]
  const enTete = classementActifs.filter(([, s]) => s === meilleur).map(([id]) => id)
  const enQueue = classementActifs.filter(([, s]) => s === pire).map(([id]) => id)
  const deuxieme = classementActifs.find(([, s]) => s < meilleur)?.[1] ?? null

  // ----- Classement de la ligue avant / après -----
  const totauxAvant = idsAvant.length > 0 ? await classementCumuleParSemaines(supabase, idsAvant, membreIds) : null
  const semaineCourante = await calculerClassementSemaine(supabase, semaine_id)
  const totauxApres = new Map<string, number>(totauxAvant ?? [])
  for (const j of semaineCourante) {
    if (!membreIds.includes(j.utilisateur_id)) continue
    totauxApres.set(j.utilisateur_id, (totauxApres.get(j.utilisateur_id) ?? 0) + j.score_semaine)
  }
  const rangsApres = classerParRang(totauxApres)
  const rangsAvant = totauxAvant ? classerParRang(totauxAvant) : null
  const parRangApres = [...rangsApres.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id)
  const parRangAvant = rangsAvant ? [...rangsAvant.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id) : null
  const actifsParRang = parRangApres.filter((id) => estActif.has(id))

  const candidats: Candidat[] = []
  const ajouter = (id: string, priorite: number, variables: Variables, joueurs: string[] = [], stats: Stat[] = []) => {
    candidats.push({ id, priorite, variables, joueurs, stats })
  }

  // =========== A. Performance de la semaine ===========
  const parfaits = actifs.filter((id) => scores.get(id) === nbMatchs)
  if (parfaits.length > 0) {
    const p = tirer(parfaits)
    ajouter('A01', 100, { p: pseudo(p), n: nbMatchs }, [p], [[`${nbMatchs}/${nbMatchs}`, 'bons pronos']])
  }
  if (enTete.length === 1 && deuxieme !== null && meilleur - deuxieme >= 2) {
    ajouter('A02', 85, { p: pseudo(enTete[0]) }, [enTete[0]], [[`${meilleur}/${nbMatchs}`, 'bons pronos'], [`+${meilleur - (deuxieme ?? 0)}`, 'sur le 2e']])
  }
  if (enTete.length === 1 && deuxieme !== null && meilleur - deuxieme === 1) {
    ajouter('A03', 80, { p: pseudo(enTete[0]), n: 1 }, [enTete[0]], [['+1', "point d'avance"]])
  }
  if (enTete.length === 2 && meilleur > 0) {
    ajouter('A04', 78, { p: pseudo(enTete[0]), p2: pseudo(enTete[1]) }, enTete, [[`${meilleur}/${nbMatchs}`, 'chacun']])
  }
  if (actifs.length >= 3 && enQueue.length === 1 && pire < nbMatchs) {
    ajouter('A05', 65, { p: pseudo(enQueue[0]) }, [enQueue[0]], [[`${pire}/${nbMatchs}`, 'score de la semaine']])
  }
  if (actifs.length >= 4) {
    const valeurs = classementActifs.map(([, s]) => s)
    const mediane = valeurs[Math.floor(valeurs.length / 2)]
    if (mediane < meilleur && mediane > pire) {
      const p = tirer(actifs.filter((id) => scores.get(id) === mediane))
      ajouter('A07', 40, { p: pseudo(p) }, [p])
    }
  }

  // =========== B. Les matchs ===========
  const nomsMatch = (m: any) => {
    const gagnante = m.equipe_gagnante as string
    const perdante = gagnante === m.equipe_a ? m.equipe_b : m.equipe_a
    return { gagnante, perdante, eq: nomEquipe(gagnante), adv: nomEquipe(perdante) }
  }
  const infosMatchs = matchsNonNuls.map((m) => {
    // Pour les histoires de match, tous les joueurs qui ont pronostiqué comptent (pas seulement les « actifs »)
    const pronos = pronostics.filter((p) => p.match_id === m.id && aPronostique.has(p.utilisateur_id))
    const bons = pronos.filter((p) => p.equipe_choisie === m.equipe_gagnante)
    const mauvais = pronos.filter((p) => p.equipe_choisie !== m.equipe_gagnante)
    return { m, pronos, bons, mauvais, ...nomsMatch(m) }
  })

  const upset = infosMatchs.find((x) => x.pronos.length > 2 && x.bons.length === 1)
  if (upset) {
    const p = upset.bons[0].utilisateur_id
    ajouter('B01', 95, { p: pseudo(p), eq: upset.eq, adv: upset.adv }, [p])
  }
  const pieges = infosMatchs
    .filter((x) => x.pronos.length >= 3 && x.mauvais.length / x.pronos.length >= 0.7 && x.bons.length > 0)
    .sort((a, b) => b.mauvais.length / b.pronos.length - a.mauvais.length / a.pronos.length)
  if (pieges.length > 0) {
    ajouter('B02', 68, { eq: pieges[0].eq, adv: pieges[0].adv, n: pieges[0].mauvais.length }, [], [[`${pieges[0].mauvais.length} sur ${pieges[0].pronos.length}`, 'se sont plantés']])
  }
  const cadeaux = infosMatchs.filter((x) => x.pronos.length >= 3 && x.mauvais.length === 0)
  if (cadeaux.length > 0) {
    const x = tirer(cadeaux)
    ajouter('B03', 55, { eq: x.eq, adv: x.adv }, [], [[`${x.pronos.length}/${x.pronos.length}`, 'bons pronos']])
  }
  const serres = infosMatchs
    .filter((x) => Math.abs((x.m.score_a ?? 0) - (x.m.score_b ?? 0)) <= 3)
    .sort((a, b) => Math.abs(a.m.score_a - a.m.score_b) - Math.abs(b.m.score_a - b.m.score_b))
  if (serres.length > 0) {
    const x = serres[0]
    ajouter('B04', 62, { eq: x.eq, adv: x.adv, n: Math.abs(x.m.score_a - x.m.score_b) }, [], [[`${Math.abs(x.m.score_a - x.m.score_b)}`, "points d'écart"]])
  }
  const kamikaze = infosMatchs.find((x) => x.pronos.length > 2 && x.mauvais.length === 1)
  if (kamikaze) {
    const p = kamikaze.mauvais[0].utilisateur_id
    ajouter('B06', 70, { p: pseudo(p), eq: kamikaze.eq, adv: kamikaze.adv }, [p])
  }
  const plantes = infosMatchs.filter((x) => x.pronos.length >= 3 && x.bons.length === 0)
  if (plantes.length > 0) {
    ajouter('B07', 66, { eq: plantes[0].eq, adv: plantes[0].adv }, [], [[`0 sur ${plantes[0].pronos.length}`, 'bons pronos']])
  }
  const ecrasements = infosMatchs
    .filter((x) => Math.abs(x.m.score_a - x.m.score_b) >= 30)
    .sort((a, b) => Math.abs(b.m.score_a - b.m.score_b) - Math.abs(a.m.score_a - a.m.score_b))
  if (ecrasements.length > 0) {
    const x = ecrasements[0]
    ajouter('B09', 60, { eq: x.eq, adv: x.adv, n: Math.abs(x.m.score_a - x.m.score_b) }, [], [[`${Math.abs(x.m.score_a - x.m.score_b)}`, "points d'écart"]])
  }

  // =========== L. Grandes ligues : égalités et seuils proportionnels ===========
  const grande = actifs.length >= 15
  // Plusieurs joueurs en tête (3 ou plus) : les articles « un seul joueur » ne peuvent plus se déclencher
  if (enTete.length >= 3 && meilleur > 0) {
    const pTete = tirer(enTete)
    ajouter('L01', 76, { n: enTete.length, score: meilleur, nb: nbMatchs, p: pseudo(pTete) }, [pTete], [[`${meilleur}/${nbMatchs}`, 'chacun']])
  }
  // Plusieurs joueurs au fond (3 ou plus)
  if (enQueue.length >= 3 && pire < nbMatchs) {
    const pFond = tirer(enQueue)
    ajouter('L05', 62, { n: enQueue.length, score: pire, nb: nbMatchs, p: pseudo(pFond) }, [pFond], [[`${pire}/${nbMatchs}`, 'chacun']])
  }
  if (grande) {
    // « Le flair » à l'échelle d'une grande ligue : seuls 2 joueurs ou plus, mais moins de 10 % de la ligue
    const rares = infosMatchs
      .filter((x) => x.pronos.length >= 15 && x.bons.length >= 2 && x.bons.length <= Math.max(2, Math.floor(x.pronos.length * 0.1)))
      .sort((a, b) => a.bons.length / a.pronos.length - b.bons.length / b.pronos.length)
    if (rares.length > 0) {
      const x = rares[0]
      const p = tirer(x.bons).utilisateur_id
      ajouter('L02', 88, { p: pseudo(p), n: x.bons.length, total: x.pronos.length, eq: x.eq, adv: x.adv }, [p])
    }
    // « Kamikaze » à l'échelle d'une grande ligue : seuls quelques joueurs se sont trompés
    const egares = infosMatchs
      .filter((x) => x.pronos.length >= 15 && x.mauvais.length >= 2 && x.mauvais.length <= Math.max(2, Math.floor(x.pronos.length * 0.1)))
      .sort((a, b) => a.mauvais.length / a.pronos.length - b.mauvais.length / b.pronos.length)
    if (egares.length > 0) {
      const x = egares[0]
      const p = tirer(x.mauvais).utilisateur_id
      ajouter('L03', 70, { p: pseudo(p), n: x.mauvais.length, total: x.pronos.length, eq: x.eq, adv: x.adv }, [p])
    }
    // Du meilleur au moins bon
    if (meilleur - pire >= 5) {
      const pHaut = tirer(enTete)
      const pBas = tirer(enQueue)
      ajouter('L04', 58, { p: pseudo(pHaut), p2: pseudo(pBas), ecart: meilleur - pire, max: meilleur, min: pire, nb: nbMatchs }, [pHaut, pBas])
    }
  }

  // =========== C. Classement général ===========
  if (parRangAvant) {
    const deltas = actifs
      .map((id) => ({ id, delta: (rangsApres.get(id) ?? 0) - (rangsAvant!.get(id) ?? rangsApres.get(id) ?? 0) }))
    const chute = [...deltas].sort((a, b) => b.delta - a.delta)[0]
    if (chute && chute.delta >= 2) ajouter('C01', 74, { p: pseudo(chute.id), n: chute.delta }, [chute.id], [[`-${chute.delta}`, 'places dans la ligue'], [`${rangsApres.get(chute.id)}e`, 'au classement de la ligue']])
    const montee = [...deltas].sort((a, b) => a.delta - b.delta)[0]
    if (montee && montee.delta <= -2) ajouter('C02', 75, { p: pseudo(montee.id), n: -montee.delta }, [montee.id], [[`+${-montee.delta}`, 'places dans la ligue'], [`${rangsApres.get(montee.id)}e`, 'au classement de la ligue']])

    const leaderApres = parRangApres[0]
    const leaderAvant = parRangAvant[0]
    if (leaderApres && leaderAvant && estActif.has(leaderApres)) {
      if (leaderApres !== leaderAvant) ajouter('C03', 90, { p: pseudo(leaderApres) }, [leaderApres])
      else ajouter('C04', 45, { p: pseudo(leaderApres) }, [leaderApres])
    }
    if (leaderAvant && estActif.has(leaderAvant) && leaderApres !== leaderAvant) {
      const chuteRang = (rangsApres.get(leaderAvant) ?? 1) - 1
      if (chuteRang >= 3) {
        ajouter('C10', 80, { p: pseudo(leaderAvant), n: chuteRang, rang: rangsApres.get(leaderAvant) ?? '' }, [leaderAvant])
      }
    }
    if (
      parRangAvant.slice(0, 3).join() === parRangApres.slice(0, 3).join() &&
      parRangApres.length >= 3 &&
      parRangApres.slice(0, 2).every((id) => estActif.has(id))
    ) {
      ajouter('C09', 40, { p: pseudo(parRangApres[0]), p2: pseudo(parRangApres[1]) })
    }
  }
  if (parRangApres.length >= 2) {
    const [a, b] = parRangApres
    const ecart = (totauxApres.get(a) ?? 0) - (totauxApres.get(b) ?? 0)
    if (estActif.has(a) && estActif.has(b)) {
      if (ecart === 1) ajouter('C05', 60, { p: pseudo(b), n: 1 }, [b])
      if (ecart <= 2) ajouter('C08', 72, { p: pseudo(a), p2: pseudo(b), n: ecart }, [a, b], [[`${ecart}`, "point(s) d'écart"]])
    }
  }
  // Lanterne rouge : seulement si tous les joueurs actifs ont pronostiqué tous les matchs
  const tousComplets = actifs.every((id) => (nbPronos.get(id) ?? 0) >= matchs.length)
  const dernierDuRang = actifsParRang[actifsParRang.length - 1]
  // Grande ligue : il suffit que le dernier ait lui-même pronostiqué tous les matchs de la semaine
  const dernierComplet = !!dernierDuRang && (nbPronos.get(dernierDuRang) ?? 0) >= matchs.length
  if ((tousComplets || (grande && dernierComplet)) && actifsParRang.length >= 4) {
    const dernier = actifsParRang[actifsParRang.length - 1]
    ajouter('C06', 64, { p: pseudo(dernier) }, [dernier])
  }
  // Underdog : dernier au général, meilleure semaine
  if (enTete.length === 1 && actifsParRang.length > 2 && actifsParRang[actifsParRang.length - 1] === enTete[0]) {
    ajouter('C07', 85, { p: pseudo(enTete[0]) }, [enTete[0]])
  }

  // =========== D. Équipe favorite ===========
  const favorisJoueurs = actifs.filter((id) => favoriMap.has(id))
  const traitres: { id: string; fav: string }[] = []
  const coeurs: { id: string; fav: string }[] = []
  const combles: { id: string; fav: string }[] = []
  for (const x of infosMatchs) {
    for (const p of x.pronos) {
      const fav = favoriMap.get(p.utilisateur_id)
      if (!fav || (fav !== x.m.equipe_a && fav !== x.m.equipe_b)) continue
      const choixFav = p.equipe_choisie === fav
      const favGagne = x.gagnante === fav
      if (!choixFav) traitres.push({ id: p.utilisateur_id, fav: nomEquipe(fav) })
      else if (!favGagne) coeurs.push({ id: p.utilisateur_id, fav: nomEquipe(fav) })
      else combles.push({ id: p.utilisateur_id, fav: nomEquipe(fav) })
    }
  }
  if (traitres.length > 0) {
    const x = tirer(traitres)
    ajouter('D01', 72, { p: pseudo(x.id), fav: x.fav }, [x.id])
  }
  if (coeurs.length > 0) {
    const x = tirer(coeurs)
    ajouter('D02', 70, { p: pseudo(x.id), fav: x.fav }, [x.id])
  }
  if (combles.length > 0) {
    const x = tirer(combles)
    ajouter('D04', 55, { p: pseudo(x.id), fav: x.fav }, [x.id])
  }
  for (const x of infosMatchs) {
    const fansA = favorisJoueurs.filter((id) => favoriMap.get(id) === x.m.equipe_a)
    const fansB = favorisJoueurs.filter((id) => favoriMap.get(id) === x.m.equipe_b)
    if (fansA.length > 0 && fansB.length > 0) {
      const p = tirer(fansA)
      const p2 = tirer(fansB)
      ajouter('D03', 78, { p: pseudo(p), p2: pseudo(p2), fav: nomEquipe(favoriMap.get(p)), eq: x.eq, adv: x.adv }, [p, p2])
      break
    }
  }

  // =========== E. Calendrier NFL ===========
  const dates = matchs.map((m) => dateDecalee(m.coup_envoi))
  const motsJours = dates.map((d) => (d.getUTCMonth() + 1) * 100 + d.getUTCDate())
  const pireJoueur = enQueue.length > 0 ? tirer(enQueue) : tirer(actifs)
  const meilleurJoueur = tirer(enTete)
  const unJoueur = tirer(actifs)
  if (indexSemaine === 0) ajouter('E01', 92, { p: meilleurJoueur ? pseudo(meilleurJoueur) : pseudo(unJoueur) })
  if (motsJours.some((md) => md >= 1029 && md <= 1101)) {
    ajouter('E02', 88, { p: pseudo(meilleurJoueur) }, [meilleurJoueur])
  }
  if (dates.length > 0) {
    const annee = dates[0].getUTCFullYear()
    const jourThanks = quatriemeJeudiNovembre(annee)
    if (dates.some((d) => d.getUTCMonth() === 10 && d.getUTCDate() === jourThanks)) {
      ajouter('E03', 88, { p: pseudo(unJoueur) })
    }
  }
  if (motsJours.some((md) => md >= 1224 && md <= 1226)) {
    ajouter('E04', 88, { p: pseudo(pireJoueur) }, [pireJoueur])
  }
  if (indexSemaine === 8) ajouter('E05', 60, { p: pseudo(parRangApres.find((id) => estActif.has(id)) ?? unJoueur) })
  if (indexSemaine === 17) ajouter('E06', 70, { p: pseudo(unJoueur) })

  // =========== F. La ligue entière ===========
  const moyenne = classementActifs.reduce((s, [, v]) => s + v, 0) / classementActifs.length / nbMatchs
  if (actifs.length >= 3 && moyenne < 0.4) ajouter('F01', 70, {}, [], [[`${Math.round(moyenne * 100)} %`, 'de réussite moyenne']])
  if (actifs.length >= 3 && moyenne > 0.8) ajouter('F02', 60, {}, [], [[`${Math.round(moyenne * 100)} %`, 'de réussite moyenne']])
  if (actifs.length >= 3) {
    const [a, b, c] = classementActifs
    if (a[1] - c[1] <= 1 && a[1] > 0) {
      ajouter('F03', 66, { p: pseudo(a[0]), p2: pseudo(b[0]) }, [a[0], b[0]])
    }
  }
  const incomplets = actifs.filter((id) => (nbPronos.get(id) ?? 0) < matchs.length)
  if (incomplets.length > 0) ajouter('F04', 50, { n: incomplets.length }, [], [[`${incomplets.length}`, 'joueur(s) concerné(s)']])

  // =========== G. Rubriques ===========
  if (pire < meilleur && actifs.length >= 3) {
    ajouter('G03', 50, { p: pseudo(pireJoueur) }, [pireJoueur])
  }

  // ---------- Récupération des phrases ----------
  let banque: Phrase[] = []
  try {
    const { data } = await supabase
      .from('journal_phrases')
      .select('id, declencheur_id, ton, rarete, texte')
      .eq('actif', true)
      .range(0, 4999)
    banque = (data ?? []) as Phrase[]
  } catch {
    banque = []
  }
  const phrasesDe = (idDeclencheur: string): Phrase[] => {
    const trouvees = banque.filter((p) => p.declencheur_id === idDeclencheur)
    if (trouvees.length > 0 || banque.length > 0) return trouvees
    return (PHRASES_SECOURS[idDeclencheur] ?? []).map((texte, i) => ({
      id: `${idDeclencheur}-S${i}`,
      declencheur_id: idDeclencheur,
      ton: 'piquant',
      rarete: 'commune',
      texte,
    }))
  }

  // ---------- Choix des 4 articles : on varie les familles et les joueurs ----------
  const notes = candidats.map((c) => ({ c, note: c.priorite + hasard() * 15 })).sort((a, b) => b.note - a.note)
  const parFamille = new Map<string, number>()
  const parJoueur = new Map<string, number>()
  const articles: Article[] = []
  const creerArticle = (c: Candidat, fixe = false): Article | null => {
    const texte = choisirPhrase(phrasesDe(c.id), c.variables, hasard)
    if (!texte) return null
    const meta = META[c.id]
    return {
      id: c.id,
      etiquette: meta?.etiquette ?? 'Journal',
      couleur: meta?.couleur ?? '#9DB0D6',
      titre: remplir(meta?.titre ?? '', c.variables) ?? meta?.etiquette ?? '',
      stats: c.stats,
      texte,
      fixe,
      explication: meta?.explication,
    }
  }
  for (const { c } of notes) {
    if (articles.length >= 4) break
    const famille = c.id[0]
    if ((parFamille.get(famille) ?? 0) >= 2) continue
    if (c.joueurs.some((j) => (parJoueur.get(j) ?? 0) >= 2)) continue
    const article = creerArticle(c)
    if (!article) continue
    articles.push(article)
    parFamille.set(famille, (parFamille.get(famille) ?? 0) + 1)
    c.joueurs.forEach((j) => parJoueur.set(j, (parJoueur.get(j) ?? 0) + 1))
  }
  if (articles.length < 2) {
    const calme = creerArticle({ id: 'F08', priorite: 0, variables: {}, joueurs: [], stats: [] })
    if (calme) articles.push(calme)
  }

  // ---------- Rubrique fixe : la phrase de la semaine ----------
  const fixe = creerArticle({ id: 'G01', priorite: 0, variables: { p: pseudo(unJoueur) }, joueurs: [], stats: [] }, true)
  if (fixe) articles.push(fixe)
  const dernierMatch = matchs.reduce((max, m) => (m.coup_envoi > max ? m.coup_envoi : max), '')
  return {
    semaine: semaineActuelle?.nom ?? '',
    articles,
    enVedette: journalEnVedette(dernierMatch),
    diagnostic: [
      `Joueurs ayant pronostiqué cette semaine : ${aPronostique.size} · actifs (classements) : ${actifs.length}`,
      `Articles possibles : ${candidats.map((c) => c.id).join(', ') || 'aucun'}`,
      `Articles retenus : ${articles.map((a) => a.id).join(', ')}`,
    ],
    ...(() => { const t = nomDuTribunal(semaineActuelle?.nom ?? '', dernierMatch); return { nomTribunal: t.nom, exceptionnel: t.exceptionnel } })(),
  }
}

/*
 * Le journal est mis en avant le mardi et le mercredi (heure de Paris), à condition que
 * la semaine de matchs soit récente (pas en pleine intersaison). Le reste du temps,
 * il reste consultable via un petit bouton « Revoir le journal du mardi précédent ».
 */
function journalEnVedette(dernierMatch: string, maintenant: Date = new Date()): boolean {
  if (!dernierMatch) return false
  const depuisOuverture = maintenant.getTime() - (new Date(dernierMatch).getTime() + DELAI_TRIBUNAL_MS)
  return depuisOuverture >= 0 && depuisOuverture < DUREE_VEDETTE_MS
}

/*
 * Dernière semaine dont TOUS les matchs sont terminés.
 * La base contient toute la saison à l'avance (semaines futures comprises) : on parcourt donc
 * toutes les semaines, de la plus récente à la plus ancienne, et on retient la première
 * qui a des matchs et dont tous les matchs sont terminés.
 * Évite aussi que le journal disparaisse dès le jeudi, quand le premier match de la semaine suivante se termine.
 */
export async function derniereSemaineTerminee(supabase: SupabaseClient): Promise<number | null> {
  const { data: semaines } = await supabase
    .from('semaines')
    .select('id')
    .order('id', { ascending: false })
    .range(0, 99)
  const ids = (semaines ?? []).map((s) => s.id)
  if (ids.length === 0) return null
  const { data: matchs } = await supabase
    .from('matchs')
    .select('semaine_id, statut')
    .in('semaine_id', ids)
    .range(0, 4999)
  for (const id of ids) {
    const siens = (matchs ?? []).filter((m) => m.semaine_id === id)
    if (siens.length > 0 && siens.every((m) => m.statut === 'termine')) return id
  }
  return null
}