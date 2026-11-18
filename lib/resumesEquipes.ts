export interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
  historique?: string
}

export const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SF: {
    texte: "Une victoire spectaculaire à Dallas malgré 40 points encaissés : l'attaque de Brock Purdy a brillé et la défense en a fait juste assez. NFL.com les considère toujours comme la meilleure équipe de la ligue.",
    forces: ['Attaque créative', 'Brock Purdy en grande forme', 'Défense globalement solide'],
    faiblesses: ['Défense moins dominante que prévu', 'Impact de Nick Bosa encore limité après sa blessure'],
  },
  BUF: {
    texte: "Une victoire sans éclat contre les Jets, mais Buffalo continue de gagner les matchs qu'on lui propose, avec le retour de DJ Moore et une défense plus cohérente.",
    forces: ['Josh Allen', 'Retour de DJ Moore', 'Défense plus cohérente'],
    faiblesses: ['Défense pas encore testée par une attaque explosive', 'Victoires récentes peu convaincantes'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  JAX: {
    texte: "Une large victoire 40-23 à Tennessee après une deadline active : NFL.com y voit l'une des équipes les plus complètes de la ligue.",
    forces: ['Trevor Lawrence', 'Parker Washington en receveur émergent', 'Bhayshul Tuten au sol', 'Défense solide'],
  },
  CIN: {
    texte: "Une victoire en prime time contre Pittsburgh : Joe Burrow signe la meilleure saison de sa carrière et la défense a étouffé l'attaque adverse.",
    forces: ['Joe Burrow', 'Duo Chase-Higgins', 'Dexter Lawrence en défense'],
    faiblesses: ['Jeu au sol inefficace'],
  },
  MIN: {
    texte: "Une victoire 30-10 à Green Bay : avec Kirk Cousins, l'attaque a trouvé la direction qui lui manquait. NFL.com parle désormais d'un vrai candidat au Super Bowl.",
    forces: ['Défense élite', 'Kirk Cousins retrouvé'],
    faiblesses: ['Attaque longtemps inconstante'],
  },
  CHI: {
    texte: "Une semaine de repos : Chicago recule de deux places simplement parce que d'autres équipes l'ont dépassée. Le retour sera relevé, avec Detroit et Jacksonville au programme.",
    forces: ['Bilan de 7-2', 'Confiance de NFL.com malgré le recul'],
    faiblesses: ['Division NFC Nord très disputée', 'Faiblesses apparues face à Tampa Bay'],
  },
  DEN: {
    texte: "Une semaine de repos pour Denver, qui a commencé à assembler des pièces offensives importantes. La défense ne relâche pas et le calendrier s'ouvre.",
    forces: ['Défense solide', 'Calendrier favorable'],
    faiblesses: ['Attaque encore irrégulière'],
  },
  DET: {
    texte: "Detroit recule d'une place à cause des mouvements autour d'eux. L'attaque reste l'une des plus régulières, mais la perte d'Aidan Hutchinson pour la saison inquiète.",
    forces: ['Attaque très régulière', 'Défense en progrès'],
    faiblesses: ['Hutchinson absent pour la saison'],
  },
  KC: {
    texte: "Une victoire à Atlanta marquée par une attaque aérienne explosive, l'arrivée de Josh Downs et la belle performance du rookie Emmett Johnson.",
    forces: ['Jeu aérien plus explosif', 'Rookie Emmett Johnson', 'Arrivée de Josh Downs'],
    faiblesses: ['Kenneth Walker III absent (blessure à l\'aine)'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  GB: {
    texte: "Une défaite 30-10 contre Minnesota : la dépendance aux gros jeux est devenue un point faible, dans la division la plus difficile du football.",
    forces: ['Jeu explosif'],
    faiblesses: ['Manque de régularité offensive', 'Lourde défaite contre un rival de division'],
  },
  SEA: {
    texte: "Une victoire à Las Vegas, avec une attaque qui s'améliore doucement (surtout au sol) et une défense étouffante. Semaine de repos avant un gros test contre San Francisco.",
    forces: ['Défense étouffante', 'Jeu au sol en progrès', 'Drew Lock solide en remplaçant'],
    faiblesses: ['Attaque encore en construction', 'Victoire contre un adversaire modeste'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  CLE: {
    texte: "Une remontée face à Houston, conclue par un touchdown décisif en fin de match. NFL.com, d'abord sceptique, commence à y croire.",
    forces: ['Couverture défensive agressive', 'Mobilité de Deshaun Watson', 'Résilience en fin de match'],
  },
  PIT: {
    texte: "Une défaite à Cincinnati en prime time alors que Pittsburgh avait eu une semaine de repos. NFL.com y voit un rappel des limites de l'équipe.",
    forces: ['Bilan de 6-3'],
    faiblesses: ['Attaque en difficulté', 'Défense dominée par les Bengals'],
  },
  TB: {
    texte: "Pas de match cette semaine : Tampa Bay reste le favori de NFL.com pour remporter une division NFC Sud moyenne.",
    forces: ['Défense qui chasse', 'Jeu au sol efficace'],
    faiblesses: ['Baker Mayfield doit limiter les risques', 'Bilan de 3-6'],
  },
  LA: {
    texte: "Une 4e victoire de suite, à Arizona, malgré l'absence de presque tous les atouts offensifs. NFL.com reste prudent avant des matchs contre Green Bay, Kansas City et San Francisco.",
    forces: ['Capacité à s\'adapter malgré les absences', 'Série de 4 victoires'],
    faiblesses: ['Presque tous les joueurs offensifs clés absents', 'Limitée face à de meilleures équipes'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  NYG: {
    texte: "Une défaite jeudi soir contre Washington après avoir laissé filer le match. Une équipe capable de beaux moments, mais pas assez régulière.",
    forces: ['Cam Skattebo', 'Deonte Banks en défense'],
    faiblesses: ['Manque de régularité', 'Avances gâchées'],
  },
  HOU: {
    texte: "Une avance de 17 points gâchée à Cleveland : la remontée après un début de saison 0-4 est freinée.",
    forces: ['Bon retour de C.J. Stroud sur la saison'],
    faiblesses: ['Fins de match ratées', 'Stroud inefficace en seconde mi-temps'],
  },
  DAL: {
    texte: "Une défaite contre San Francisco dans un match à gros score : l'attaque reste bonne, mais la défense n'arrête personne.",
    forces: ['Attaque capable de garder Dallas dans la course'],
    faiblesses: ['Défense très fragile'],
  },
  CAR: {
    texte: "Une victoire à La Nouvelle-Orléans malgré 17 pénalités. Carolina aurait dû l'emporter plus largement.",
    forces: ['Chuba Hubbard décisif dans les moments clés'],
    faiblesses: ['Indiscipline (17 pénalités)'],
  },
  WAS: {
    texte: "Une revanche jeudi soir avec une victoire en remontée contre les Giants. La saison reste vivante grâce à une division faible.",
    forces: ['Capacité de remontée'],
    faiblesses: ['Désorganisation', 'Contexte instable (licenciements)'],
  },
  LV: {
    texte: "Début de l'ère Fernando Mendoza : un beau premier drive, puis une attaque à -17 yards en seconde mi-temps face à Seattle.",
    forces: ['Fernando Mendoza, touchdown dès son premier drive'],
    faiblesses: ['Attaque paralysée en seconde mi-temps', 'Calendrier difficile (Seattle, Denver, Cleveland)'],
  },
  ATL: {
    texte: "Une défaite contre Kansas City : 461 yards concédés et presque aucune résistance. NFL.com ne retrouve plus la bonne équipe du début de saison.",
    faiblesses: ['Défense dépassée (461 yards concédés)', 'Bijan Robinson pas assez utilisé comme pivot'],
  },
  NE: {
    texte: "Un gros recul de 8 places : Drake Maye est absent pour une durée indéterminée, A.J. Brown est touché une 3e fois cette saison, et la défense est mauvaise.",
    faiblesses: ['Défense faible', 'Drake Maye absent', 'Blessures (A.J. Brown)'],
  },
  TEN: {
    texte: "Une défaite 40-23 contre Jacksonville. Tennessee reste compétitif et Cam Ward progresse.",
    forces: ['Cam Ward en progression', 'Matchs serrés contre de bons adversaires'],
    faiblesses: ['Bilan de 1-8'],
  },
  NO: {
    texte: "Une défaite contre Carolina pour une équipe sans direction claire, malgré un bon Tyler Shough et le rookie Jordyn Tyson.",
    forces: ['Tyler Shough', 'Rookie Jordyn Tyson'],
    faiblesses: ['Effectif décevant autour de ces deux joueurs'],
  },
  NYJ: {
    texte: "Une défaite contre Buffalo : les Jets n'ont pas marqué de touchdown depuis deux semaines.",
    forces: ['Braelon Allen'],
    faiblesses: ['Aucun touchdown en deux matchs', 'Défense perméable (35 et 31 points concédés)'],
  },
  LAC: {
    texte: "Première victoire de la saison, à Baltimore, en gagnant la bataille des turnovers. Justin Herbert n'a pas lancé d'interception pour la première fois cette saison.",
    forces: ['Omarion Hampton enfin impliqué', 'Justin Herbert sans interception'],
    faiblesses: ['Bilan de 1-8'],
  },
  BAL: {
    texte: "Une défaite à domicile contre des Chargers jusque-là sans victoire : Jacoby Brissett a lancé 49 passes. NFL.com parle d'un nouveau plus bas pour la franchise.",
    faiblesses: ['Plan de jeu trop axé sur la passe', 'Bilan de 4-6'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  IND: {
    texte: "Une victoire contre Miami, dans un match entre deux des pires équipes de la ligue, plutôt due à la faiblesse de l'adversaire.",
    forces: ['Quelques bonnes choses en défense', 'Rookie Seth McGowan'],
    faiblesses: ['Daniel Jones en régression'],
  },
  MIA: {
    texte: "Une défaite contre Indianapolis avec Kyle McCord titulaire : un fumble ramené en touchdown et deux possessions gâchées en fin de match.",
    forces: ['Jeunes prometteurs (Caleb Douglas, Jacob Rodriguez, Ollie Gordon II)'],
    faiblesses: ['Poste de quarterback', 'Bilan de 1-8'],
  },
  ARI: {
    texte: "Une défaite contre les Rams lors du premier match de Carson Beck, avec très peu de résistance.",
    faiblesses: ['Peu de combativité', 'Bilan de 3-7'],
  },
  PHI: {
    texte: "Une semaine de repos pour une équipe qui regarde vers l'avenir après l'échange de Jordan Davis. NFL.com se demande si elle gagnera encore un match cette saison.",
    faiblesses: ['Bilan de 2-7'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
}