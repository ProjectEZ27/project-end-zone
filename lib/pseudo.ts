export const PSEUDO_MIN = 2
export const PSEUDO_MAX = 20

/** Nettoie un pseudo (espaces en trop) et dit s'il est acceptable. */
export function verifierPseudo(brut: unknown): { ok: true; pseudo: string } | { ok: false; message: string } {
  const pseudo = String(brut ?? '').replace(/\s+/g, ' ').trim()
  if (pseudo.length < PSEUDO_MIN) {
    return { ok: false, message: `Le pseudo doit faire au moins ${PSEUDO_MIN} caractères` }
  }
  if (pseudo.length > PSEUDO_MAX) {
    return { ok: false, message: `Le pseudo ne peut pas dépasser ${PSEUDO_MAX} caractères` }
  }
  if (/[<>]/.test(pseudo) || /[\u0000-\u001f\u007f]/.test(pseudo)) {
    return { ok: false, message: 'Le pseudo contient un caractère interdit' }
  }
  return { ok: true, pseudo }
}