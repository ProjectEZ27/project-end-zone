// Calcul des statistiques du mode expert à partir des fichiers ouverts nflverse (licence CC-BY 4.0).
// Données : nflverse — https://github.com/nflverse

export type LigneStats = {
  equipe: string
  saison: number
  derniere_semaine: number
  valeurs: Record<string, number>
  rangs: Record<string, number>
}

// Pour chaque mesure : true = plus la valeur est haute, meilleure est l'équipe
const SENS: Record<string, boolean> = {
  passe_att: true, // efficacité des passes de l'attaque (EPA par jeu de passe)
  course_att: true, // yards par course
  passe_def: false, // efficacité des passes concédée (plus bas = meilleure défense)
  course_def: false, // yards par course concédés
  pression_inf: true, // sacks + coups sur le QB infligés par match
  pression_sub: false, // sacks + coups sur le QB subis par match (plus bas = meilleure protection)
  forme_passe_3: true, // efficacité des passes sur les 3 derniers matchs
  wr_off: true, // yards par cible des receveurs
  te_off: true, // yards par cible des tight ends
  wr_conc: false, // yards par cible concédés aux receveurs
  te_conc: false,
  rb_conc: false,
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
    else if (c === '\n') { ligne.push(champ.replace(/\r$/, '')); lignes.push(ligne); ligne = []; champ = '' }
    else champ += c
  }
  if (champ !== '' || ligne.length > 0) { ligne.push(champ.replace(/\r$/, '')); lignes.push(ligne) }
  const [entete, ...corps] = lignes
  return corps
    .filter((l) => l.length === entete.length)
    .map((l) => Object.fromEntries(entete.map((nom, i) => [nom, l[i]])))
}

const n = (x: string | undefined) => {
  const v = parseFloat(x ?? '')
  return Number.isFinite(v) ? v : 0
}
const arrondi = (x: number) => Math.round(x * 1000) / 1000
const div = (a: number, b: number) => (b > 0 ? a / b : 0)

// Codes nflverse -> codes du site (au cas où une ancienne appellation apparaît)
const CODES: Record<string, string> = { LAR: 'LA', WSH: 'WAS', JAC: 'JAX', OAK: 'LV', SD: 'LAC', STL: 'LA' }
const code = (c: string) => CODES[c] ?? c

type Cumul = Record<string, number>
const ajoute = (m: Map<string, Cumul>, cle: string, valeurs: Cumul) => {
  const cur = m.get(cle) ?? {}
  for (const [k, v] of Object.entries(valeurs)) cur[k] = (cur[k] ?? 0) + v
  m.set(cle, cur)
}

export function calculerStatsExpert(csvEquipes: string, csvJoueurs: string, saison: number): LigneStats[] {
  const equipes = lireCsv(csvEquipes).filter((r) => r.season_type === 'REG' && n(r.season) === saison)
  const joueurs = lireCsv(csvJoueurs).filter((r) => r.season_type === 'REG' && n(r.season) === saison)
  if (equipes.length === 0) throw new Error('Aucune donnée d\'équipe pour la saison ' + saison)

  const derniere = Math.max(...equipes.map((r) => n(r.week)))
  const off = new Map<string, Cumul>() // ce que fait l'équipe
  const conc = new Map<string, Cumul>() // ce que ses adversaires font contre elle
  const matchs = new Map<string, { semaine: number; epa: number; jeux: number }[]>()

  for (const r of equipes) {
    const t = code(r.team)
    const adv = code(r.opponent_team)
    const jeuxPasse = n(r.attempts) + n(r.sacks_suffered)
    ajoute(off, t, {
      matchs: 1, jeuxPasse, epaPasse: n(r.passing_epa),
      courses: n(r.carries), ydsCourse: n(r.rushing_yards),
      pressionInf: n(r.def_sacks) + n(r.def_qb_hits),
    })
    ajoute(conc, adv, {
      matchs: 1, jeuxPasse, epaPasse: n(r.passing_epa),
      courses: n(r.carries), ydsCourse: n(r.rushing_yards),
      pressionSub: n(r.def_sacks) + n(r.def_qb_hits),
    })
    const l = matchs.get(t) ?? []
    l.push({ semaine: n(r.week), epa: n(r.passing_epa), jeux: jeuxPasse })
    matchs.set(t, l)
  }

  const posOff = new Map<string, Cumul>()
  const posConc = new Map<string, Cumul>()
  for (const r of joueurs) {
    const poste = r.position
    if (poste !== 'WR' && poste !== 'TE' && poste !== 'RB') continue
    const cibles = n(r.targets)
    const yards = n(r.receiving_yards)
    ajoute(posOff, `${code(r.team)}|${poste}`, { cibles, yards })
    ajoute(posConc, `${code(r.opponent_team)}|${poste}`, { cibles, yards })
  }

  const valeurs = new Map<string, Record<string, number>>()
  for (const [t, o] of off) {
    const c = conc.get(t) ?? {}
    const l = (matchs.get(t) ?? []).sort((a, b) => b.semaine - a.semaine).slice(0, 3)
    const v: Record<string, number> = {
      passe_att: div(o.epaPasse, o.jeuxPasse),
      course_att: div(o.ydsCourse, o.courses),
      passe_def: div(c.epaPasse ?? 0, c.jeuxPasse ?? 0),
      course_def: div(c.ydsCourse ?? 0, c.courses ?? 0),
      pression_inf: div(o.pressionInf, o.matchs),
      pression_sub: div(c.pressionSub ?? 0, c.matchs ?? 0),
      forme_passe_3: div(l.reduce((s, x) => s + x.epa, 0), l.reduce((s, x) => s + x.jeux, 0)),
    }
    const poste = (m: Map<string, Cumul>, p: string) => {
      const x = m.get(`${t}|${p}`)
      return x ? div(x.yards, x.cibles) : 0
    }
    v.wr_off = poste(posOff, 'WR')
    v.te_off = poste(posOff, 'TE')
    v.wr_conc = poste(posConc, 'WR')
    v.te_conc = poste(posConc, 'TE')
    v.rb_conc = poste(posConc, 'RB')
    valeurs.set(t, v)
  }

  if (valeurs.size !== 32) throw new Error(`Seulement ${valeurs.size} équipes trouvées (32 attendues)`)

  const rangs = new Map<string, Record<string, number>>()
  for (const [mesure, plusHautMieux] of Object.entries(SENS)) {
    const tri = [...valeurs.entries()].sort((a, b) =>
      plusHautMieux ? b[1][mesure] - a[1][mesure] : a[1][mesure] - b[1][mesure]
    )
    tri.forEach(([t], i) => {
      const r = rangs.get(t) ?? {}
      r[mesure] = i + 1
      rangs.set(t, r)
    })
  }

  return [...valeurs.entries()].map(([t, v]) => ({
    equipe: t,
    saison,
    derniere_semaine: derniere,
    valeurs: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, arrondi(x)])),
    rangs: rangs.get(t)!,
  }))
}

// Saison NFL en cours : de juin à décembre = année en cours, de janvier à mai = année précédente
export function saisonNfl(date = new Date()): number {
  return date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1
}

export function urlsNflverse(saison: number) {
  const base = 'https://github.com/nflverse/nflverse-data/releases/download'
  return {
    equipes: `${base}/stats_team/stats_team_week_${saison}.csv`,
    joueurs: `${base}/stats_player/stats_player_week_${saison}.csv`,
  }
}