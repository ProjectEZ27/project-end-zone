export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SEA: {
    texte: "Une réaction immédiate après la défaite surprise face à Washington : large domination des Chargers (27-6), même si la pression a été relâchée un peu trop tôt en fin de match.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Régularité en début de saison'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  LA: {
    texte: "Longtemps menés à Philadelphie, les Rams ont signé une remontée spectaculaire au dernier quart-temps — Matthew Stafford doit cependant hausser son niveau de jeu.",
    forces: ['Régularité', 'Défense', 'Expérience au poste de quarterback'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  BUF: {
    texte: "Une 2e semaine déconcertante : séparation surprise avec James Cook, trop de gros jeux concédés aux Patriots, et une perte de balle au pire moment pour Josh Allen lors de la défaite.",
    forces: ['Quarterback', 'Jeu aérien', 'Rythme offensif'],
    faiblesses: ['Défense sur les gros matchs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  BAL: {
    texte: "Une large domination des Titans en 1re mi-temps (24-7), ternie par la sortie sur blessure de Lamar Jackson à la cheville — un motif d'inquiétude pour la suite.",
    forces: ['Attaque au sol', 'Quarterback mobile'],
    faiblesses: ['Régularité en playoffs'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  KC: {
    texte: "Une victoire arrachée de justesse face à des Raiders combatifs, portée par des actions décisives au dernier quart-temps et une attaque équilibrée.",
    forces: ['Fin de match', 'Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  PHI: {
    texte: "Un nouveau point bas offensif face aux Rams, aggravé par la sortie prématurée de Saquon Barkley — la défense n'a pas non plus été à la hauteur.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NE: {
    texte: "Un vrai retournement de situation : Drake Maye a retrouvé son niveau pour une victoire importante à l'extérieur face à Buffalo, dans la course au titre de la division.",
    forces: ['Défense', 'Expérience collective'],
    faiblesses: ['Fin de match sur les tout gros matchs'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  DET: {
    texte: "Sans un Jahmyr Gibbs à son meilleur niveau, l'attaque s'est enlisée en fin de match et la défense n'a pas su contenir Bryce Young lors de la défaite.",
    forces: ['Attaque au sol', 'Créativité offensive', 'Ligne offensive'],
    faiblesses: ["Matchs à l'extérieur"],
  },
  DAL: {
    texte: "Un touchdown inscrit dans la dernière minute pour vaincre Houston — l'attaque reste explosive mais la défense continue de poser question.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense', 'Constance'],
  },
  CIN: {
    texte: "La sortie de Ja'Marr Chase en 1re mi-temps a plombé Joe Burrow, auteur de deux interceptions dans une prestation brouillonne face à Jacksonville.",
    forces: ['Jeu aérien', 'Capacité à revenir au score'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  MIA: {
    texte: "Toujours sans victoire mais des signes d'amélioration chaque semaine, cette fois face à des Vikings pourtant portés par leur défense.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
  HOU: {
    texte: "Une 2e semaine de suite où C.J. Stroud donne l'avantage en fin de match sans que la défense parvienne à le préserver — l'étiquette 'élite' n'est plus de mise.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Expérience en playoffs'],
  },
  PIT: {
    texte: "Un sursaut tardif de Rodgers et Metcalf a permis d'égaliser face à Cleveland, mais la défense n'a pas réussi à faire pression sur Deshaun Watson.",
    forces: ['Défense', 'Discipline tactique'],
    faiblesses: ['Créativité offensive'],
  },
  LAC: {
    texte: "Toujours sans victoire : une attaque en panne, un Justin Herbert pas encore à l'aise dans le système McDaniel, aggravé par des blessures sur la ligne offensive.",
    forces: ['Équilibre offense/défense'],
    faiblesses: ['Manque de régularité'],
  },
  MIN: {
    texte: "Invaincus mais toujours aussi trompeurs : l'attaque reste catastrophique, seule la défense continue de porter l'équipe, cette fois face aux Dolphins.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive'],
  },
  DEN: {
    texte: "Une belle bataille à Santa Clara mais les mêmes erreurs répétées en fin de match, aggravées par la perte des deux cornerbacks titulaires sur blessure.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  ARI: {
    texte: "Une mauvaise passe en fin de match a de nouveau coûté cher face aux Giants, malgré une défense qui a fait sa part en début de rencontre.",
    forces: ["Coups d'éclat offensifs"],
    faiblesses: ['Régularité'],
  },
  TB: {
    texte: "La situation continue de se dégrader : une nouvelle défaite de trois points malgré quelques actions correctes du rookie Jalon Daniels.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Bijan et Brian Robinson ont inscrit cinq touchdowns au sol à eux deux pour écraser la Nouvelle-Orléans — prudence de mise avant un calendrier exigeant (Baltimore, Chicago, SF).",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une victoire profitant en partie de la sortie de Marcus Mariota côté adverse, malgré deux nouvelles pertes de balle de Daniel Jones.",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  CHI: {
    texte: "Une domination totale face aux Jets portée par Case Keenum pour la 2e semaine consécutive — la marque de fabrique de l'entraîneur Ben Johnson.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Un revers cinglant face à Chicago (32 actions jouées contre 89), qui impose une profonde introspection à toute l'équipe.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  WAS: {
    texte: "Une situation qui se complique avec la blessure de Marcus Mariota, mais la défense continue de dépasser toutes les attentes malgré les 30 points encaissés.",
    forces: ['Audace offensive', 'Progression'],
    faiblesses: ['Expérience défensive'],
  },
  NO: {
    texte: "Une véritable passoire défensive face à Atlanta (205 yards au sol concédés), qui assombrit sérieusement les espoirs de la Nouvelle-Orléans après 4 semaines.",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  NYG: {
    texte: "Une remontée spectaculaire après un déficit de 14-3, portée par une défense en net progrès et un Jameis Winston toujours irrégulier.",
    forces: ['Ligne défensive', 'Pression sur le QB'],
    faiblesses: ['Attaque'],
  },
  CAR: {
    texte: "Bryce Young a retrouvé son meilleur niveau (329 yards, 2 TD) pour la victoire la plus impressionnante de la saison, malgré l'absence de plusieurs joueurs clés.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  JAX: {
    texte: "Une identité offensive bien affirmée (jeu au sol puis Trevor Lawrence) qui a permis une victoire importante à Cincinnati, ternie par 13 pénalités à corriger.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  LV: {
    texte: "Pas de victoire morale, mais une vraie fierté : les Raiders ont tenu tête à Kansas City pendant 4 quart-temps et ont failli infliger aux Chiefs leur première défaite.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  TEN: {
    texte: "Une attaque toujours en phase d'adaptation au système de Brian Daboll, Cam Ward peinant à trouver ses marques — une marge d'erreur devenue infime.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  CLE: {
    texte: "Trois victoires d'affilée et une identité défensive retrouvée, Deshaun Watson et l'attaque ayant aussi trouvé leur rythme avant le dernier quart-temps.",
    forces: ['Historique défensif'],
    faiblesses: ['Attaque'],
  },
  SF: {
    texte: "Des difficultés face à Denver, mais les stars (Purdy, Samuel, McCaffrey, Kittle) ont relancé l'attaque en 2e période pour une victoire précieuse face à un vrai prétendant.",
    forces: ['Polyvalence offensive', 'Ligne défensive'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  GB: {
    texte: "Une victoire laborieuse à Tampa malgré la blessure d'Edgerrin Cooper pour le reste de la saison — le jeu au sol progresse enfin légèrement.",
    forces: ['Défense (secondaire)', 'Progression au poste de quarterback'],
    faiblesses: ['Régularité offensive'],
  },
}