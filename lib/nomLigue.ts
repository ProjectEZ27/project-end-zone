export const NOM_LIGUE_MAX = 40

/** Nettoie un nom de ligue (espaces en trop) et dit s'il est acceptable. */
export function verifierNomLigue(brut: unknown): { ok: true; nom: string } | { ok: false; message: string } {
  const nom = String(brut ?? '').replace(/\s+/g, ' ').trim()
  if (nom.length < 2) return { ok: false, message: 'Le nom de la ligue doit faire au moins 2 caractères' }
  if (nom.length > NOM_LIGUE_MAX) return { ok: false, message: `Le nom de la ligue ne peut pas dépasser ${NOM_LIGUE_MAX} caractères` }
  if (/[<>]/.test(nom) || /[\u0000-\u001f\u007f]/.test(nom)) return { ok: false, message: 'Le nom contient un caractère interdit' }
  return { ok: true, nom }
}

export const MESSAGE_NOM_PRIS = 'Ce nom de ligue est déjà pris, choisis-en un autre'