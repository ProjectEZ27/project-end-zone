import { SupabaseClient } from '@supabase/supabase-js'
import { NOMS_EQUIPES } from './teamBadge'
import { calculerClassementSemaine } from './scoring'

const PHRASES_PERFECT_WEEK = [
  "{pseudo} a fait un sans-faute cette semaine. Perfect week !",
  "Aucun match raté pour {pseudo} — la classe absolue cette semaine.",
  "{pseudo} a tout bon. Rien à ajouter.",
]

const PHRASES_UPSET = [
  "{pseudo} a été le seul à voir venir la victoire surprise de {equipeGagnante} face à {equipeAdverse}. Respect.",
  "Pendant que tout le monde se trompait sur {equipeGagnante} - {equipeAdverse}, {pseudo} avait le bon pronostic.",
  "{pseudo} a flairé la surprise du match {equipeGagnante} - {equipeAdverse}, seul contre tous.",
]

const PHRASES_BLOWOUT = [
  "{pseudo} a fait un vrai blowout cette semaine, loin devant tout le monde.",
  "Personne n'a suivi le rythme de {pseudo} cette semaine — écart énorme.",
  "{pseudo} a écrasé la concurrence cette semaine, sans discussion possible.",
]

const PHRASES_UNDERDOG = [
  "{pseudo}, dernier au classement général, signe pourtant la meilleure semaine. Le pur underdog.",
  "Personne ne l'attendait, et pourtant {pseudo} termine en tête cette semaine.",
  "{pseudo} rappelle à tout le monde qu'il ne faut jamais l'enterrer trop vite.",
]

const PHRASES_SEMAINE_RATEE = [
  "Semaine sans surprise pour la ligue... sauf pour {pseudo}, qui s'est planté sur du pourtant facile.",
  "{pseudo} a réussi l'exploit de se tromper sur une semaine où tout le monde avait juste.",
  "Pendant que tout le monde cochait les favoris, {pseudo} a pris l'option surprise... et a perdu.",
]

const PHRASES_PIRE_SCORE = [
  "{pseudo} a connu une semaine à oublier rapidement.",
  "Semaine compliquée pour {pseudo} — on efface et on recommence.",
  "{pseudo} signe le score le plus bas de la semaine. Ça arrive à tout le monde.",
]

const PHRASES_EGALITE = [
  "{pseudo} et {pseudo2} finissent à égalité parfaite cette semaine.",
  "Impossible de départager {pseudo} et {pseudo2} cette semaine — même score au point près.",
  "{pseudo} et {pseudo2} ont fait exactement le même parcours cette semaine.",
]

const PHRASES_CHUTE = [
  "{pseudo} dégringole au classement cette semaine.",
  "Grosse chute au classement pour {pseudo} — la remontada commence quand ?",
  "{pseudo} recule le plus au classement général cette semaine.",
]

