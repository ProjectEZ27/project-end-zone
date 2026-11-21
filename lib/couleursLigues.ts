// Couleurs proposées pour les ligues (la première, blanc, est la couleur par défaut)
export const COULEURS_LIGUES = [
  { code: '#ffffff', nom: 'Blanc' },
  { code: '#E8544C', nom: 'Rouge' },
  { code: '#EF9F27', nom: 'Orange' },
  { code: '#F2D13C', nom: 'Jaune' },
  { code: '#4ee892', nom: 'Vert' },
  { code: '#2fd0c6', nom: 'Turquoise' },
  { code: '#4aa3ff', nom: 'Bleu' },
  { code: '#a78bfa', nom: 'Violet' },
  { code: '#f472b6', nom: 'Rose' },
] as const

export const COULEUR_PAR_DEFAUT = '#ffffff'

export function couleurValide(code: unknown): string {
  return COULEURS_LIGUES.some((c) => c.code === code) ? (code as string) : COULEUR_PAR_DEFAUT
}