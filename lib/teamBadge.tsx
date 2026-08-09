// Palette "maison" (pas les couleurs officielles NFL), assignée de façon fixe par équipe
const COULEURS_EQUIPES: Record<string, string> = {
  ARI: '#8B2E2E', ATL: '#B23A48', BAL: '#3A3A5C', BUF: '#2F5F8F',
  CAR: '#2F6F4E', CHI: '#4A3B2C', CIN: '#C8352E', CLE: '#7A4A2C',
  DAL: '#3A5A8A', DEN: '#C89B3D', DET: '#3A5A9A', GB: '#3A6B4A',
  HOU: '#3A2C5A', IND: '#2F4A7A', JAX: '#2C6B6B', KC: '#B23028',
  LA: '#3A4A7A', LAC: '#2F7A9A', LV: '#3A3A3A', MIA: '#2C8A8A',
  MIN: '#5A3A8A', NE: '#2F3A5A', NO: '#8A6B2C', NYG: '#2C5A8A',
  NYJ: '#2C5A3A', PHI: '#2C4A3A', PIT: '#7A6B2C', SEA: '#2C5A5A',
  SF: '#B23028', TB: '#7A2C2C', TEN: '#3A5A6B', WAS: '#5A2C2C',
}

export const NOMS_EQUIPES: Record<string, string> = {
  ARI: 'Cardinals', ATL: 'Falcons', BAL: 'Ravens', BUF: 'Bills',
  CAR: 'Panthers', CHI: 'Bears', CIN: 'Bengals', CLE: 'Browns',
  DAL: 'Cowboys', DEN: 'Broncos', DET: 'Lions', GB: 'Packers',
  HOU: 'Texans', IND: 'Colts', JAX: 'Jaguars', KC: 'Chiefs',
  LA: 'Rams', LAC: 'Chargers', LV: 'Raiders', MIA: 'Dolphins',
  MIN: 'Vikings', NE: 'Patriots', NO: 'Saints', NYG: 'Giants',
  NYJ: 'Jets', PHI: 'Eagles', PIT: 'Steelers', SEA: 'Seahawks',
  SF: '49ers', TB: 'Buccaneers', TEN: 'Titans', WAS: 'Commanders',
}

export function TeamBadge({ code, size = 40 }: { code: string; size?: number }) {
  const couleur = COULEURS_EQUIPES[code] ?? '#555'

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: couleur,
        color: '#F2F4F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.32,
        fontFamily: 'Oswald, sans-serif',
        flexShrink: 0,
      }}
    >
      {code}
    </div>
  )
}