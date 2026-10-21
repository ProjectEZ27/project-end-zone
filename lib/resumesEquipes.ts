export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SF: {
    texte: "Toujours invaincus : une défense mise à rude épreuve a une nouvelle fois tenu bon dans les derniers instants face à Washington, plaquant Jayden Daniels pour sceller la victoire.",
    forces: ['Ligne défensive dans les moments clés', 'Polyvalence offensive'],
    faiblesses: ['Fins de match parfois stressantes'],
  },
  KC: {
    texte: "Une mission accomplie de plus face aux Chargers malgré quelques difficultés en zone rouge et une interception de Mahomes — Kenneth Walker III a géré la rencontre après sa semaine de repos.",
    forces: ['Expérience', 'Jeu au sol (Walker III)'],
    faiblesses: ['Efficacité en zone rouge (ce match-ci)'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  BUF: {
    texte: "Encore une victoire arrachée dans le money-time grâce à une interception opportune et un coup d'éclat de James Cook — un style de jeu à risque, mais qui continue de payer pour les Bills.",
    forces: ['Quarterback (Josh Allen)', 'Fin de match'],
    faiblesses: ['Régularité sur l\'ensemble du match'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  MIN: {
    texte: "Toujours invaincus après leur semaine de repos, portés par des mouvements de personnel bienvenus — la défense reste d'élite et l'attaque commençait déjà à trouver ses marques avant la pause.",
    forces: ['Défense d\'élite', 'Turnovers créés'],
    faiblesses: ['Constance offensive (encore à confirmer sur la durée)'],
  },
  JAX: {
    texte: "Une défaite à la dernière seconde à Wembley face à Houston après avoir comblé un retard de 10 points — l'émergence de Travis Hunter des deux côtés du ballon est à suivre de près.",
    forces: ['Talent individuel (Travis Hunter)', 'Capacité à revenir au score'],
    faiblesses: ['Fins de match serrées'],
  },
  CIN: {
    texte: "Une semaine de repos qui profite au classement : une ligne défensive exceptionnelle porte le reste de l'unité, avant un choc attendu face aux rivaux de Baltimore.",
    forces: ['Ligne défensive'],
    faiblesses: ['Potentiel encore sous-exploité'],
  },
  NE: {
    texte: "Une équipe méconnaissable comparée au début de saison : la défense progresse chaque semaine et profite pleinement du retour en forme de Drake Maye, même si AJ Brown manque encore un peu de rythme.",
    forces: ['Progression défensive', 'Quarterback (Drake Maye)'],
    faiblesses: ['Alchimie encore à parfaire avec les receveurs'],
  },
  BAL: {
    texte: "Une défaite face à Cleveland qui illustre à quel point l'attaque dépend de Lamar Jackson, blessé — l'attaque menée par un remplaçant s'est essoufflée après un bon début de match.",
    forces: ['Culture de la gagne', 'Potentiel avec Lamar Jackson de retour'],
    faiblesses: ['Profondeur au poste de quarterback'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  DEN: {
    texte: "Une victoire laborieuse face à Seattle jeudi soir, les soucis offensifs persistant mais la défense opportuniste continuant de faire basculer les matchs en faveur des Broncos.",
    forces: ['Défense opportuniste'],
    faiblesses: ['Attaque (Bo Nix encore limité)'],
  },
  SEA: {
    texte: "Une lourde chute après la défaite face à Denver : Sam Darnold continue de perdre des ballons et la ligne offensive a été particulièrement faible, rendant l'attaque trop dépendante de Smith-Njigba.",
    forces: ['Défense'],
    faiblesses: ['Turnovers (Darnold)', 'Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  CHI: {
    texte: "Le retour en forme de Caleb Williams a tout débloqué : Loveland, Swift et Johnson ont tous brillé dans une victoire convaincante — reste à corriger les pénalités (12 pour 133 yards) et la gestion de fin de match.",
    forces: ['Quarterback (Caleb Williams de retour)', 'Profondeur offensive'],
    faiblesses: ['Discipline (pénalités)', 'Gestion de fin de match'],
  },
  DET: {
    texte: "Exemptés cette semaine, les Lions restent sur une large victoire face à Arizona — Jared Goff réalise une saison discrètement très efficace et la défense a enfin haussé son niveau.",
    forces: ['Quarterback (Goff)', 'Progression défensive'],
    faiblesses: ['Visibilité médiatique (équipe sous-estimée)'],
  },
  CAR: {
    texte: "Une victoire efficace face à Philadelphie (limités à 14 points) : Bryce Young continue de briller, Jalen Coker est de retour et Chuba Hubbard a retrouvé son meilleur niveau.",
    forces: ['Quarterback (Bryce Young)', 'Régularité sous Dave Canales'],
    faiblesses: ['Manque de reconnaissance (hors top 10)'],
  },
  HOU: {
    texte: "Une ascension spectaculaire : la défense retrouve de l'efficacité depuis que DeMeco Ryans a repris les rênes de l'attaque, et C.J. Stroud livre un football exceptionnel, candidat sérieux au MVP.",
    forces: ['Quarterback (C.J. Stroud)', 'Dynamique collective'],
    faiblesses: ['Défense (moins impénétrable qu\'avant)'],
  },
  GB: {
    texte: "Le succès défensif de la semaine 5 n'était pas un coup de chance : Dallas a été muselé et Jordan Love a fait le nécessaire en début de match pour une victoire tranquille.",
    forces: ['Défense confirmée', 'Jeu aérien (Love)'],
    faiblesses: ['Détails offensifs à peaufiner (retour de Jacobs attendu)'],
  },
  CLE: {
    texte: "Une défense impénétrable et une attaque qui trouve les ressources nécessaires : une nouvelle victoire crucial dans l'AFC Nord, pour la meilleure place à ce stade de la saison depuis 2014.",
    forces: ['Défense'],
    faiblesses: ['Attaque (dépend des circonstances)'],
  },
  PIT: {
    texte: "Une remontée spectaculaire en prolongation face à Tampa Bay portée par les passes courtes d'Aaron Rodgers et une belle prestation rookie de Germie Bernard, malgré l'absence de Jaylen Warren.",
    forces: ['Expérience (Rodgers)', 'Fin de match'],
    faiblesses: ['Premiers quarts-temps (souvent frustrants)'],
  },
  LV: {
    texte: "Un troisième revers consécutif après un début de saison parfait, mais une vraie combativité face à deux ténors de l'AFC (Chiefs, Bills) — Kirk Cousins continue de briller malgré les défaites.",
    forces: ['Quarterback (Kirk Cousins)', 'Combativité'],
    faiblesses: ['Capacité à conclure les matchs serrés'],
  },
  ATL: {
    texte: "Une défaite plus large que la physionomie du match ne le laisse penser : des problèmes de possession de balle et de turnovers ont créé un écart insurmontable face à Chicago.",
    forces: ["Coups d'éclat offensifs (Bijan Robinson)"],
    faiblesses: ['Turnovers', 'Possession de balle'],
  },
  NO: {
    texte: "Le match le plus fou de la semaine : menés 10-0, les Saints ont rendu une défense enfin efficace et un money-time chaotique mais payant face aux Giants pour arracher la victoire.",
    forces: ['Résilience', 'Défense retrouvée'],
    faiblesses: ['Gestion de fin de match (encore perfectible)'],
  },
  NYG: {
    texte: "L'expérience Jameis Winston semble avoir pris fin après deux interceptions fatales face aux Saints — JJ McCarthy a partiellement remis l'équipe sur les rails dans la défaite.",
    forces: ['Profondeur au poste de quarterback (McCarthy en option)'],
    faiblesses: ['Stabilité au poste de quarterback', 'Gestion de fin de match'],
  },
  ARI: {
    texte: "Une victoire impressionnante à Inglewood face aux Rams malgré l'absence de touchdown, de running back titulaire et de Marvin Harrison Jr. — une équipe frustrante mais capable de vrais coups d'éclat.",
    forces: ["Capacité à surprendre (surtout à l'extérieur)"],
    faiblesses: ['Constance d\'une semaine à l\'autre'],
  },
  WAS: {
    texte: "Une défaite qui décevra les supporters, mais une vraie combativité en 2e mi-temps dans un contexte hostile — Jayden Daniels a su trouver la faille malgré la sortie sur civière de Terry McLaurin.",
    forces: ['Quarterback (Jayden Daniels)', 'Caractère'],
    faiblesses: ['Profondeur au poste de receveur (après la blessure de McLaurin)'],
  },
  LA: {
    texte: "Un véritable désastre : défaite face à une équipe classée 31e la semaine précédente, absence prolongée de Davante Adams, pertes en ligne défensive et manque d'identité offensive.",
    forces: ['Expérience au poste de quarterback (Stafford)'],
    faiblesses: ['Identité offensive', 'Profondeur (blessures en cascade)'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  NYJ: {
    texte: "Retombés dans leurs travers après leur victoire de la semaine 5, une défaite d'un seul point face aux Patriots plus serrée que le score ne l'indique — le retour du rookie Omar Cooper Jr. est encourageant.",
    forces: ['Jeunes talents (Cooper Jr.)'],
    faiblesses: ['Profondeur au poste de running back (sans Breece Hall)'],
  },
  DAL: {
    texte: "Une confiance en chute libre : l'attaque, seul vrai atout de l'équipe, est devenue un fiasco face à Green Bay, et la défense reste un problème non résolu.",
    forces: ["Potentiel offensif (quand il fonctionne)"],
    faiblesses: ['Attaque en régression', 'Défense'],
  },
  TB: {
    texte: "Trois quarts-temps solides anéantis par un effondrement complet face à Pittsburgh — Jalon Daniels a bien joué dans l'ensemble, mais ses erreurs ont coûté cher dans cette 5e défaite en 6 matchs.",
    forces: ['Défense (sur une partie du match)'],
    faiblesses: ['Fins de match', 'Régularité du jeune QB'],
  },
  PHI: {
    texte: "Une saison qui tourne au désastre (Jalen Hurts indisponible pour le reste de l'année, départs sur la ligne offensive), mais une équipe qui reste compétitive malgré tout, y compris face à Carolina.",
    forces: ['Combativité malgré l\'adversité'],
    faiblesses: ['Profondeur au poste de quarterback', 'Ligne offensive décimée'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  TEN: {
    texte: "Plus sans victoire ! Un bon jeu d'équipes spéciales, un léger regain au sol et quelques réceptions opportunes du rookie Carnell Tate ont permis aux Titans de décrocher leur premier succès.",
    forces: ['Équipes spéciales', 'Jeune talent (Carnell Tate)'],
    faiblesses: ['Attaque (toujours en construction)'],
  },
  IND: {
    texte: "Une défaite face à Tennessee qui a coûté son poste au directeur général Chris Ballard — pertes de balle, occasions manquées et manque de rigueur restent les problèmes de fond des Colts.",
    forces: ['Protection du ballon (Daniel Jones, relatif)'],
    faiblesses: ['Groupe de receveurs', 'Ligne offensive', 'Changement de direction'],
  },
  MIA: {
    texte: "Toujours sans victoire même après une semaine de repos supplémentaire — une progression lente mais réelle de semaine en semaine laisse entrevoir un premier succès à venir.",
    forces: ['Progression progressive'],
    faiblesses: ['Incapacité à conclure (0 victoire)'],
  },
  LAC: {
    texte: "Une prestation qui résume la saison : une passe magistrale de Herbert, un sabotage à un yard de la ligne d'en-but contre Kansas City, puis une interception catastrophique pour sceller la défaite.",
    forces: ['Jeu aérien (ponctuellement spectaculaire)'],
    faiblesses: ['Ligne offensive', 'Décisions en zone rouge'],
  },
}