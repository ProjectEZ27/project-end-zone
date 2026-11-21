// Les ligues de région : code (utilisé en base et dans le nom de l'image) + nom affiché
export const REGIONS = [
  { code: 'auvergne-rhone-alpes', nom: 'Auvergne-Rhône-Alpes' },
  { code: 'bourgogne-franche-comte', nom: 'Bourgogne-Franche-Comté' },
  { code: 'bretagne', nom: 'Bretagne' },
  { code: 'centre-val-de-loire', nom: 'Centre-Val de Loire' },
  { code: 'corse', nom: 'Corse' },
  { code: 'grand-est', nom: 'Grand Est' },
  { code: 'hauts-de-france', nom: 'Hauts-de-France' },
  { code: 'ile-de-france', nom: 'Île-de-France' },
  { code: 'normandie', nom: 'Normandie' },
  { code: 'nouvelle-aquitaine', nom: 'Nouvelle-Aquitaine' },
  { code: 'occitanie', nom: 'Occitanie' },
  { code: 'pays-de-la-loire', nom: 'Pays de la Loire' },
  { code: 'provence-alpes-cote-dazur', nom: "Provence-Alpes-Côte d'Azur" },
  { code: 'guadeloupe', nom: 'Guadeloupe' },
  { code: 'martinique', nom: 'Martinique' },
  { code: 'guyane', nom: 'Guyane' },
  { code: 'la-reunion', nom: 'La Réunion' },
  { code: 'mayotte', nom: 'Mayotte' },
  { code: 'hors-france', nom: 'Hors France' },
] as const

export function nomRegion(code: string | null | undefined) {
  return REGIONS.find((r) => r.code === code)?.nom ?? null
}