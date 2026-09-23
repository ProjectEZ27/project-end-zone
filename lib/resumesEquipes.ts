export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SEA: {
    texte: "Invaincus après 2 semaines : Drew Lock a pris le relais de Darnold blessé et a dominé Arizona avec un jeu audacieux, épaulé par une défense toujours aussi solide.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Régularité en début de saison'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  BUF: {
    texte: "Une attaque devenue une vraie machine de guerre depuis la promotion de Joe Brady au poste d'entraîneur-chef, portée par un Josh Allen au sommet de son art.",
    forces: ['Quarterback', 'Jeu aérien', 'Rythme offensif'],
    faiblesses: ['Défense sur les gros matchs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  CIN: {
    texte: "Une défense métamorphosée qui a fait taire les doutes dès la semaine 2, portée par une ligne défensive retrouvée — une équipe complète des deux côtés du ballon.",
    forces: ['Jeu aérien', 'Capacité à revenir au score'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  KC: {
    texte: "Un Patrick Mahomes bel et bien de retour à son meilleur niveau, épaulé par un jeu au sol relancé grâce à l'apport de Kenneth Walker III.",
    forces: ['Fin de match', 'Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  BAL: {
    texte: "Une équipe qui a perdu le fil en 2e mi-temps face aux Saints après avoir mené facilement, en s'éloignant de son identité au sol autour de Derrick Henry.",
    forces: ['Attaque au sol', 'Quarterback mobile'],
    faiblesses: ['Régularité en playoffs'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  DEN: {
    texte: "Une attaque à deux visages mais efficace en fin de match, avec un arrêt décisif sur la ligne d'en-but pour compléter une remontée face aux Jaguars.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  SF: {
    texte: "Brock Purdy est injouable en ce début de saison — les défenses adverses n'ont toujours pas trouvé la parade, portant les 49ers vers un début de saison parfait.",
    forces: ['Polyvalence offensive', 'Ligne défensive'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  LA: {
    texte: "Privés de Myles Garrett et Puka Nacua, Stafford et Davante Adams ont quand même fait la différence face aux Giants, prouvant la profondeur de l'effectif.",
    forces: ['Régularité', 'Défense', 'Expérience au poste de quarterback'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  JAX: {
    texte: "La série d'invincibilité s'arrête là : incapables de conclure face à Denver, laissant les Broncos revenir au score en fin de match.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  PHI: {
    texte: "Une bataille acharnée face à des Titans coriaces, remportée grâce à un Jalen Hurts solide et une attaque emmenée par DeVonta Smith — la culture de champion a parlé.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  HOU: {
    texte: "0-2 après avoir affronté Buffalo et Cincinnati, deux adversaires coriaces — C.J. Stroud progresse mais l'attaque ne marque pas assez pour l'instant.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Expérience en playoffs'],
  },
  DAL: {
    texte: "Un vrai déclic offensif face à Washington, avec un Dak Prescott retrouvé et une complicité intacte avec CeeDee Lamb — la défense reste à confirmer.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense', 'Constance'],
  },
  DET: {
    texte: "Une attaque toujours aussi dangereuse, mais une défense qui reste le point faible — la combativité de Jared Goff n'a pas suffi face à Buffalo.",
    forces: ['Attaque au sol', 'Créativité offensive', 'Ligne offensive'],
    faiblesses: ["Matchs à l'extérieur"],
  },
  NO: {
    texte: "Une défense qui a tenu bon face à l'attaque des Ravens, et un Tyler Shough solide dans le money-time pour sceller une 2e remontée de la saison.",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  MIN: {
    texte: "Une attaque sans éclat mais une défense de Brian Flores redoutable, qui a semé la panique chez les Bears pour une 2e victoire consécutive.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive'],
  },
  CHI: {
    texte: "De la meilleure attaque de la ligue en semaine 1 à seulement 3 points marqués en semaine 2, aggravé par la blessure aux ischio-jambiers de Caleb Williams.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  CAR: {
    texte: "Une victoire arrachée face à Atlanta, portée par des jeunes défenseurs impressionnants et un Bryce Young de plus en plus convaincant.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  NE: {
    texte: "Une victoire qui cache mal les difficultés offensives : Drake Maye semble mal à l'aise, mais la défense a complètement étouffé Pittsburgh.",
    forces: ['Défense', 'Expérience collective'],
    faiblesses: ['Fin de match sur les tout gros matchs'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  IND: {
    texte: "0-2 malgré un match courageux poussé en prolongation face aux Chiefs — les faiblesses défensives et au poste de receveur commencent à peser.",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  GB: {
    texte: "Un jeu toujours brouillon (14 pénalités face aux Jets) mais du caractère pour arracher la victoire en prolongation malgré une attaque encore à construire.",
    forces: ['Défense (secondaire)', 'Progression au poste de quarterback'],
    faiblesses: ['Régularité offensive'],
  },
  NYG: {
    texte: "L'euphorie de la semaine 1 s'est vite dissipée : la blessure au genou de Jaxson Dart a plombé l'attaque face à des Rams portés par Davante Adams.",
    forces: ['Ligne défensive', 'Pression sur le QB'],
    faiblesses: ['Attaque'],
  },
  LV: {
    texte: "2-0 de façon inattendue sous les ordres de leur nouvel entraîneur, portés par une défense opportuniste et des joueurs de l'ombre qui se révèlent semaine après semaine.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  CLE: {
    texte: "Une belle réaction en 2e mi-temps face à Tampa Bay, avec une défense qui a rebondi après un premier match compliqué.",
    forces: ['Historique défensif'],
    faiblesses: ['Attaque'],
  },
  TB: {
    texte: "0-2 et une crise de confiance qui couve : Baker Mayfield peine à s'adapter au nouveau système offensif, et la défense n'est pas à la hauteur.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Une vraie identité d'équipe NFL sous Geno Smith, ternie par une gestion du temps discutable en fin de match qui a coûté la victoire face à Green Bay.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  PIT: {
    texte: "Une ligne défensive parmi les plus complètes de la ligue, mais une attaque catastrophique — Aaron Rodgers plus agressif mais toujours limité par sa mobilité.",
    forces: ['Défense', 'Discipline tactique'],
    faiblesses: ['Créativité offensive'],
  },
  TEN: {
    texte: "Toujours sans victoire, mais une vraie progression : les Titans ont livré une belle prestation face aux Eagles, à deux doigts de créer la surprise.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  WAS: {
    texte: "0-2 et une nouvelle blessure au coude de Jayden Daniels qui plombe une saison déjà compliquée, malgré une défense remaniée plutôt prometteuse.",
    forces: ['Audace offensive', 'Progression'],
    faiblesses: ['Expérience défensive'],
  },
  LAC: {
    texte: "0-2 avec un calendrier déjà difficile en vue — trop d'erreurs individuelles des deux côtés du ballon pour rivaliser malgré le bras de Justin Herbert.",
    forces: ['Équilibre offense/défense'],
    faiblesses: ['Manque de régularité'],
  },
  ARI: {
    texte: "L'euphorie de la victoire surprise en semaine 1 a vite laissé place à une défense étouffée par les champions en titre, limités à 151 yards au total.",
    forces: ["Coups d'éclat offensifs"],
    faiblesses: ['Régularité'],
  },
  ATL: {
    texte: "0-2 et une situation critique au poste de quarterback qui paralyse toute l'équipe — tous les espoirs se tournent vers le retour de Michael Penix Jr.",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  MIA: {
    texte: "0-2 malgré une possession de balle dominante face aux 49ers — l'attaque n'a pas su convertir ses opportunités, symbole d'une marge d'erreur trop mince pour l'instant.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
}