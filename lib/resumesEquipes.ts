export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SF: {
    texte: "Une victoire contre les Raiders où la défense a forcé cinq turnovers, avec le retour de Nick Bosa et de DeForest Buckner.",
    forces: ['Défense dominante', 'Retour de Nick Bosa'],
  },
  BUF: {
    texte: "Une victoire à Minnesota lundi soir, portée par Josh Allen et James Cook qui a conclu le match en force au sol.",
    forces: ['Josh Allen', 'Jeu de course en fin de match'],
    faiblesses: ['Défense encore à confirmer'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  JAX: {
    texte: "Une victoire jeudi soir à Baltimore. Les Jaguars sont vus comme possiblement la meilleure équipe de l’AFC et ont fait trois échanges pour renforcer leur défense.",
    forces: ['Attaque riche en armes', 'Défense bien coordonnée'],
    faiblesses: ['Défense contre la course fragilisée par une blessure'],
  },
  CHI: {
    texte: "Une victoire face à Tampa Bay dans un match animé : malgré quatre interceptions de Caleb Williams, la défense a fait la différence.",
    forces: ['Défense qui élève son niveau', 'Jeu complémentaire'],
    faiblesses: ['Pertes de balle de l’attaque'],
  },
  CIN: {
    texte: "Une victoire à Madrid contre Atlanta, avec une attaque spectaculaire autour de Joe Burrow, Ja’Marr Chase et Tee Higgins.",
    forces: ['Attaque explosive', 'Dexter Lawrence'],
    faiblesses: ['Défense juste correcte'],
  },
  DEN: {
    texte: "Une victoire contre Carolina, scellée par deux touchdowns au quatrième quart-temps et un sack-fumble de Nik Bonitto.",
    forces: ['Défense décisive en fin de match', 'Savoir conclure les victoires'],
    faiblesses: ['Attaque encore loin de son potentiel'],
  },
  DET: {
    texte: "Une victoire peu élégante à Miami, avec juste ce qu’il faut de Jahmyr Gibbs pour repartir avec le succès.",
    forces: ['Jahmyr Gibbs', 'Capacité à gagner un match difficile'],
    faiblesses: ['Prestation peu brillante contre Miami'],
  },
  GB: {
    texte: "Une victoire à New England où la défense de Jonathan Gannon a mis Drake Maye en difficulté, avec Jordan Love en pleine confiance.",
    forces: ['Défense opportuniste', 'Jordan Love en confiance'],
    faiblesses: ['Jeu de course quasi absent'],
  },
  SEA: {
    texte: "Une victoire contre Arizona avec Drew Lock à la place de Sam Darnold, blessé ; Lock a toutefois souffert d’un problème aux obliques.",
    forces: ['Défense solide', 'Duo Charbonnet / Price'],
    faiblesses: ['Situation incertaine au poste de quarterback', 'Attaque irrégulière'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  KC: {
    texte: "Une victoire à domicile contre les Jets (35-12), portée par Kenneth Walker III, quelques éclairs de Patrick Mahomes et une défense écrasante.",
    forces: ['Patrick Mahomes', 'Kenneth Walker III'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  MIN: {
    texte: "Une défaite à domicile contre Buffalo lundi soir : l’attaque a de nouveau été trop faible face à une défense toujours redoutable.",
    forces: ['Défense très forte'],
    faiblesses: ['Niveau du quarterback'],
  },
  PIT: {
    texte: "Semaine de repos après la victoire sur Cleveland, avant un gros rendez-vous à Cincinnati dimanche soir pour le contrôle de l’AFC Nord.",
    forces: ['Élan avant la pause', 'En tête de l’AFC Nord'],
  },
  NYG: {
    texte: "Une victoire à Philadelphie, la première là-bas depuis 2013, grâce à un grand match d’Arvell Reese (3 sacks) malgré une brève absence de J.J. McCarthy.",
    forces: ['Défense avec Arvell Reese', 'Série de victoires'],
    faiblesses: ['Victoires peu convaincantes'],
  },
  TB: {
    texte: "Une défaite de peu contre Chicago dimanche soir, avec des turnovers forcés : l’équipe vaut mieux que son bilan de 3-6.",
    forces: ['Défense qui force des turnovers', 'Jeu de course'],
    faiblesses: ['Bilan de 3-6'],
  },
  NE: {
    texte: "Une défaite contre Green Bay : Christian Gonzalez a été pris en défaut et Drake Maye a lancé trois interceptions.",
    forces: ['Parcours jusqu’en finale de l’AFC la saison passée'],
    faiblesses: ['Interceptions de Drake Maye', 'Couverture défensive'],
  },
  HOU: {
    texte: "Une large victoire contre les Chargers (44 points marqués), avec le premier touchdown de Tank Dell depuis son retour de blessure.",
    forces: ['Attaque explosive cette semaine', 'Retour de Tank Dell'],
    faiblesses: ['Bilan de 3-5'],
  },
  LA: {
    texte: "Une victoire contre Washington qui remet les Rams au-dessus de .500, mais Puka Nacua part sur la liste des blessés.",
    forces: ['Retour en forme de Myles Garrett'],
    faiblesses: ['Perte de Puka Nacua', 'Attaque sans identité claire'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  ATL: {
    texte: "Une défaite contre Cincinnati à Madrid : les bons moments d’Atlanta restent trop rares pour en faire une certitude.",
    forces: ['Des pointes de très haut niveau'],
    faiblesses: ['Irrégularité', 'Prestation de Michael Penix Jr.'],
  },
  CLE: {
    texte: "Une deuxième défaite d’affilée à La Nouvelle-Orléans, avec Shedeur Sanders titulaire à la place de Deshaun Watson (commotion).",
    forces: ['Denzel Ward en couverture'],
    faiblesses: ['Défense contre la course', 'Absence de Maliek Collins', 'Incertitude au poste de quarterback'],
  },
  CAR: {
    texte: "Une défaite contre Denver après avoir mené 14-13 ; la défense n’a pas progressé depuis le départ du coordinateur Ejiro Evero.",
    forces: ['Bryce Young en confiance par moments'],
    faiblesses: ['Défense', 'Régularité'],
  },
  LV: {
    texte: "Une défaite à San Francisco ; la défense s’effondre et le passage de Kirk Cousins à Fernando Mendoza semble approcher.",
    forces: ['Matchs généralement compétitifs'],
    faiblesses: ['Défense en perte de vitesse', 'Transition au poste de quarterback'],
  },
  DAL: {
    texte: "Une victoire contre Indianapolis avec plus de 500 yards d’attaque et une interception décisive de Caleb Downs.",
    forces: ['Attaque productive', 'Interception de Caleb Downs'],
    faiblesses: ['Victoire contre une équipe tournée vers 2027'],
  },
  NO: {
    texte: "Une victoire contre Cleveland, laborieuse mais nécessaire, avec un jeu de course enfin plus présent.",
    forces: ['Jeu de course plus présent'],
    faiblesses: ['Match long à se décanter', 'Doit confirmer sur la durée'],
  },
  TEN: {
    texte: "Semaine de repos après une défaite, avec la meilleure prestation de Cam Ward ; deux matchs contre Jacksonville arrivent.",
    forces: ['Progrès de Cam Ward'],
    faiblesses: ['Bilan de 1-7'],
  },
  IND: {
    texte: "Une défaite contre Dallas sur une nouvelle perte de balle tardive ; la franchise regarde déjà vers 2027.",
    faiblesses: ['Pertes de balle tardives', 'Départs de joueurs clés par échange'],
  },
  WAS: {
    texte: "Une défaite contre les Rams, avec encore des détails mal gérés en fin de match ; le staff est sous surveillance.",
    faiblesses: ['Gestion des fins de match', 'Manque de précision'],
  },
  ARI: {
    texte: "Une défaite contre Seattle avec seulement trois points marqués ; Gardner Minshew est blessé au coude et Carson Beck devrait débuter.",
    faiblesses: ['Attaque très faible', 'Blessure de Gardner Minshew'],
  },
  BAL: {
    texte: "Une lourde défaite jeudi soir contre Jacksonville, jugée la pire prestation des Ravens depuis longtemps ; Jacoby Brissett vient d’arriver.",
    faiblesses: ['Poste de quarterback', 'Défense'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  MIA: {
    texte: "Une défaite contre Detroit, avec des motifs d’espoir (Caleb Douglas, Ollie Gordon II, Jacob Rodriguez) dans une reconstruction encore longue.",
    forces: ['Jeunes joueurs prometteurs'],
    faiblesses: ['Reconstruction à un stade précoce'],
  },
  NYJ: {
    texte: "Une défaite à Kansas City : un bon premier quart, puis un effondrement en seconde mi-temps.",
    faiblesses: ['Effondrement en seconde mi-temps', 'Difficulté à conclure les matchs'],
  },
  PHI: {
    texte: "Une défaite à domicile contre les Giants avec Joe Milton III au quarterback ; l’échange de Jordan Davis vers Jacksonville en dit long.",
    faiblesses: ['Poste de quarterback', 'Équipe en mode vente'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  LAC: {
    texte: "Une défaite contre Houston, mais un premier touchdown enfin marqué après une longue série, sur une longue passe de Justin Herbert à Quentin Johnston.",
    forces: ['Quentin Johnston'],
    faiblesses: ['Bilan de 0-8', 'Attaque sans direction'],
  },
}