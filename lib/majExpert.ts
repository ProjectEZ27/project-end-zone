// Affiche une date de mise à jour en français, à l'heure de Paris : « mercredi 11 novembre à 19h05 »
export function formaterMajExpert(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const parts = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Europe/Paris',
  }).formatToParts(d)
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? ''
  return `${p('weekday')} ${p('day')} ${p('month')} à ${p('hour')}h${p('minute')}`
}