function piocher(phrases: string[], remplacements: Record<string, string>): string {
  const phrase = phrases[Math.floor(Math.random() * phrases.length)]
  return Object.entries(remplacements).reduce(
    (acc, [cle, valeur]) => acc.split(`{${cle}}`).join(valeur),
    phrase
  )
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
      totaux.set(
        joueur.utilisateur_id,
        (totaux.get(joueur.utilisateur_id) ?? 0) + joueur.score_semaine
      )
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

export async function genererJournalSemaine(
  supabase: SupabaseClient,
  semaine_id: number,
  membreIds: string[]
): Promise<string[]> {
  const phrases: string[] = []
  const phrasesChutes: string[] = []

  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .eq('semaine_id', semaine_id)

  if (!matchs || matchs.length === 0) return phrases

  const matchsTermines = matchs.filter((m) => m.statut === 'termine')
  if (matchsTermines.length !== matchs.length) {
    // La semaine n'est pas totalement terminée, pas de journal pour l'instant
    return phrases
  }

  const matchIds = matchs.map((m) => m.id)

  const { data: pronosticsBruts } = await supabase
    .from('pronostics')
    .select('*')
    .in('match_id', matchIds)
    .in('utilisateur_id', membreIds)

  const pronostics = pronosticsBruts ?? []
  if (pronostics.length === 0) return phrases

  const userIds = [...new Set(pronostics.map((p) => p.utilisateur_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', userIds)

  const pseudoMap = new Map((profiles ?? []).map((p) => [p.id, p.pseudo]))
  const matchMap = new Map(matchs.map((m) => [m.id, m]))

  // Score de chaque joueur sur cette semaine
  const scoresJoueurs = new Map<string, number>()
  for (const userId of userIds) {
    const mesPronos = pronostics.filter((p) => p.utilisateur_id === userId)
    const corrects = mesPronos.filter((p) => {
      const match = matchMap.get(p.match_id)
      return match && p.equipe_choisie === match.equipe_gagnante
    }).length
    scoresJoueurs.set(userId, corrects)
  }

  const nombreMatchs = matchs.length
  const scoresArray = [...scoresJoueurs.entries()]
  const scoresTries = [...scoresArray].sort((a, b) => b[1] - a[1])
  const meilleurScore = scoresTries[0]?.[1] ?? 0
  const meilleurScoreJoueurs = scoresArray.filter(([, s]) => s === meilleurScore)

  // 1. Perfect week
  const perfects = scoresArray.filter(([, score]) => score === nombreMatchs)
  if (perfects.length > 0) {
    const [userId] = perfects[0]
    phrases.push(piocher(PHRASES_PERFECT_WEEK, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
  }

  // 2. Upset trouvé par un seul joueur
  for (const match of matchsTermines) {
    const pronosCeMatch = pronostics.filter((p) => p.match_id === match.id)
    const bonsPronos = pronosCeMatch.filter((p) => p.equipe_choisie === match.equipe_gagnante)
    const totalPronos = pronosCeMatch.length
    if (bonsPronos.length === 1 && totalPronos > 2) {
      const userId = bonsPronos[0].utilisateur_id
      const equipeGagnante = NOMS_EQUIPES[match.equipe_gagnante] ?? match.equipe_gagnante
      const equipeAdverse = match.equipe_gagnante === match.equipe_a
        ? (NOMS_EQUIPES[match.equipe_b] ?? match.equipe_b)
        : (NOMS_EQUIPES[match.equipe_a] ?? match.equipe_a)
      phrases.push(piocher(PHRASES_UPSET, {
        pseudo: pseudoMap.get(userId) ?? 'Un joueur',
        equipeGagnante,
        equipeAdverse,
      }))
      break // un seul upset mis en avant par semaine
    }
  }

  // 3. Blowout : un seul joueur en tête, avec au moins 2 bons pronostics d'avance sur le 2e
  if (
    meilleurScoreJoueurs.length === 1 &&
    scoresTries.length > 1 &&
    meilleurScore - scoresTries[1][1] >= 2
  ) {
    const [userId] = meilleurScoreJoueurs[0]
    phrases.push(piocher(PHRASES_BLOWOUT, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
  }

  // Classement cumulé de la saison, nécessaire pour "underdog" et "chutes"
  const { data: semaineActuelle } = await supabase
    .from('semaines')
    .select('id, saison_id')
    .eq('id', semaine_id)
    .single()

  let rangsAvant: Map<string, number> | null = null
  let rangsApres: Map<string, number> | null = null

  if (semaineActuelle) {
    const { data: toutesLesSemaines } = await supabase
      .from('semaines')
      .select('id')
      .eq('saison_id', semaineActuelle.saison_id)
      .order('id', { ascending: true })

    const idsOrdonnes = (toutesLesSemaines ?? []).map((s) => s.id)
    const indexActuel = idsOrdonnes.indexOf(semaine_id)

    if (indexActuel > 0) {
      const idsAvant = idsOrdonnes.slice(0, indexActuel)
      const idsJusquIci = idsOrdonnes.slice(0, indexActuel + 1)

      const totauxAvant = await classementCumuleParSemaines(supabase, idsAvant, membreIds)
      const totauxApres = await classementCumuleParSemaines(supabase, idsJusquIci, membreIds)
      rangsAvant = classerParRang(totauxAvant)
      rangsApres = classerParRang(totauxApres)
    }
  }

  // 4. Underdog du classement : dernier du classement général, mais meilleur score de la semaine
  if (rangsApres && rangsApres.size > 2 && meilleurScoreJoueurs.length === 1) {
    const dernierRang = Math.max(...rangsApres.values())
    const [userId] = meilleurScoreJoueurs[0]
    if (rangsApres.get(userId) === dernierRang) {
      phrases.push(piocher(PHRASES_UNDERDOG, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
    }
  }

  // 5. Semaine facile ratée : tout le monde a trouvé la bonne équipe sauf un seul joueur
  for (const match of matchsTermines) {
    const pronosCeMatch = pronostics.filter((p) => p.match_id === match.id)
    const mauvaisPronos = pronosCeMatch.filter((p) => p.equipe_choisie !== match.equipe_gagnante)
    if (mauvaisPronos.length === 1 && pronosCeMatch.length > 2) {
      const userId = mauvaisPronos[0].utilisateur_id
      phrases.push(piocher(PHRASES_SEMAINE_RATEE, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
      break
    }
  }

  // 6. Pire score de la semaine
  if (scoresArray.length > 0) {
    const pireScore = Math.min(...scoresArray.map(([, s]) => s))
    const pireJoueurs = scoresArray.filter(([, s]) => s === pireScore)
    if (pireJoueurs.length === 1 && pireScore < nombreMatchs) {
      const [userId] = pireJoueurs[0]
      phrases.push(piocher(PHRASES_PIRE_SCORE, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
    }
  }

  // 7. Égalité parfaite : exactement deux joueurs à égalité sur le meilleur score
  if (meilleurScoreJoueurs.length === 2 && meilleurScore > 0) {
    const [id1] = meilleurScoreJoueurs[0]
    const [id2] = meilleurScoreJoueurs[1]
    phrases.push(piocher(PHRASES_EGALITE, {
      pseudo: pseudoMap.get(id1) ?? 'Un joueur',
      pseudo2: pseudoMap.get(id2) ?? 'Un autre joueur',
    }))
  }

  // Bloc indépendant "chutes/remontadas" : jusqu'à 2 plus grosses chutes de classement
  if (rangsAvant && rangsApres) {
    const deltas: [string, number][] = []
    for (const [userId, rangApres] of rangsApres) {
      const rangAvant = rangsAvant.get(userId)
      if (rangAvant == null) continue
      const delta = rangApres - rangAvant
      if (delta > 0) deltas.push([userId, delta])
    }
    deltas.sort((a, b) => b[1] - a[1])
    for (const [userId] of deltas.slice(0, 2)) {
      phrasesChutes.push(piocher(PHRASES_CHUTE, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
    }
  }

  return [...phrases.slice(0, 2), ...phrasesChutes.slice(0, 2)]
}