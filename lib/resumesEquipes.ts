export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  MIN: {
    texte: "Dernière équipe invaincue de la ligue après la semaine 7 : la défense de Brian Flores est d'élite et de plus en plus créative. Si l'attaque finit par suivre, Minnesota deviendra un sérieux favori au Super Bowl.",
    forces: ['Défense d\'élite', 'Créativité défensive'],
    faiblesses: ['Constance offensive'],
  },
  BUF: {
    texte: "Une place de gagnée malgré la semaine de repos, qui tombe bien pour DJ Moore, blessé. Des doutes persistent sur la défense, mais après la défaite des deux premiers, il n'y a aucune raison de faire descendre les Bills.",
    forces: ['Quarterback (Josh Allen)', 'Fin de match'],
    faiblesses: ['Défense', 'Blessures chez les receveurs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  SF: {
    texte: "Première défaite de la saison à Atlanta : les blessures ont fini par peser trop lourd, la défense a laissé les Falcons doubler le score et une rare erreur de Brock Purdy a été punie. La semaine de repos arrive au bon moment.",
    forces: ['Polyvalence offensive', 'Combativité'],
    faiblesses: ['Blessures en cascade'],
  },
  SEA: {
    texte: "Une réponse nette face aux Chiefs après une semaine de panique : Emanuel Wilson à 100 yards au sol, Jaxon Smith-Njigba toujours aussi dangereux et une défense qui a totalement bloqué Kansas City. Reste à confirmer la régularité.",
    forces: ['Défense', 'Jaxon Smith-Njigba', 'Équilibre retrouvé'],
    faiblesses: ['Turnovers (Darnold)'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  CIN: {
    texte: "Une équipe de plus en plus impressionnante : après une première mi-temps endormie à Baltimore, 35 points sans réponse après la pause, avec cinq touchdowns de suite. Un message envoyé à toute l'AFC.",
    forces: ['Deuxième mi-temps explosive', 'Joe Burrow en confiance'],
    faiblesses: ['Début de match poussif'],
  },
  JAX: {
    texte: "Une place perdue simplement à cause du jeu des autres après la semaine de repos suivant la défaite de dernière seconde à Londres. Un retour favorable face aux Colts, puis un vrai test à Baltimore jeudi soir en semaine 9.",
    forces: ['Talent individuel (Travis Hunter)', 'Capacité à revenir au score'],
    faiblesses: ['Fins de match serrées'],
  },
  KC: {
    texte: "Seattle a bouché Kenneth Walker III et limité les Chiefs à trois points : les lacunes offensives, masquées par son début de saison flamboyant, sont apparues. Un rappel à la réalité qui arrive mieux maintenant que plus tard.",
    forces: ['Expérience', 'Régularité en playoffs'],
    faiblesses: ['Dépendance au jeu au sol (Walker III)', 'Efficacité offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  DEN: {
    texte: "Une victoire convaincante face à Arizona : Bo Nix s'est souvenu qu'il pouvait courir (touchdown de 62 yards) et a trouvé RJ Harvey sur une passe-écran de 52 yards, pendant que la défense se renforce de semaine en semaine.",
    forces: ['Défense', 'Bo Nix mobile'],
    faiblesses: ['Régularité offensive'],
  },
  CHI: {
    texte: "Victoire jeudi soir en faisant simplement plus de grandes actions que l'adversaire : écran de touchdown pour Luther Burden III et passe en 3e et long de Caleb Williams vers Rome Odunze, tirée depuis sa propre zone d'en-but.",
    forces: ['Quarterback (Caleb Williams)', 'Grandes actions'],
    faiblesses: ['Discipline (pénalités)'],
  },
  NE: {
    texte: "Compétitifs à Chicago sur une semaine courte : Drake Maye a effacé une interception par un touchdown du même type, mais la défense n'a pas réussi les actions clés. Peu d'implication d'A.J. Brown pour son retour.",
    forces: ['Quarterback (Drake Maye)', 'Combativité'],
    faiblesses: ['Défense dans les moments décisifs', 'Intégration d\'A.J. Brown'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  DET: {
    texte: "Un des matchs les plus laids de la saison pour Detroit, un vrai combat de division face à Green Bay, finalement remporté. Les turnovers sont devenus un problème pour la première fois, mais le retour de Brian Branch a aidé la défense.",
    forces: ['Quarterback (Goff)', 'Retour de Brian Branch'],
    faiblesses: ['Turnovers'],
  },
  CLE: {
    texte: "Encore une victoire sur un field goal de dernière seconde (Andre Szmyt, le 2e d'affilée), arrachée aux Titans après avoir été menés 14-0. Les méthodes sont les mêmes, mais à 5-2 difficile d'argumenter contre les Browns.",
    forces: ['Défense', 'Fin de match', 'Résilience'],
    faiblesses: ['Jeu au sol', 'Attaque (relative)'],
  },
  ATL: {
    texte: "Victoire inspirée face aux 49ers : les Falcons ont su saisir leurs occasions autour de la mi-temps, avec une interception magnifique de Jessie Bates III. Michael Penix Jr. paraît très à l'aise, mais on ne sait toujours pas qui sont vraiment ces Falcons.",
    forces: ['Michael Penix Jr.', 'Agressivité défensive'],
    faiblesses: ['Irrégularité'],
  },
  PIT: {
    texte: "Victoire à Paris face à La Nouvelle-Orléans : Aaron Rodgers accepte désormais les ajustements de Mike McCarthy, avec Darnell Washington et Pat Freiermuth alignés ensemble pour casser la prévisibilité. 5-2, et ça ne ressemble plus à un hasard.",
    forces: ['Ajustements en cours de match', 'Expérience (Rodgers)'],
    faiblesses: ['Régularité d\'une semaine à l\'autre'],
  },
  GB: {
    texte: "Défaite serrée à Detroit, coûtée par deux field goals manqués du rookie Trey Smack, dans un match où les Packers auraient dû profiter d'une décision ratée adverse. Reste à voir ce que Josh Jacobs apportera au jeu au sol.",
    forces: ['Jeu aérien (Love)', 'Défense'],
    faiblesses: ['Jeu au sol', 'Botteur'],
  },
  BAL: {
    texte: "Une dégringolade : menés par Baltimore 13-0 à la mi-temps, les Ravens n'ont plus marqué après la pause pour la 2e semaine de suite, pendant que Cincinnati en a mis 35. Le problème dépasse le seul poste de quarterback.",
    forces: ['Culture de la gagne', 'Zay Flowers'],
    faiblesses: ['Avances dilapidées', 'Deuxièmes mi-temps'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  NYG: {
    texte: "J.J. McCarthy a mené les Giants à la victoire contre Houston, avec Malachi Fields qui s'affirme, un lien déjà solide avec Malik Nabers et un jeu au sol retrouvé. Une équipe absurde à regarder, mais divertissante.",
    forces: ['J.J. McCarthy', 'Jeu au sol retrouvé'],
    faiblesses: ['Instabilité (décisions de l\'entraîneur)'],
  },
  HOU: {
    texte: "Une nouvelle défaite difficile, Devin Singletary traversant la défense pour le touchdown gagnant : cette défense ne mérite plus sa réputation. C.J. Stroud garde les Texans compétitifs, avec une belle connexion vers Marvin Harrison Jr.",
    forces: ['Quarterback (C.J. Stroud)'],
    faiblesses: ['Défense contre la course', 'Marge d\'erreur réduite'],
  },
  TB: {
    texte: "Une vraie équipe de football qui prend forme : Carolina écrasé avec une défense étincelante (touchdown défensif, quatre turnovers) et 27 points d'avance à la mi-temps. Bucky Irving dépasse 100 yards pour la 2e fois en trois semaines.",
    forces: ['Défense opportuniste', 'Bucky Irving'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  CAR: {
    texte: "Toute la belle dynamique née de la victoire à Philadelphie s'est évaporée dès la mi-temps face à Tampa Bay : Bryce Young a été neutralisé et l'équipe a livré une prestation inhabituelle, laissant la porte ouverte à ses rivaux de division.",
    forces: ['Régularité habituelle sous Canales'],
    faiblesses: ['Prestation à domicile contre Tampa Bay'],
  },
  LA: {
    texte: "Un rebond indispensable à Las Vegas : 199 yards au sol avec Kyren Williams (99) et Blake Corum (93), et une défense solide en première mi-temps. Utile après le naufrage de la semaine 6, mais pas de quoi croire à un redressement complet.",
    forces: ['Jeu au sol', 'Expérience au poste de quarterback'],
    faiblesses: ['Défense en fin de match', 'Régularité'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  DAL: {
    texte: "L'attaque semble de retour : 416 yards contre la défense de Philadelphie lundi soir, Javonte Williams à plus de 150 yards au sol, les connexions avec CeeDee Lamb et George Pickens rétablies, et une interception plongeante de DeMarvion Overshown.",
    forces: ['Attaque (Prescott, Lamb, Pickens)', 'Jeu au sol'],
    faiblesses: ['Constance'],
  },
  NO: {
    texte: "Une défaite à Paris face à Pittsburgh qui était à portée : un field goal manqué de Daniel Carlson, un 4 et dehors sur la dernière possession, et seulement 18 yards nets au sol. L'équipe donne son maximum mais manque de ressources collectives.",
    forces: ['Effort collectif'],
    faiblesses: ['Jeu au sol inexistant', 'Marge d\'erreur'],
  },
  WAS: {
    texte: "Semaine de repos bienvenue avant une revanche face à Philadelphie. Jayden Daniels devra trouver de nouvelles solutions après la blessure de Terry McLaurin, absent pour la saison.",
    forces: ['Quarterback (Jayden Daniels)'],
    faiblesses: ['Perte de Terry McLaurin', 'Gestion de fin de match'],
  },
  LV: {
    texte: "Une 4e défaite de suite : le début de saison à 3-0 était un mirage. Les appels pour Fernando Mendoza vont grandir, même si les difficultés ne viennent pas vraiment de Kirk Cousins, et la défense n'a pas aidé.",
    forces: ['Quarterback expérimenté'],
    faiblesses: ['Défense', 'Jeu au sol'],
  },
  MIA: {
    texte: "Une première victoire ! Malik Willis avec un passer rating supérieur à 130, Ollie Gordon II qui court dur et Caleb Douglas auteur de deux touchdowns, dans un match survécu malgré un scénario catastrophe.",
    forces: ['Jeunes talents', 'Malik Willis en confiance'],
    faiblesses: ['Profondeur de l\'effectif'],
  },
  TEN: {
    texte: "Une équipe qui joue dur : battue 14-0 avant la mi-temps, elle a pourtant répondu par un touchdown en 4e quart-temps, avant que Deshaun Watson ne parcoure 55 yards en quatre jeux pour offrir la victoire aux Browns sur un field goal.",
    forces: ['Combativité', 'Attaque retrouvant un peu de vie'],
    faiblesses: ['Gestion des avances', 'Fin de match'],
  },
  PHI: {
    texte: "Défaite lundi soir face à Dallas : Saquon Barkley a probablement été remis en jeu trop vite, l'attaque n'a marqué que 21 points et la défense a déçu. Difficile de voir une sortie de crise sans une série de défaites.",
    forces: ['Compétitivité malgré l\'adversité'],
    faiblesses: ['Blessures en cascade', 'Défense en prime time'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NYJ: {
    texte: "Les détails continuent de coûter cher : interception en territoire adverse, puis un trois-et-dehors après un arrêt défensif décisif, avant d'encaisser le touchdown qui scelle le match à Miami. Dommage pour Braelon Allen, Omar Cooper Jr. et Mason Taylor.",
    forces: ['Jeunes talents'],
    faiblesses: ['Gestion des moments clés'],
  },
  ARI: {
    texte: "Une défaite trop prévisible face à Denver : attaque « chuck-and-pray » en 3e tentative, un touchdown de 62 yards concédé sur un scramble de Bo Nix, et une série en zone rouge parmi les pires de la saison. Jacoby Brissett malmené.",
    forces: ['Potentiel ponctuel à domicile'],
    faiblesses: ['Attaque en 3e tentative', 'Discipline défensive'],
  },
  IND: {
    texte: "Plus compétitifs que leur rang ne l'indique contre Minnesota (jeu au sol enfin productif, six points concédés en trois quarts-temps), mais l'interception de Daniel Jones au 4e quart-temps a tué leur dernière chance de briser la série de défaites.",
    forces: ['Jeu au sol retrouvé', 'Défense contre Minnesota'],
    faiblesses: ['Erreurs de Daniel Jones', 'Série de défaites'],
  },
  LAC: {
    texte: "Exempts en semaine 7, un cadeau pour ceux qui n'en pouvaient plus de leur football brouillon. On verra si cette semaine de repos apporte la moindre amélioration.",
    forces: ['Quarterback talentueux (Herbert)'],
    faiblesses: ['Ligne offensive', 'Attaque', 'Aucune victoire (0-6)'],
  },
}