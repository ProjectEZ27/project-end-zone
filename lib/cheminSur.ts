/**
 * Sécurité des redirections : n'accepte qu'un chemin interne au site (ex. « /leagues/join/ABCD »).
 * Tout le reste (adresse complète, « //site.com », « @site.com »…) est remplacé par la page par défaut.
 * Empêche qu'un lien fabriqué renvoie le joueur vers un autre site après sa connexion.
 */
export function cheminSur(next: string | null | undefined, defaut = '/'): string {
  if (!next) return defaut
  const chemin = String(next).trim()
  if (!chemin.startsWith('/')) return defaut
  if (chemin.startsWith('//')) return defaut
  if (chemin.includes('\\') || chemin.includes('@') || chemin.includes('://')) return defaut
  // Pas de caractères invisibles (retour à la ligne, tabulation…)
  if (/[\u0000-\u001f\u007f]/.test(chemin)) return defaut
  if (chemin.length > 300) return defaut
  return chemin
}