/*
 * Paliers de taille des ligues.
 * Première saison : seul le palier gratuit (jusqu'à 50 joueurs) est ouvert.
 * Les autres seront payants ; les tarifs seront ajoutés ici (champ `prix`) plus tard.
 */
export type PalierLigue = {
  id: string
  libelle: string
  max: number | null // null = pas de limite précise (sur demande)
  gratuit: boolean
  prix?: string // ex. '19 €' — à renseigner plus tard
}
 
export const PALIERS_LIGUE: PalierLigue[] = [
  { id: 'p50', libelle: "Jusqu'à 50 joueurs", max: 50, gratuit: true },
  { id: 'p100', libelle: "Jusqu'à 100 joueurs", max: 100, gratuit: false },
  { id: 'p300', libelle: "Jusqu'à 300 joueurs", max: 300, gratuit: false },
  { id: 'p500', libelle: "Jusqu'à 500 joueurs", max: 500, gratuit: false },
  { id: 'p500plus', libelle: 'Plus de 500 joueurs', max: null, gratuit: false },
]
 
/** Taille maximale d'une ligue gratuite. */
export const TAILLE_MAX_GRATUITE = 50
 