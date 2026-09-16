export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SEA: {
    texte: "Une défense qui a fait un vrai bond, difficile à percer sur l'ensemble d'une saison. En ouverture, elle a suffi à étouffer les Patriots (13-10) pendant qu'un secondaire retrouvé multipliait les prises de balle décisives.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Régularité en début de saison'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  LA: {
    texte: "Une équipe équilibrée, solide des deux côtés du ballon sur le papier, mais qui a connu un vrai coup d'arrêt en ouverture (défaite 27-7 face aux 49ers), avec une attaque muette sur la durée du match.",
    forces: ['Régularité', 'Défense', 'Expérience au poste de quarterback'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  BUF: {
    texte: "Un quarterback capable de gagner un match à lui seul, porté par un jeu aérien redoutable désormais épaulé par la recrue DJ Moore, décisif dès son premier match (victoire 36-31 face à Houston).",
    forces: ['Quarterback', 'Jeu aérien', 'Rythme offensif'],
    faiblesses: ['Défense sur les gros matchs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  BAL: {
    texte: "Une attaque revitalisée par son nouveau coordinateur offensif, capable pour la première fois de l'histoire de la franchise d'aligner un passeur à 300 yards, un receveur à 150 yards et un coureur à 100 yards dans le même match (victoire 41-23 face aux Colts).",
    forces: ['Attaque au sol', 'Quarterback mobile'],
    faiblesses: ['Régularité en playoffs'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  KC: {
    texte: "Le grand habitué des moments décisifs, qui a retrouvé un vrai jeu au sol dès son entrée en matière (victoire 31-10 face à Denver) grâce à l'apport immédiat de la recrue Kenneth Walker III.",
    forces: ['Fin de match', 'Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  PHI: {
    texte: "Un groupe complet avec du talent à tous les postes, qui a dû batailler pour arracher une courte victoire (24-22) face à Washington, sauvé par l'apport immédiat de la nouvelle recrue Dontayvion Wicks en sortie de banc.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NE: {
    texte: "Un collectif qu'on pensait retrouvé au sommet, mais qui s'est incliné d'un rien face à Seattle (10-13) en ouverture, fragilisé par la blessure de son receveur star A.J. Brown pour plusieurs semaines.",
    forces: ['Défense', 'Expérience collective'],
    faiblesses: ['Fin de match sur les tout gros matchs'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  DET: {
    texte: "L'attaque la plus créative de la ligue ces dernières saisons, illustrée par une victoire arrachée en prolongation face aux Saints (31-30) grâce à un jeu au sol à nouveau dominant.",
    forces: ['Attaque au sol', 'Créativité offensive', 'Ligne offensive'],
    faiblesses: ["Matchs à l'extérieur"],
  },
  DAL: {
    texte: "Une attaque explosive et spectaculaire capable de scorer vite, mais une défense qui a craqué dès l'ouverture face aux Giants (défaite 20-28), confirmant les doutes déjà présents sur ce secteur de jeu.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense', 'Constance'],
  },
  CIN: {
    texte: "Un duo quarterback-receveur parmi les plus dangereux de la ligue quand tout le monde est en bonne santé, capable de rattraper n'importe quel retard — comme lors de la victoire 33-27 face à Tampa Bay portée par une défense qui a provoqué plusieurs pertes de balle.",
    forces: ['Jeu aérien', 'Capacité à revenir au score'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  MIA: {
    texte: "Une attaque rapide et verticale sur le papier, mais qui a peiné dès l'ouverture (défaite 13-27 face à Las Vegas), sauvée en partie par l'éclosion inattendue d'une jeune recrue au poste de receveur.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
  HOU: {
    texte: "Un jeune noyau en pleine ascension, qui s'est incliné de justesse face à Buffalo (31-36) malgré une performance historique de sa nouvelle recrue au poste de running back, auteure de 3 touchdowns dès son premier match sous ce maillot.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Expérience en playoffs'],
  },
  PIT: {
    texte: "Une défense solide et disciplinée comme toujours sous cette organisation, portée par un nouveau coordinateur défensif dont le système a payé dès le premier match (victoire 20-13 face à Atlanta, avec un pick-six).",
    forces: ['Défense', 'Discipline tactique'],
    faiblesses: ['Créativité offensive'],
  },
  LAC: {
    texte: "Un jeu équilibré sur le papier, mais qui a manqué de régularité dès l'ouverture (défaite 14-26 face à Arizona), avec une ligne offensive remaniée encore en rodage.",
    forces: ['Équilibre offense/défense'],
    faiblesses: ['Manque de régularité'],
  },
  MIN: {
    texte: "Une défense agressive qui crée beaucoup de turnovers et change le cours des matchs, décisive lors de la victoire arrachée en fin de match face à Green Bay (39-22) grâce à un arrêt clé au 4e essai signé une jeune recrue à la ligne défensive.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive'],
  },
  DEN: {
    texte: "Une défense qu'on annonçait en progrès, mais qui a connu une ouverture compliquée face à Kansas City (défaite 10-31), sans grand-chose à se mettre sous la dent offensivement non plus.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  ARI: {
    texte: "Une attaque qui peut surprendre par séquences grâce à des joueurs athlétiques, confirmé dès l'ouverture avec une victoire solide face aux Chargers (26-14) portée par un 3e/4e receveur des plus efficaces.",
    forces: ["Coups d'éclat offensifs"],
    faiblesses: ['Régularité'],
  },
  TB: {
    texte: "Un jeu aérien précis et bien rodé avec un quarterback expérimenté, mais une défense qui a craqué dès l'ouverture face à Cincinnati (défaite 27-33), plombée par plusieurs pertes de balle en début de match.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Une attaque au sol costaude qui use les défenses adverses, mais qui n'a pas suffi lors d'une courte défaite face à Pittsburgh (13-20), sur un match plus serré que prévu malgré un quarterback remplaçant en face.",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une équipe rapide et dynamique capable de belles séquences, mais nettement débordée dès l'ouverture par Baltimore (défaite 23-41), avec une défense en méforme sur l'ensemble du match.",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  CHI: {
    texte: "Un jeune quarterback prometteur qui a explosé dès la semaine 1 dans un match à 96 points cumulés (victoire 59-37 face à Carolina), même si la défense inquiète déjà sérieusement.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Une défense qui peut faire mal à n'importe qui sur son jour, appuyée par une ligne offensive solide qui a permis une victoire maîtrisée face à Tennessee (23-10) dès le premier match de la saison.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  WAS: {
    texte: "Un collectif jeune et audacieux qui n'a pas peur de prendre des risques offensifs, à deux points d'un exploit face à Philadelphie (défaite 22-24 seulement) dès l'ouverture de la saison.",
    forces: ['Audace offensive', 'Progression'],
    faiblesses: ['Expérience défensive'],
  },
  NO: {
    texte: "Une équipe disciplinée sur le plan tactique qui ne se met pas en danger, mais qui a longtemps semblé dépassée avant un sursaut spectaculaire en fin de match face à Detroit (défaite 30-31 en prolongation seulement).",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  NYG: {
    texte: "Une ligne défensive qui peut poser des problèmes à n'importe qui grâce à sa pression sur le quarterback adverse, et une attaque plus solide que prévu dès l'ouverture avec une victoire de caractère face à Dallas (28-20) sous les ordres d'un nouvel entraîneur.",
    forces: ['Ligne défensive', 'Pression sur le QB'],
    faiblesses: ['Attaque'],
  },
  CAR: {
    texte: "Une attaque en progrès qui a explosé offensivement dès l'ouverture (59 points encaissés face à Chicago, pour 37 marqués), confirmant un potentiel réel mais une défense encore très perfectible.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  JAX: {
    texte: "Du talent individuel réel à plusieurs postes clés, avec une victoire nette dès l'ouverture face à Cleveland (34-10) portée par une ligne offensive remaniée déjà solide en protection.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  LV: {
    texte: "Une équipe en reconstruction qui a débuté la saison par une victoire encourageante face à Miami (27-13), avec une nouvelle recrue à la ligne défensive venue épauler efficacement le pass-rush.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  TEN: {
    texte: "Un jeu au sol qui reste une base solide sur laquelle s'appuyer, mais une défaite nette dès l'ouverture face aux Jets (10-23), avec toutefois une éclosion prometteuse d'un jeune linebacker recrue.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  CLE: {
    texte: "Une défense qui a longtemps fait la réputation de cette franchise, mais une attaque en pleine reconstruction nettement dominée dès l'ouverture par Jacksonville (défaite 10-34).",
    forces: ['Historique défensif'],
    faiblesses: ['Attaque'],
  },
  SF: {
    texte: "Une attaque polyvalente qui a retrouvé son identité au sol dès l'ouverture (victoire 27-7 face aux Rams, 5,8 yards de moyenne par course), avec un nouveau venu au poste de receveur immédiatement décisif malgré des blessures récurrentes qui restent à surveiller.",
    forces: ['Polyvalence offensive', 'Ligne défensive'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  GB: {
    texte: "Un jeune quarterback en pleine progression, mais un match d'ouverture manqué face à Minnesota (défaite 22-39), plombé par un choix tactique contesté en fin de rencontre malgré un secondaire qui reste solide.",
    forces: ['Défense (secondaire)', 'Progression au poste de quarterback'],
    faiblesses: ['Régularité offensive'],
  },
}