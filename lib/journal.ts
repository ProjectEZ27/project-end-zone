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
type Candidat = { id: string; priorite: number; variables: Variables; joueurs: string[] }

// Phrases de secours si la table journal_phrases est vide ou inaccessible
const PHRASES_SECOURS: Record<string, string[]> = {
  A01: ['{p} a fait un sans-faute cette semaine. Perfect week !'],
  A02: ['{p} a écrasé la concurrence cette semaine, sans discussion possible.'],
  A04: ['{p} et {p2} finissent à égalité parfaite cette semaine.'],
  A05: ['{p} signe le score le plus bas de la semaine. Ça arrive à tout le monde.'],
  B01: ['{p} a été le seul à voir venir la victoire surprise de {eq} face à {adv}. Respect.'],
  C01: ['{p} dégringole au classement cette semaine.'],
  C07: ['{p}, dernier au classement général, signe pourtant la meilleure semaine. Le pur underdog.'],
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

function remplir(texte: string, variables: Variables): string | null {
  let resultat = texte
  for (const [cle, valeur] of Object.entries(variables)) {
    resultat = resultat.split(`{${cle}}`).join(String(valeur))
  }
  // Une variable manquante : on n'utilise pas cette phrase
  return /\{\w+\}/.test(resultat) ? null : resultat
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
): Promise<string[]> {
  const { data: matchs } = await supabase.from('matchs').select('*').eq('semaine_id', semaine_id)
  if (!matchs || matchs.length === 0) return []

  // Pas de journal tant que la semaine n'est pas totalement terminée
  if (matchs.some((m) => m.statut !== 'termine')) return []

  const matchsNonNuls = matchs.filter((m) => !estMatchNul(m) && m.equipe_gagnante)
  const nbMatchs = matchsNonNuls.length
  if (nbMatchs === 0) return []

  const matchIds = matchs.map((m) => m.id)
  const { data: pronosBruts } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchIds)
    .in('utilisateur_id', membreIds)
    .range(0, 9999)
  const pronostics = pronosBruts ?? []
  if (pronostics.length === 0) return []

  // ----- Semaine, saison, semaines précédentes -----
  const { data: semaineActuelle } = await supabase
    .from('semaines')
    .select('id, saison_id')
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
      const { data: pronosAvant } = await supabase
        .from('pronostics')
        .select('utilisateur_id')
        .in('match_id', idsMatchsAvant)
        .in('utilisateur_id', [...aPronostique])
        .range(0, 9999)
      actifsAvant = new Set((pronosAvant ?? []).map((p) => p.utilisateur_id))
    }
  }
  const actifs = [...aPronostique].filter((id) => actifsAvant === null || actifsAvant.has(id))
  if (actifs.length < 2) return []
  const estActif = new Set(actifs)

  // ----- Profils -----
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo, equipe_favorite')
    .in('id', actifs)
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

  // ----- Classement général avant / après -----
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
  const ajouter = (id: string, priorite: number, variables: Variables, joueurs: string[] = []) => {
    candidats.push({ id, priorite, variables, joueurs })
  }

  // =========== A. Performance de la semaine ===========
  const parfaits = actifs.filter((id) => scores.get(id) === nbMatchs)
  if (parfaits.length > 0) {
    const p = tirer(parfaits)
    ajouter('A01', 100, { p: pseudo(p), n: nbMatchs }, [p])
  }
  if (enTete.length === 1 && deuxieme !== null && meilleur - deuxieme >= 2) {
    ajouter('A02', 85, { p: pseudo(enTete[0]) }, [enTete[0]])
  }
  if (enTete.length === 1 && deuxieme !== null && meilleur - deuxieme === 1) {
    ajouter('A03', 80, { p: pseudo(enTete[0]), n: 1 }, [enTete[0]])
  }
  if (enTete.length === 2 && meilleur > 0) {
    ajouter('A04', 78, { p: pseudo(enTete[0]), p2: pseudo(enTete[1]) }, enTete)
  }
  if (actifs.length >= 3 && enQueue.length === 1 && pire < nbMatchs) {
    ajouter('A05', 65, { p: pseudo(enQueue[0]) }, [enQueue[0]])
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
    const pronos = pronostics.filter((p) => p.match_id === m.id && estActif.has(p.utilisateur_id))
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
    ajouter('B02', 68, { eq: pieges[0].eq, adv: pieges[0].adv, n: pieges[0].mauvais.length })
  }
  const cadeaux = infosMatchs.filter((x) => x.pronos.length >= 3 && x.mauvais.length === 0)
  if (cadeaux.length > 0) {
    const x = tirer(cadeaux)
    ajouter('B03', 55, { eq: x.eq, adv: x.adv })
  }
  const serres = infosMatchs
    .filter((x) => Math.abs((x.m.score_a ?? 0) - (x.m.score_b ?? 0)) <= 3)
    .sort((a, b) => Math.abs(a.m.score_a - a.m.score_b) - Math.abs(b.m.score_a - b.m.score_b))
  if (serres.length > 0) {
    const x = serres[0]
    ajouter('B04', 62, { eq: x.eq, adv: x.adv, n: Math.abs(x.m.score_a - x.m.score_b) })
  }
  const kamikaze = infosMatchs.find((x) => x.pronos.length > 2 && x.mauvais.length === 1)
  if (kamikaze) {
    const p = kamikaze.mauvais[0].utilisateur_id
    ajouter('B06', 70, { p: pseudo(p), eq: kamikaze.eq, adv: kamikaze.adv }, [p])
  }
  const plantes = infosMatchs.filter((x) => x.pronos.length >= 3 && x.bons.length === 0)
  if (plantes.length > 0) {
    ajouter('B07', 66, { eq: plantes[0].eq, adv: plantes[0].adv })
  }
  const ecrasements = infosMatchs
    .filter((x) => Math.abs(x.m.score_a - x.m.score_b) >= 30)
    .sort((a, b) => Math.abs(b.m.score_a - b.m.score_b) - Math.abs(a.m.score_a - a.m.score_b))
  if (ecrasements.length > 0) {
    const x = ecrasements[0]
    ajouter('B09', 60, { eq: x.eq, adv: x.adv, n: Math.abs(x.m.score_a - x.m.score_b) })
  }

  // =========== C. Classement général ===========
  if (parRangAvant) {
    const deltas = actifs
      .map((id) => ({ id, delta: (rangsApres.get(id) ?? 0) - (rangsAvant!.get(id) ?? rangsApres.get(id) ?? 0) }))
    const chute = [...deltas].sort((a, b) => b.delta - a.delta)[0]
    if (chute && chute.delta >= 2) ajouter('C01', 74, { p: pseudo(chute.id), n: chute.delta }, [chute.id])
    const montee = [...deltas].sort((a, b) => a.delta - b.delta)[0]
    if (montee && montee.delta <= -2) ajouter('C02', 75, { p: pseudo(montee.id), n: -montee.delta }, [montee.id])

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
      if (ecart <= 2) ajouter('C08', 72, { p: pseudo(a), p2: pseudo(b), n: ecart }, [a, b])
    }
  }
  // Lanterne rouge : seulement si tous les joueurs actifs ont pronostiqué tous les matchs
  const tousComplets = actifs.every((id) => (nbPronos.get(id) ?? 0) >= matchs.length)
  if (tousComplets && actifsParRang.length >= 4) {
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
  if (actifs.length >= 3 && moyenne < 0.4) ajouter('F01', 70, {})
  if (actifs.length >= 3 && moyenne > 0.8) ajouter('F02', 60, {})
  if (actifs.length >= 3) {
    const [a, b, c] = classementActifs
    if (a[1] - c[1] <= 1 && a[1] > 0) {
      ajouter('F03', 66, { p: pseudo(a[0]), p2: pseudo(b[0]) }, [a[0], b[0]])
    }
  }
  const incomplets = actifs.filter((id) => (nbPronos.get(id) ?? 0) < matchs.length)
  if (incomplets.length > 0) ajouter('F04', 50, { n: incomplets.length })

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
  const articles: string[] = []
  for (const { c } of notes) {
    if (articles.length >= 4) break
    const famille = c.id[0]
    if ((parFamille.get(famille) ?? 0) >= 2) continue
    if (c.joueurs.some((j) => (parJoueur.get(j) ?? 0) >= 2)) continue
    const texte = choisirPhrase(phrasesDe(c.id), c.variables, hasard)
    if (!texte) continue
    articles.push(texte)
    parFamille.set(famille, (parFamille.get(famille) ?? 0) + 1)
    c.joueurs.forEach((j) => parJoueur.set(j, (parJoueur.get(j) ?? 0) + 1))
  }
  if (articles.length < 2) {
    const texte = choisirPhrase(phrasesDe('F08'), {}, hasard)
    if (texte) articles.push(texte)
  }

  // ---------- Rubrique fixe : la phrase de la semaine ----------
  const fixe = choisirPhrase(phrasesDe('G01'), { p: pseudo(unJoueur) }, hasard)
  return fixe ? [...articles, fixe] : articles
}