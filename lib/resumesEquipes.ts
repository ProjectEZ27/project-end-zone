export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SF: {
    texte: "Une victoire à Seattle (32-29) portée par une défense qui continue de surpasser les attentes malgré un score final trompeur — un vrai atout de confiance pour un prétendant au Super Bowl.",
    forces: ['Polyvalence offensive', 'Défense qui dépasse les attentes'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  KC: {
    texte: "Une semaine de repos bienvenue pour se restructurer après la perte de receveurs précieux — l'une des équipes les plus complètes de la ligue reste solidement installée sur le podium.",
    forces: ['Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  SEA: {
    texte: "Une défaite serrée face aux 49ers, premiers du classement, après avoir manqué de peu un 1er essai décisif en fin de match — Sam Darnold doit hausser son niveau, mais le jeu au sol reste aussi à corriger.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Jeu au sol', 'Régularité au poste de quarterback'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  BAL: {
    texte: "Une victoire à l'extérieur avec un quarterback remplaçant, obtenue en limitant Bijan Robinson — la plus belle victoire à ce jour pour le coordinateur défensif Jesse Minter.",
    forces: ['Attaque au sol', 'Culture de la gagne'],
    faiblesses: ['Profondeur au poste de quarterback'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  JAX: {
    texte: "Une victoire chanceuse à Londres face à Philadelphie sur un field goal décisif de Cam Little, obtenue malgré des circonstances compliquées (long-snapper de fortune) — toutes les victoires comptent.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective', 'Gestion des imprévus'],
  },
  BUF: {
    texte: "Une victoire en prolongation face aux Rams portée par les équipes spéciales et un Josh Allen décisif, malgré un début de match poussif et des pertes de balle évitées de justesse.",
    forces: ['Quarterback', 'Combativité', 'Fin de match'],
    faiblesses: ['Protection du ballon (James Cook)'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  MIN: {
    texte: "Toujours invaincus : l'attaque a enfin montré des signes de vie en 2e période face aux Saints, Kyler Murray trouvant Justin Jefferson pour un touchdown et 17 points inscrits sur le dernier quart.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive (encore des réglages à faire)'],
  },
  DEN: {
    texte: "Une victoire poussive (224 yards au total) obtenue grâce à une bonne position de terrain et une défense qui a porté le comeback, malgré quelques décisions de gestion de match discutables.",
    forces: ['Ligne défensive'],
    faiblesses: ['Efficacité offensive', 'Gestion de match'],
  },
  CIN: {
    texte: "Une victoire plus large que ne le laisse penser le score final à Miami, portée par Joe Burrow et une action spectaculaire de Ja'Marr Chase — une petite inquiétude émerge toutefois dans le jeu au sol.",
    forces: ['Jeu aérien', 'Leaders expérimentés'],
    faiblesses: ['Profondeur au poste de running back'],
  },
  NE: {
    texte: "Une victoire éclatante face aux Raiders (536 yards d'attaque) portée par Drake Maye et une armada de receveurs, couplée à une défense qui a muselé Las Vegas en début de match.",
    forces: ['Jeu aérien', 'Profondeur offensive'],
    faiblesses: ['Régularité d\'une semaine à l\'autre'],
  },
  DET: {
    texte: "Une domination totale des Cardinals sur les trois derniers quarts-temps, Jared Goff distribuant le ballon pour 271 yards et trois touchdowns — la défense a enfin répondu présent.",
    forces: ['Jeu aérien', 'Créativité offensive'],
    faiblesses: ['Constance défensive (à confirmer)'],
  },
  LA: {
    texte: "Une attaque retrouvée mais toujours des largesses défensives contre la course et des pénalités mal placées, aggravées par une gestion de fin de match hasardeuse qui a coûté la victoire à Buffalo.",
    forces: ['Jeu aérien', 'Expérience au poste de quarterback'],
    faiblesses: ['Défense contre la course', 'Gestion de fin de match'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  CHI: {
    texte: "Sans Caleb Williams, l'attaque s'est enlisée (246 yards) face à une défense de Green Bay devenue perméable, confirmant que l'entraîneur Ben Johnson n'est pas magicien sans un vrai quarterback.",
    forces: ['Système offensif (avec le bon QB)'],
    faiblesses: ['Profondeur au poste de quarterback', 'Secondaire défensif'],
  },
  CAR: {
    texte: "Une semaine de repos bien méritée après la belle victoire face à Detroit — Bryce Young continue de prendre de la valeur avant un déplacement à Philadelphie puis un choc de division face à Tampa Bay.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Une fin de match qui a tourné court après la blessure aux côtes de Michael Penix Jr., Tua Tagovailoa reprenant le relais en prolongation — Bijan Robinson a aussi été moins tranchant que d'habitude.",
    forces: ['Attaque au sol'],
    faiblesses: ['Profondeur au poste de quarterback'],
  },
  GB: {
    texte: "L'attaque enfin attendue en 2026 : Jordan Love a trouvé Christian Watson à deux reprises pour 367 yards au total, démolissant la défense de Chicago — l'arrivée de Micah Parsons en fait une équipe à surveiller.",
    forces: ['Jeu aérien', 'Talent individuel (Love, Watson, Parsons)'],
    faiblesses: ['Constance (retrouvée récemment)'],
  },
  NYG: {
    texte: "Un match nul qui a des allures de victoire manquée : remontée de deux touchdowns en 4e quart-temps forcée en prolongation, puis un fumble qui coûte la victoire — du mieux en 2e mi-temps pour Jameis Winston.",
    forces: ['Capacité à revenir au score'],
    faiblesses: ['Défense (contre les QB mobiles)'],
  },
  DAL: {
    texte: "Une défaite désastreuse face à des Buccaneers jusque-là invaincus de victoire, l'attaque habituellement explosive ne marquant que 16 points — un vrai coup porté à la confiance sur cette équipe.",
    forces: ['Attaque explosive (quand ça fonctionne)'],
    faiblesses: ['Défense', 'Constance'],
  },
  LV: {
    texte: "Enfin l'équipe moyenne que beaucoup attendaient : plus de 500 yards concédés et une ligne incapable de protéger Kirk Cousins dans une lourde défaite — un premier vrai coup dur après un bon début de saison.",
    forces: ['Renouveau'],
    faiblesses: ['Ligne offensive', 'Jeu au sol'],
  },
  NYJ: {
    texte: "Une victoire poussive sous la pluie, portée par un pass rush agressif (8 sacks) qui a muselé Cleveland, avec Braelon Allen et Garrett Wilson auteurs de belles prestations malgré les conditions.",
    forces: ['Pass rush'],
    faiblesses: ['Régularité offensive'],
  },
  CLE: {
    texte: "Une fin de match catastrophique (snap manqué sur un punt, dernière possession désastreuse) a fait chuter les Browns, qui ne parviennent toujours pas à développer leur jeu au sol.",
    forces: ['Historique défensif'],
    faiblesses: ['Jeu au sol', 'Fin de match'],
  },
  PIT: {
    texte: "Une victoire face à Indianapolis portée par un retour aux sources sur Jaylen Warren et le jeu au sol — une méthode à conserver pour viser plus de régularité d'une semaine à l'autre.",
    forces: ['Jeu au sol (quand il est utilisé)'],
    faiblesses: ['Régularité une semaine sur deux'],
  },
  TB: {
    texte: "Une performance inspirée pour bloquer l'attaque de Dallas, portée par Bucky Irving (165 yards au sol) et une prestation solide du rookie Jalon Daniels en l'absence de Baker Mayfield.",
    forces: ['Jeu au sol (Irving)', 'Défense opportuniste'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une défaite qui illustre les limites actuelles : un groupe de receveurs trop dépendant de Josh Downs, une ligne offensive décevante, et une incapacité à conclure les séries malgré de bons moments.",
    forces: ['Protection du ballon (Daniel Jones)'],
    faiblesses: ['Groupe de receveurs', 'Ligne offensive'],
  },
  HOU: {
    texte: "Une victoire logique face au plus faible adversaire de la ligue, C.J. Stroud poursuivant sa belle saison de rebond et le jeu au sol progressant un peu malgré la blessure de David Montgomery.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Profondeur au poste de running back'],
  },
  PHI: {
    texte: "Une défaite particulièrement douloureuse à Londres : une avance tardive effacée en quelques secondes sur un retour de coup d'envoi suivi d'un field goal de 57 yards de Jacksonville.",
    forces: ['Talent individuel', 'Capacité à revenir au score'],
    faiblesses: ['Fin de match', 'Stabilité de la ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NO: {
    texte: "Une attaque à l'arrêt (moins de 150 yards nets) et deux interceptions de Tyler Shough face à la défense du Minnesota — des doutes sérieux sur les ambitions de division des Saints.",
    forces: ['Discipline tactique'],
    faiblesses: ['Attaque', 'Jeu sous pression défensive'],
  },
  WAS: {
    texte: "Jayden Daniels de retour a relancé l'attaque, mais un effondrement en 4e quart-temps a permis à Washington d'offrir un match nul à l'adversaire après avoir eu la victoire en main.",
    forces: ['Audace offensive (retour de Daniels)'],
    faiblesses: ['Gestion de fin de match'],
  },
  MIA: {
    texte: "Toujours sans victoire, mais des jeunes qui sortent du lot (Ollie Gordon II, Jacob Rodriguez) malgré les largesses défensives qui ont permis à Cincinnati d'enchaîner les séries.",
    forces: ['Jeunes talents prometteurs'],
    faiblesses: ['Défense', 'Expérience au poste de quarterback'],
  },
  LAC: {
    texte: "Une défaite accablante : une ligne offensive diminuée, Justin Herbert auteur d'un fumble et d'une interception coûteux en fin de match — un match gagnable offert à l'adversaire.",
    forces: ['Expérience au poste de quarterback (malgré la série en cours)'],
    faiblesses: ['Ligne offensive', 'Gestion de la pression'],
  },
  ARI: {
    texte: "Une attaque totalement muselée (un seul point marqué) qui a forcé les Cardinals à multiplier les passes longues en désespoir de cause, écartant Jeremiyah Love du plan de jeu.",
    forces: ['Début de saison prometteur (à confirmer)'],
    faiblesses: ['Attaque', 'Discipline défensive'],
  },
  TEN: {
    texte: "Toujours sans victoire, la pire attaque de la ligue en yards par match et une défense surchargée — les questions commencent à se poser sur l'avenir de Cam Ward comme titulaire.",
    forces: ['Jeu au sol (relatif)'],
    faiblesses: ['Attaque', 'Jeu aérien'],
  },
}