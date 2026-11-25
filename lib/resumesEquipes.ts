export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SF: {
    texte: "Large victoire contre Minnesota à Mexico, avec un Brock Purdy impeccable et une défense qui monte en puissance grâce aux retours de blessés et à l'arrivée de DeForest Buckner. NFL.com la considère comme la meilleure équipe de la ligue.",
    forces: ['Brock Purdy très efficace', 'Défense en pleine montée en puissance', 'Retour de Mike Evans'],
  },
  BUF: {
    texte: "Les Bills enchaînent les victoires contre des adversaires moins costauds tout en testant des idées offensives en vue des playoffs. Gros test jeudi soir contre Kansas City.",
    forces: ['Régularité des victoires', 'Staff qui prépare déjà les playoffs'],
    faiblesses: ['Peu testés depuis un mois'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  DEN: {
    texte: "Nouvelle victoire à domicile contre Las Vegas, conclue par un pick-six de Ja'Quan McMillian. Bo Nix et l'attaque progressent doucement, de quoi viser un pic de forme en décembre et janvier.",
    forces: ['Défense décisive en fin de match', 'Attaque en progression'],
  },
  KC: {
    texte: "Patrick Mahomes retrouve son meilleur niveau, aidé par l'arrivée de Josh Downs et par Emmett Johnson au jeu au sol. Gros choc jeudi soir (Thanksgiving) à Buffalo.",
    forces: ['Mahomes en grande forme', 'Jeu au sol avec Emmett Johnson', 'Arrivée de Josh Downs'],
    faiblesses: ['Adversaires peu relevés ces dernières semaines'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  DET: {
    texte: "Victoire contre Tampa Bay : une équipe régulière et complète, dont l'attaque dépend de moins en moins de Jahmyr Gibbs, avec une défense qui progresse malgré de nouvelles blessures.",
    forces: ['Régularité', 'Attaque moins dépendante de Gibbs', 'Défense en progrès'],
    faiblesses: ['Nouvelles blessures en défense'],
  },
  JAX: {
    texte: "Défaite surprise à New York contre les Giants. La ligne offensive a montré ses limites et Trevor Lawrence a livré sa pire prestation de la saison ; un touchdown de Parker Washington a aussi été refusé.",
    forces: ['Équipe jugée très complète avant ce match'],
    faiblesses: ['Ligne offensive prise en défaut', 'Début de match difficile'],
  },
  CHI: {
    texte: "Victoire contre La Nouvelle-Orléans, avec trois sacks de Jeffery Simmons, arrivé récemment par transfert. Le jeu au sol reste à retrouver.",
    forces: ['Défense relevée par Jeffery Simmons'],
    faiblesses: ['Jeu au sol introuvable'],
  },
  MIN: {
    texte: "Lourde défaite à San Francisco, avec une interception de Kirk Cousins rapportée en touchdown. NFL.com y voit un rappel utile du niveau à atteindre avant les playoffs.",
    forces: ['Défense redoutée'],
    faiblesses: ['Arrivée de Cousins pas encore décisive', 'Défense dépassée par San Francisco'],
  },
  CIN: {
    texte: "Défaite à Washington au Monday Night malgré un field goal de 56 yards qui avait donné l'avantage : la défense a craqué à la fin face à Jayden Daniels. La course à la division AFC North se resserre.",
    forces: ['Attaque puissante avec Joe Burrow'],
    faiblesses: ['Défense qui craque en fin de match', 'Attaque gênée par la pluie'],
  },
  NYG: {
    texte: "Grosse victoire contre Jacksonville, qui les propulse dans le top 10 : ils ont gagné le duel physique et harcelé Trevor Lawrence. NFL.com reste prudent et dit ne pas encore leur faire confiance.",
    forces: ['Jeu physique', 'Pression sur le quarterback adverse'],
    faiblesses: ['Régularité encore à prouver'],
  },
  GB: {
    texte: "Semaine de repos après la défaite contre Minnesota à Lambeau Field. Deux matchs de retard dans la NFC North : déplacement chez les Rams mercredi soir.",
    forces: ['Repos bien placé'],
    faiblesses: ['Battus par Minnesota', 'Deux matchs de retard dans la division'],
  },
  SEA: {
    texte: "Deux victoires portées par la défense avant la semaine de repos. Gros test à San Francisco ensuite, avec un début de débat sur le poste de quarterback, même si l'équipe continue de soutenir Sam Darnold.",
    forces: ['Défense solide'],
    faiblesses: ['Situation de quarterback à surveiller'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  CLE: {
    texte: "Au repos après une victoire en remontée contre Houston. NFL.com se demande si ce succès lancera une seconde moitié de saison vers les playoffs.",
    forces: ['Esprit de remontée'],
  },
  LA: {
    texte: "Quatre victoires de suite, plutôt discrètes car peu spectaculaires. Le calendrier se durcit : Green Bay mercredi, puis San Francisco, deux fois Seattle, Kansas City, Dallas et Tampa Bay.",
    forces: ['Série de quatre victoires'],
    faiblesses: ['Calendrier très chargé', 'Victoires peu convaincantes'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  HOU: {
    texte: "Victoire nette jeudi soir contre Indianapolis. Avec le bilan de 4-6 et la défaite de Pittsburgh, les espoirs de playoffs restent vivants.",
    forces: ['Victoire dominante dans le derby'],
    faiblesses: ['Bilan négatif (4-6)'],
  },
  DAL: {
    texte: "Victoire 51-30 contre Tennessee. Dak Prescott est en feu et l'attaque est presque inarrêtable, mais la défense reste mauvaise, même si Quinnen Williams progresse.",
    forces: ['Dak Prescott en grande forme', 'Attaque très productive', 'Quinnen Williams en progression'],
    faiblesses: ['Défense qui encaisse trop de points'],
  },
  WAS: {
    texte: "Deuxième victoire de suite en prime time, cette fois contre Cincinnati : Washington (4-5-1) reste dans la course à la NFC East. Jayden Daniels progresse et la place de Dan Quinn est moins menacée.",
    forces: ['Jayden Daniels décisif en fin de match', 'Défense solide contre Cincinnati'],
  },
  CAR: {
    texte: "Victoire à domicile contre Baltimore dans un match fou et brouillon. Carolina est en tête de la NFC South à 5-5 et se déplace lundi soir à Tampa.",
    forces: ['Première de sa division'],
    faiblesses: ['Jeu brouillon'],
  },
  TB: {
    texte: "Défaite à Detroit : sans jeu de course, tout devient plus compliqué, et la défense, habituelle force de l'équipe, n'a pas contenu les Lions. Une équipe moyenne, mais toujours en course dans une NFC South faible.",
    forces: ['Défense, point fort habituel'],
    faiblesses: ['Jeu de course absent', 'Défense battue par Detroit'],
  },
  LV: {
    texte: "Défaite à Denver, mais dans un match divertissant : Fernando Mendoza a signé le premier gros match de sa carrière. L'attaque sait marquer, la défense est à améliorer.",
    forces: ['Attaque capable de marquer', 'Fernando Mendoza en progrès'],
    faiblesses: ['Défense'],
  },
  PIT: {
    texte: "Chute de huit places après la défaite à Philadelphie : attaque très faible, Aaron Rodgers a paru dépassé et DK Metcalf a été expulsé. NFL.com parle de l'équipe la plus instable avec un bilan positif.",
    faiblesses: ['Attaque très faible', 'Instabilité', 'Indiscipline (expulsion de DK Metcalf)'],
  },
  NYJ: {
    texte: "Victoire contre les Chargers avec trois touchdowns et un match très efficace de Geno Smith : aucun punt de la partie. Les Jets gagnent quatre places.",
    forces: ['Geno Smith efficace', 'Attaque en réussite ce week-end'],
    faiblesses: ['Bilan de 3-8'],
  },
  BAL: {
    texte: "Défaite à Carolina malgré une attaque retrouvée (Derrick Henry proche des 100 yards au sol). Quatre turnovers, dont un fumble dans l'en-but, ont coulé les Ravens.",
    forces: ['Derrick Henry de retour en forme'],
    faiblesses: ['Quatre turnovers', 'Gestion de fin de match'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  PHI: {
    texte: "Fin de la série de sept défaites : victoire contre Pittsburgh grâce à une défense retrouvée. Joe Milton III a su adoucir ses passes en fin de match.",
    forces: ['Défense retrouvée'],
    faiblesses: ['Bilan de 3-7'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NO: {
    texte: "Défaite à Chicago, mais quelques bons points : Tyler Shough, un nouveau match à 100 yards pour Chris Olave et aucun touchdown encaissé en seconde période. La fin de saison s'annonce incertaine.",
    forces: ['Chris Olave', 'Tyler Shough'],
    faiblesses: ['Bilan de 3-7'],
  },
  ATL: {
    texte: "Le début de saison flamboyant est loin. NFL.com estime qu'Atlanta aura de la chance de finir la saison avec six victoires.",
    faiblesses: ['Chute depuis le début de saison'],
  },
  NE: {
    texte: "Après la perte de Drake Maye, l'attaque est au plus bas et Tommy DeVito débutera en semaine 12. La défense déçoit aussi, et NFL.com a du mal à trouver de l'espoir.",
    faiblesses: ['Absence de Drake Maye', 'Défense en dessous des attentes'],
  },
  TEN: {
    texte: "Défaite à Dallas (51-30) après trois semaines compétitives : la défense a été dépassée, surtout depuis le départ de Jeffery Simmons. Cam Ward a toutefois réussi une passe de touchdown mémorable.",
    forces: ['Cam Ward capable de gestes spectaculaires'],
    faiblesses: ['Défense'],
  },
  LAC: {
    texte: "Défaite contre les Jets dans un match de seulement 12 possessions au total, avec un manque d'urgence vivement critiqué par NFL.com, notamment dans le dernier quart-temps.",
    faiblesses: ['Manque d\'urgence', 'Gestion du temps en fin de match'],
  },
  IND: {
    texte: "Largement dominés jeudi par Houston, les Colts ont aussi libéré Daniel Jones vendredi. Sept semaines difficiles les attendent.",
    faiblesses: ['Match non compétitif contre Houston', 'Départ de Daniel Jones'],
  },
  MIA: {
    texte: "Lourde défaite à Buffalo : l'attaque n'a pas dépassé 200 yards en quatre quarts et la défense est restée trop longtemps sur le terrain (36:45 de possession pour Buffalo).",
    forces: ['Défense combative'],
    faiblesses: ['Attaque sous les 200 yards'],
  },
  ARI: {
    texte: "Quatrième quarterback de la saison et 34 points encaissés deux semaines de suite. Les deux derniers mois s'annoncent durs.",
    faiblesses: ['Instabilité au poste de quarterback', 'Défense qui encaisse'],
  },
}