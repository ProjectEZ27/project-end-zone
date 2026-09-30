export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SEA: {
    texte: "Une défense toujours solide, mais un retour compliqué de Sam Darnold : deux interceptions, dont un pick-six, ont coûté la victoire face à Washington malgré un bon début de match.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Régularité en début de saison'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  LA: {
    texte: "Une équipe à deux visages : après une victoire convaincante face aux Giants, les Rams se sont effondrés après la pause face à Denver malgré un 16-0 à la mi-temps.",
    forces: ['Régularité', 'Défense', 'Expérience au poste de quarterback'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  BUF: {
    texte: "Invaincus mais à l'arrache : Josh Allen a dû sauver les meubles face à des Chargers qui ont longtemps dominé, symbole d'une équipe encore perfectible malgré son bilan parfait.",
    forces: ['Quarterback', 'Jeu aérien', 'Rythme offensif'],
    faiblesses: ['Défense sur les gros matchs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  BAL: {
    texte: "Une attaque redevenue explosive comme en semaine 1, portée par le retour de Zay Flowers en réception — mais la zone rouge reste un point faible à corriger.",
    forces: ['Attaque au sol', 'Quarterback mobile'],
    faiblesses: ['Régularité en playoffs'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  KC: {
    texte: "Une victoire tranquille et maîtrisée face à des Dolphins diminués, sans avoir besoin de forcer le talent — une équipe qui sait déjà qui elle est après trois semaines.",
    forces: ['Fin de match', 'Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  PHI: {
    texte: "Une désillusion complète face aux Bears : Jalen Hurts a peiné, la défense a craqué (375 yards concédés), et l'évolution offensive sous Sean Mannion n'a pas encore payé.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NE: {
    texte: "Une équipe en pleine crise au poste de quarterback : Drake Maye semble perdu, et l'entraîneur lui-même qualifie son niveau d'inquiétude de 'très élevé'.",
    forces: ['Défense', 'Expérience collective'],
    faiblesses: ['Fin de match sur les tout gros matchs'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  DET: {
    texte: "Une attaque toujours portée par un immense Jahmyr Gibbs, mais des largesses défensives en fin de match qui ont failli coûter une prolongation.",
    forces: ['Attaque au sol', 'Créativité offensive', 'Ligne offensive'],
    faiblesses: ["Matchs à l'extérieur"],
  },
  DAL: {
    texte: "Une défaite frustrante face à Baltimore malgré une belle prestation de Dak Prescott et un arrêt décisif en fin de match — la défense a de nouveau craqué dans le money-time.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense', 'Constance'],
  },
  CIN: {
    texte: "Une défense pourtant solide prise à défaut face à un Aaron Rodgers retrouvé, laissant filer une défaite d'un point contre un rival de division.",
    forces: ['Jeu aérien', 'Capacité à revenir au score'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  MIA: {
    texte: "0-3 et toujours ce même problème : Miami domine souvent entre les 20 yards mais ne parvient pas à concrétiser, dans l'effectif le plus décimé de la ligue.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
  HOU: {
    texte: "Toujours aucune victoire et une attaque en grande difficulté — seulement six points marqués en semaine 2, puis une nouvelle contre-performance face aux Colts malgré un sursaut tardif.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Expérience en playoffs'],
  },
  PIT: {
    texte: "Enfin un vrai réveil offensif avec des passes longues et agressives, la défense ayant scellé la victoire — reste à confirmer que ce n'était pas un coup d'éclat isolé.",
    forces: ['Défense', 'Discipline tactique'],
    faiblesses: ['Créativité offensive'],
  },
  LAC: {
    texte: "0-3 malgré une nette amélioration en première mi-temps face à Buffalo (3 interceptions provoquées) — la seconde période a de nouveau tourné à l'effondrement.",
    forces: ['Équilibre offense/défense'],
    faiblesses: ['Manque de régularité'],
  },
  MIN: {
    texte: "Invaincus grâce à une défense exceptionnelle qui compense une attaque totalement imprévisible — suffisant pour entrer dans le top 10 pour la première fois cette saison.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive'],
  },
  DEN: {
    texte: "Toujours pas de match complet, mais une défense qui tient bon assez longtemps pour laisser l'attaque se réveiller, souvent décisive en seconde mi-temps.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  ARI: {
    texte: "Une belle combativité face à San Francisco, mais une défense qui a concédé trop d'actions décisives — du travail reste à faire.",
    forces: ["Coups d'éclat offensifs"],
    faiblesses: ['Régularité'],
  },
  TB: {
    texte: "0-3 et la situation empire : Baker Mayfield, déjà en délicatesse dans le système offensif de Zac Robinson, sera absent au moins 3 semaines après une blessure au pouce.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Une victoire sans appel à Green Bay portée par un immense Bijan Robinson, lors du premier match avec Michael Penix Jr. dans l'effectif — de quoi relancer la saison.",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une victoire arrachée face à Houston malgré 3 pertes de balle de Daniel Jones, sauvée par une défense enfin solide et un botteur impeccable (8/8 cette saison).",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  CHI: {
    texte: "Case Keenum a livré une performance mémorable en l'absence de Caleb Williams, menant une victoire de 20 points face aux Eagles avec une défense tout aussi solide.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Une défaite honorable à Detroit : les Jets ont remonté un déficit de deux touchdowns en fin de match, un vrai motif d'espoir après le naufrage de la semaine 2.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  WAS: {
    texte: "Marcus Mariota a été le héros inattendu de la semaine, menant la victoire face à Seattle, portée par une défense qui a multiplié les interceptions décisives.",
    forces: ['Audace offensive', 'Progression'],
    faiblesses: ['Expérience défensive'],
  },
  NO: {
    texte: "Un effondrement inattendu face aux Raiders après deux semaines où les Saints savaient conclure en fin de match — une vraie leçon pour cette équipe prometteuse.",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  NYG: {
    texte: "Une victoire poussive sous la pluie face au Tennessee, dans le style bien connu de John Harbaugh — l'acquisition de JJ McCarthy laisse présager des changements à venir.",
    forces: ['Ligne défensive', 'Pression sur le QB'],
    faiblesses: ['Attaque'],
  },
  CAR: {
    texte: "Le trou d'air se confirme à Cleveland : Bryce Young blessé, défense fébrile sans Devin Lloyd — une semaine de repos arrive à point nommé avant un test face aux Lions.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  JAX: {
    texte: "Une reprise idéale avec une victoire facile face aux Patriots, où même la défense s'est offert le luxe de briller (première interception en carrière pour Travis Hunter).",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  LV: {
    texte: "La bonne surprise de ce début de saison : invaincus après 3 semaines, portés par un nouvel entraîneur qui a redonné vie à cette franchise entre joueurs confirmés et jeunes talents inattendus.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  TEN: {
    texte: "Toujours aucune victoire, plombés par une interception catastrophique de Cam Ward dans la zone d'en-but qui a scellé une nouvelle défaite face aux Giants.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  CLE: {
    texte: "Une défense qui rivalise déjà avec les meilleures de la ligue, portée par de jeunes talents en plein essor — et un quarterback retrouvé dans les moments décisifs.",
    forces: ['Historique défensif'],
    faiblesses: ['Attaque'],
  },
  SF: {
    texte: "Une attaque qui semble filer en pilotage automatique et un Brock Purdy dont les rumeurs de MVP sont amplement justifiées — reste à voir si l'équipe résistera à des adversaires plus coriaces avec autant de blessés.",
    forces: ['Polyvalence offensive', 'Ligne défensive'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  GB: {
    texte: "Une 'soirée humiliante' selon l'entraîneur lui-même après une défaite de 21 points face à Atlanta — l'attaque manque cruellement de jeu au sol et repose trop sur Jordan Love.",
    forces: ['Défense (secondaire)', 'Progression au poste de quarterback'],
    faiblesses: ['Régularité offensive'],
  },
}