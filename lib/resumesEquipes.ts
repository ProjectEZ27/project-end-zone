export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  BUF: {
    texte: "Une victoire contre Baltimore privé de son quarterback titulaire : l'attaque reste explosive, mais la défense soulève encore des questions.",
    forces: ['Attaque explosive', 'Quarterback'],
    faiblesses: ['Défense (à confirmer)'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  SF: {
    texte: "Une semaine de repos pour digérer la première défaite de la saison — le retour des blessés sera la clé pour rester en haut du classement.",
    forces: ['Polyvalence offensive', 'Défense'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  CHI: {
    texte: "Une grosse victoire à Seattle : l'arrivée de Jeffery Simmons a immédiatement renforcé la ligne défensive, qui offre enfin un vrai partenaire à l'attaque.",
    forces: ['Ligne défensive', 'Dynamique'],
    faiblesses: ['Régularité sur la durée (à confirmer)'],
  },
  JAX: {
    texte: "Une victoire nette face à des Colts en reconstruction : Jacksonville confirme sa belle forme à domicile et s'installe parmi les meilleures équipes de la ligue.",
    forces: ['Jeu à domicile', 'Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  DET: {
    texte: "Une remontée tardive face à des Vikings jusque-là invaincus : une vraie identité offensive et une défense solide.",
    forces: ['Identité offensive', 'Capacité à revenir au score'],
    faiblesses: ['Constance défensive (à confirmer)'],
  },
  DEN: {
    texte: "Un retour au score au 4e quart-temps face à Kansas City : l'attaque progresse et Denver reste bien placé dans la course de la division.",
    forces: ['Capacité à revenir au score', 'Progression offensive'],
    faiblesses: ['Efficacité offensive'],
  },
  SEA: {
    texte: "Une défaite à Chicago qui a mis en lumière les problèmes de l'attaque et des choix discutables en fin de match, alors que la défense reste solide.",
    forces: ['Défense'],
    faiblesses: ['Attaque', 'Gestion de fin de match'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  CIN: {
    texte: "Une victoire en prolongation face à Tennessee, avec beaucoup de points marqués mais aussi des pertes de balle et une défense en difficulté.",
    forces: ['Jeu aérien', 'Production offensive'],
    faiblesses: ['Protection du ballon', 'Défense'],
  },
  MIN: {
    texte: "Première défaite de la saison : la défense a flanché en fin de match et l'attaque a produit peu.",
    forces: ['Défense agressive'],
    faiblesses: ['Régularité offensive', 'Fin de match'],
  },
  KC: {
    texte: "Une attaque qui a produit sans Kenneth Walker III, mais une dernière série non conclue près de la ligne d'en-but a coûté la victoire face à Denver.",
    forces: ['Expérience', 'Régularité en playoffs'],
    faiblesses: ['Finition près de la ligne', 'Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  NE: {
    texte: "Un début de match poussif à Miami, mais une belle réaction après la mi-temps pour s'imposer.",
    forces: ['Réaction en 2e mi-temps', 'Jeu aérien'],
    faiblesses: ['Débuts de match'],
  },
  PIT: {
    texte: "Une défense et un jeu au sol dominants contre Cleveland : Pittsburgh prend la tête de la division AFC North.",
    forces: ['Défense', 'Jeu au sol'],
    faiblesses: ['Régularité hebdomadaire'],
  },
  GB: {
    texte: "La défense a progressé et a étouffé Carolina ; le receveur Matthew Golden émerge, même si le jeu au sol reste irrégulier.",
    forces: ['Défense en progrès', 'Receveurs'],
    faiblesses: ['Jeu au sol'],
  },
  NYG: {
    texte: "Une victoire en prolongation à Houston portée par le jeu au sol : les Giants mènent une division NFC East faible, mais restent irréguliers.",
    forces: ['Jeu au sol', 'Capacité à gagner en prolongation'],
    faiblesses: ['Régularité'],
  },
  CLE: {
    texte: "Une lourde défaite face à Pittsburgh, avec Deshaun Watson sacké huit fois — Cleveland reste toutefois bien placé au classement.",
    forces: ['Historique défensif'],
    faiblesses: ['Protection du quarterback', 'Jeu au sol'],
  },
  TB: {
    texte: "Une victoire sans réussir une seule passe, grâce à 322 yards au sol — la défense s'impose comme un vrai point fort.",
    forces: ['Jeu au sol', 'Défense'],
    faiblesses: ['Jeu aérien'],
  },
  ATL: {
    texte: "Une défaite 16-0 alors que la défense n'avait concédé aucune passe réussie : l'attaque a peiné et l'équipe a semblé sans énergie.",
    forces: ['Défense'],
    faiblesses: ['Attaque', 'Intensité'],
  },
  LA: {
    texte: "Un retour à 4-4 après un début de match lent, grâce à un duo de running backs et une défense régulière.",
    forces: ['Jeu au sol', 'Défense régulière'],
    faiblesses: ['Débuts de match'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  HOU: {
    texte: "Une défense en baisse de régime, mais un calendrier favorable après la semaine de repos laisse une porte ouverte pour rebondir.",
    forces: ['Calendrier favorable'],
    faiblesses: ['Défense'],
  },
  LV: {
    texte: "Fin d'une série de quatre défaites grâce à un retour au score — le rookie Mike Washington Jr. est devenu le running back titulaire.",
    forces: ['Capacité à revenir au score', 'Jeu au sol (Washington Jr.)'],
    faiblesses: ['Régularité'],
  },
  CAR: {
    texte: "Une défaite face à Green Bay après une période difficile : le coordinateur défensif a été renvoyé, mais l'avenir de l'entraîneur reste flou.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense', 'Stabilité du staff'],
  },
  BAL: {
    texte: "Lamar Jackson s'est blessé, possiblement pour le reste de la saison, et Tyler Huntley est aussi touché : l'équipe est en crise.",
    forces: ['Culture de la gagne'],
    faiblesses: ['Profondeur au poste de quarterback', 'Blessures'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  ARI: {
    texte: "Jacoby Brissett remplacé par Gardner Minshew, qui a mené une folle remontée face à Dallas — les Cardinals pourraient aussi devenir vendeurs.",
    forces: ['Capacité à revenir au score'],
    faiblesses: ['Stabilité au poste de quarterback'],
  },
  DAL: {
    texte: "Une avance de 17-3 gâchée face à Arizona : le jeu axé sur la passe et la défense ne fonctionnent pas.",
    forces: ['Attaque explosive (quand ça fonctionne)'],
    faiblesses: ['Défense', 'Gestion d\'avance'],
  },
  TEN: {
    texte: "Une défaite cruelle en prolongation contre Cincinnati : Cam Ward a livré son meilleur match et l'équipe se bat bien ces dernières semaines.",
    forces: ['Progression de Cam Ward', 'Combativité'],
    faiblesses: ['Fin de match', 'Bilan (1-7)'],
  },
  WAS: {
    texte: "Un match important face à Philadelphie : Jayden Daniels fait tourner l'attaque efficacement, mais le niveau réel de l'équipe reste flou.",
    forces: ['Jayden Daniels'],
    faiblesses: ['Niveau réel incertain'],
  },
  MIA: {
    texte: "Devant à la mi-temps face à New England, mais battu au final — l'équipe progresse et a une vraie chance en semaine 10.",
    forces: ['Progression', 'Jeunes talents'],
    faiblesses: ['Fin de match'],
  },
  NO: {
    texte: "Une chute après la semaine de repos : il faut plus de production offensive de la part de Tyler Shough.",
    forces: ['Discipline tactique'],
    faiblesses: ['Attaque'],
  },
  NYJ: {
    texte: "Meilleurs que leur bilan, mais ils continuent de perdre des matchs serrés et peinent dans les quatrièmes quart-temps.",
    forces: ['Pass rush'],
    faiblesses: ['Fin de match', 'Régularité offensive'],
  },
  LAC: {
    texte: "Toujours sans victoire (0-7) : aucun touchdown en 27 séries, l'attaque répète les mêmes erreurs.",
    forces: ['Expérience au poste de quarterback'],
    faiblesses: ['Attaque', 'Ligne offensive'],
  },
  IND: {
    texte: "Menés 28-0 à la mi-temps à Jacksonville, avec des vétérans échangés : les Colts sont entrés en reconstruction.",
    faiblesses: ['Ligne offensive', 'Groupe de receveurs'],
  },
  PHI: {
    texte: "Un effectif diminué, une ligne offensive faible, une défense en difficulté et Saquon Barkley qui joue blessé : Philadelphie se dirige vers un choix de draft élevé.",
    forces: ['Talent individuel'],
    faiblesses: ['Ligne offensive', 'Défense'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
}