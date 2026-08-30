const TRADUCTIONS: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'User already registered': 'Un compte existe déjà avec cet email',
  'Email not confirmed': 'Confirme d\'abord ton email avant de te connecter (pense à vérifier ton dossier spam / courriers indésirables)',
  'Password should be at least 6 characters': 'Le mot de passe doit faire au moins 6 caractères',
  'Unable to validate email address: invalid format': 'Adresse email invalide',
  'Email rate limit exceeded': 'Trop de tentatives, réessaie dans quelques minutes',
  'For security purposes, you can only request this after': 'Merci de patienter avant de réessayer',
}

export function traduireErreurAuth(messageOriginal: string): string {
  if (TRADUCTIONS[messageOriginal]) {
    return TRADUCTIONS[messageOriginal]
  }
  // Recherche partielle pour les messages qui varient légèrement (ex. avec un nombre de secondes inclus)
  const trouve = Object.entries(TRADUCTIONS).find(([cle]) => messageOriginal.includes(cle))
  return trouve ? trouve[1] : messageOriginal
}