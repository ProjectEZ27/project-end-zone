import styles from './MatchLine.module.css'
import { selectPronostic } from '@/app/pronostics/actions'
import { getCouleurEquipe } from '@/lib/teamColors'

interface MatchLineProps {
  matchId: string
  team1: { code: string; name: string }
  team2: { code: string; name: string }
  score1?: number | null
  score2?: number | null
  selectedTeam?: string | null
  locked: boolean
  finished: boolean
  equipeGagnante?: string | null
}

function Streaks({ side }: { side: 'left' | 'right' }) {
  const positions = side === 'left'
    ? [
        { width: 90, top: 10, left: 2 },
        { width: 70, top: 26, left: 0 },
        { width: 75, top: 74, left: 1 },
        { width: 55, top: 90, left: 6 },
      ]
    : [
        { width: 90, top: 12, left: 88 },
        { width: 70, top: 28, left: 92 },
        { width: 75, top: 76, left: 87 },
        { width: 55, top: 92, left: 93 },
      ]

  return (
    <div className={`${styles.streaks} ${side === 'left' ? styles.streaksLeft : styles.streaksRight}`}>
      {positions.map((p, i) => (
        <span
          key={i}
          className={styles.streak}
          style={{ width: p.width, top: `${p.top}%`, left: `${p.left}%` }}
        />
      ))}
    </div>
  )
}

export default function MatchLine({
  matchId,
  team1,
  team2,
  score1,
  score2,
  selectedTeam,
  locked,
  finished,
  equipeGagnante,
}: MatchLineProps) {
  const color1 = getCouleurEquipe(team1.code)
  const color2 = getCouleurEquipe(team2.code)

  const chosenLeft = selectedTeam === team1.code
  const chosenRight = selectedTeam === team2.code
  const won = finished && !!selectedTeam && selectedTeam === equipeGagnante
  const lost = finished && !!selectedTeam && selectedTeam !== equipeGagnante

  const matchClasses = [
    styles.match,
    !finished && chosenLeft ? styles.selectedLeft : '',
    !finished && chosenRight ? styles.selectedRight : '',
    finished ? styles.finished : '',
    finished && won ? styles.won : '',
    finished && lost ? styles.lost : '',
  ].filter(Boolean).join(' ')

  const cssVars = {
    '--t1-primary': color1.primary,
    '--t1-rgb': color1.primaryRgb,
    '--t1-dark': color1.dark,
    '--t2-primary': color2.primary,
    '--t2-rgb': color2.primaryRgb,
    '--t2-dark': color2.dark,
  } as React.CSSProperties

  const canClick = !locked && !finished

  return (
    <div className={matchClasses} style={cssVars}>
      <Streaks side="left" />
      <Streaks side="right" />

      {finished && (
        <div className={styles.resultTag}>{won ? '✓ Gagné' : 'Perdu'}</div>
      )}

      <div className={`${styles.team} ${styles.teamLeft} ${finished && chosenLeft ? styles.chosen : ''} ${finished && chosenRight ? styles.notChosen : ''}`}>
        {canClick ? (
          <form action={selectPronostic} style={{ width: '100%', height: '100%' }}>
            <input type="hidden" name="match_id" value={matchId} />
            <input type="hidden" name="equipe" value={team1.code} />
            <button type="submit" className={styles.teamButton}>
              <div className={styles.teamContent}>
                <div>
                  <div className={styles.teamCode}>{team1.code}</div>
                  <div className={styles.teamName}>{team1.name}</div>
                </div>
              </div>
            </button>
          </form>
        ) : (
          <div className={styles.teamContent}>
            <div>
              <div className={styles.teamCode}>{team1.code}</div>
              <div className={styles.teamName}>{team1.name}</div>
              {finished && score1 != null && <div className={styles.score}>{score1}</div>}
            </div>
          </div>
        )}
        <div className={styles.check} />
      </div>

      <div className={styles.vs}>VS</div>

      <div className={`${styles.team} ${styles.teamRight} ${finished && chosenRight ? styles.chosen : ''} ${finished && chosenLeft ? styles.notChosen : ''}`}>
        {canClick ? (
          <form action={selectPronostic} style={{ width: '100%', height: '100%' }}>
            <input type="hidden" name="match_id" value={matchId} />
            <input type="hidden" name="equipe" value={team2.code} />
            <button type="submit" className={styles.teamButton}>
              <div className={styles.teamContent}>
                <div>
                  <div className={styles.teamCode}>{team2.code}</div>
                  <div className={styles.teamName}>{team2.name}</div>
                </div>
              </div>
            </button>
          </form>
        ) : (
          <div className={styles.teamContent}>
            <div>
              <div className={styles.teamCode}>{team2.code}</div>
              <div className={styles.teamName}>{team2.name}</div>
              {finished && score2 != null && <div className={styles.score}>{score2}</div>}
            </div>
          </div>
        )}
        <div className={styles.check} />
      </div>
    </div>
  )
}