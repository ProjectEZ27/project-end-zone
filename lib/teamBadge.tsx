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
  return (
    <img
      src={`/badges/${code}.png`}
      alt={code}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  )
}