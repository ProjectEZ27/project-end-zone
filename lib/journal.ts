import { SupabaseClient } from '@supabase/supabase-js'
import { NOMS_EQUIPES } from './teamBadge'

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

const PHRASES_PIRE_SCORE = [
  "{pseudo} a connu une semaine à oublier rapidement.",
  "Semaine compliquée pour {pseudo} — on efface et on recommence.",
  "{pseudo} signe le score le plus bas de la semaine. Ça arrive à tout le monde.",
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

export async function genererJournalSemaine(
  supabase: SupabaseClient,
  semaine_id: number,
  membreIds: string[]
): Promise<string[]> {
  const phrases: string[] = []

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

  // 1. Perfect week
  const perfects = scoresArray.filter(([, score]) => score === nombreMatchs)
  if (perfects.length > 0) {
    const [userId] = perfects[0]
    phrases.push(piocher(PHRASES_PERFECT_WEEK, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
  }

  // 2. Upset trouvé par un seul joueur
  // Pour chaque match, on regarde si une équipe gagnante était minoritaire dans les pronostics, et si un seul joueur l'avait trouvée
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

  // 3. Pire score de la semaine (seulement si on n'a pas déjà 2 phrases)
  if (phrases.length < 2 && scoresArray.length > 0) {
    const pireScore = Math.min(...scoresArray.map(([, s]) => s))
    const pireJoueurs = scoresArray.filter(([, s]) => s === pireScore)
    if (pireJoueurs.length === 1 && pireScore < nombreMatchs) {
      const [userId] = pireJoueurs[0]
      phrases.push(piocher(PHRASES_PIRE_SCORE, { pseudo: pseudoMap.get(userId) ?? 'Un joueur' }))
    }
  }

  return phrases.slice(0, 2) // maximum 2 phrases par semaine
}