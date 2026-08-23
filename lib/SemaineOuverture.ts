/**
 * Calcule la date d'ouverture des pronostics d'une semaine :
 * le mardi qui précède le premier coup d'envoi de la semaine.
 */
export function calculerDateOuverture(premierCoupEnvoi: string): Date {
  const premier = new Date(premierCoupEnvoi)
  const jour = premier.getUTCDay() // 0=dim, 1=lun, 2=mar, 3=mer, 4=jeu, 5=ven, 6=sam
  const joursDepuisMardi = (jour - 2 + 7) % 7

  const ouverture = new Date(premier)
  ouverture.setUTCDate(premier.getUTCDate() - joursDepuisMardi)
  ouverture.setUTCHours(0, 0, 0, 0)

  return ouverture
}

export function estSemaineOuverte(premierCoupEnvoi: string): boolean {
  return Date.now() >= calculerDateOuverture(premierCoupEnvoi).getTime()
}