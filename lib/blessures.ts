// Liste des blessures du mode expert, calculée à partir du fichier ouvert nflverse (licence CC-BY 4.0).
// Données : nflverse — https://github.com/nflverse

export type StatutBlesse = 'out' | 'doubtful' | 'questionable' | 'retour'
export type TypeBlesse = 'nouveau' | 'reste' | 'retour'

export type JoueurBlesse = {
  nom: string
  poste: string
  blessure: string
  statut: StatutBlesse
  entrainement: string
  type: TypeBlesse
}

export type LigneBlessures = {
  equipe: string
  saison: number
  semaine: number
  joueurs: JoueurBlesse[]
}

const STATUTS: Record<string, StatutBlesse> = {
  Out: 'out',
  Doubtful: 'doubtful',
  Questionable: 'questionable',
}
const ORDRE: Record<StatutBlesse, number> = { out: 0, doubtful: 1, questionable: 2, retour: 3 }

const ENTRAINEMENT: Record<string, string> = {
  'Did Not Participate In Practice': "N'a pas participé à l'entraînement",
  'Limited Participation in Practice': 'Entraînement limité',
  'Full Participation in Practice': 'Entraînement complet',
}

const BLESSURES: Record<string, string> = {
  knee: 'Genou', ankle: 'Cheville', hamstring: 'Ischio-jambiers', shoulder: 'Épaule', back: 'Dos',
  groin: 'Aine', calf: 'Mollet', quadricep: 'Quadriceps', quadriceps: 'Quadriceps', foot: 'Pied',
  hip: 'Hanche', concussion: 'Commotion', illness: 'Maladie', achilles: "Tendon d'Achille",
  thigh: 'Cuisse', wrist: 'Poignet', hand: 'Main', neck: 'Cou', rib: 'Côtes', ribs: 'Côtes',
  elbow: 'Coude', toe: 'Orteil', chest: 'Poitrine', finger: 'Doigt', thumb: 'Pouce', eye: 'Œil',
  abdomen: 'Abdomen', pectoral: 'Pectoral', shin: 'Tibia', fibula: 'Péroné', tibia: 'Tibia',
  forearm: 'Avant-bras', biceps: 'Biceps', triceps: 'Triceps', glute: 'Fessier', lower: 'Bas du corps',
  hips: 'Hanche', head: 'Tête', knees: 'Genoux', ankles: 'Chevilles', 'rest': 'Repos',
}

function traduireBlessure(texte: string): string {
  if (!texte) return 'Non précisée'
  return texte
    .split(/\s*[,/]\s*/)
    .map((m) => BLESSURES[m.trim().toLowerCase()] ?? m.trim())
    .join(' / ')
}

function lireCsv(texte: string): Record<string, string>[] {
  const lignes: string[][] = []
  let champ = ''
  let ligne: string[] = []
  let guillemets = false
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i]
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++ }
      else if (c === '"') guillemets = false
      else champ += c
    } else if (c === '"') guillemets = true
    else if (c === ',') { ligne.push(champ); champ = '' }
    else if (c === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = '' }
    else if (c !== '\r') champ += c
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne) }
  const entetes = lignes[0] ?? []
  return lignes.slice(1).filter((l) => l.length === entetes.length).map((l) => {
    const o: Record<string, string> = {}
    entetes.forEach((e, i) => { o[e] = l[i] })
    return o
  })
}

type Ligne = Record<string, string>

// Une blessure « non liée à une blessure » (raison personnelle, repos) n'est pas affichée
function estVraieBlessure(l: Ligne): boolean {
  const texte = `${l.report_primary_injury} ${l.practice_primary_injury}`
  return !/not injury related/i.test(texte)
}

export function calculerBlessures(csv: string, saison: number): LigneBlessures[] {
  const lignes = lireCsv(csv).filter((l) => l.season === String(saison) && l.team && l.week)
  const parEquipe = new Map<string, Map<number, Ligne[]>>()
  for (const l of lignes) {
    const sem = parseInt(l.week, 10)
    if (isNaN(sem)) continue
    if (!parEquipe.has(l.team)) parEquipe.set(l.team, new Map())
    const semaines = parEquipe.get(l.team)!
    if (!semaines.has(sem)) semaines.set(sem, [])
    semaines.get(sem)!.push(l)
  }

  const resultat: LigneBlessures[] = []
  for (const [equipe, semaines] of parEquipe) {
    const nums = [...semaines.keys()].sort((a, b) => a - b)
    const courante = nums[nums.length - 1]
    const precedente = nums.length > 1 ? nums[nums.length - 2] : null
    const lignesCourantes = semaines.get(courante)!
    const lignesPrecedentes = precedente != null ? semaines.get(precedente)! : []

    const blessesAvant = new Map<string, Ligne>()
    for (const l of lignesPrecedentes) {
      if (STATUTS[l.report_status] && estVraieBlessure(l)) blessesAvant.set(l.gsis_id, l)
    }

    const joueurs: JoueurBlesse[] = []
    const dejaVus = new Set<string>()
    for (const l of lignesCourantes) {
      if (!estVraieBlessure(l) || dejaVus.has(l.gsis_id)) continue
      const entrainement = ENTRAINEMENT[l.practice_status] ?? ''
      const blessure = traduireBlessure(l.report_primary_injury || l.practice_primary_injury)
      const statut = STATUTS[l.report_status]
      if (statut) {
        dejaVus.add(l.gsis_id)
        joueurs.push({
          nom: l.full_name,
          poste: l.position,
          blessure,
          statut,
          entrainement,
          type: blessesAvant.has(l.gsis_id) ? 'reste' : 'nouveau',
        })
      } else if (blessesAvant.has(l.gsis_id)) {
        // Était sur la liste la semaine d'avant, n'a plus de statut cette semaine : il revient
        dejaVus.add(l.gsis_id)
        const avant = blessesAvant.get(l.gsis_id)!
        joueurs.push({
          nom: l.full_name,
          poste: l.position,
          blessure: traduireBlessure(avant.report_primary_injury || avant.practice_primary_injury),
          statut: 'retour',
          entrainement,
          type: 'retour',
        })
      }
    }
    joueurs.sort((a, b) => ORDRE[a.statut] - ORDRE[b.statut] || a.nom.localeCompare(b.nom))
    resultat.push({ equipe, saison, semaine: courante, joueurs })
  }
  return resultat.sort((a, b) => a.equipe.localeCompare(b.equipe))
}

export function urlBlessuresNflverse(saison: number) {
  return `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_${saison}.csv`
}