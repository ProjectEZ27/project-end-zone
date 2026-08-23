import styles from './MatchLine.module.css'
import { getCouleurEquipe } from '@/lib/teamColors'

interface MatchHeaderReadOnlyProps {
  team1: { code: string; name: string }
  team2: { code: string; name: string }
  finished: boolean
  equipeGagnante?: string | null
}

export default function MatchHeaderReadOnly({ team1, team2, finished, equipeGagnante }: MatchHeaderReadOnlyProps) {
  const color1 = getCouleurEquipe(team1.code)
  const color2 = getCouleurEquipe(team2.code)

  const team1EstGagnant = finished && equipeGagnante === team1.code
  const team2EstGagnant = finished && equipeGagnante === team2.code

  const matchClasses = [styles.match, finished ? styles.finished : ''].filter(Boolean).join(' ')

  const cssVars = {
    '--t1-primary': color1.primary,
    '--t1-rgb': color1.primaryRgb,
    '--t1-dark': color1.dark,
    '--t2-primary': color2.primary,
    '--t2-rgb': color2.primaryRgb,
    '--t2-dark': color2.dark,
  } as React.CSSProperties

  const teamLeftClasses = [
    styles.team,
    styles.teamLeft,
    team1EstGagnant ? styles.winner : '',
    finished && team2EstGagnant ? styles.loser : '',
  ].filter(Boolean).join(' ')

  const teamRightClasses = [
    styles.team,
    styles.teamRight,
    team2EstGagnant ? styles.winner : '',
    finished && team1EstGagnant ? styles.loser : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={matchClasses} style={cssVars}>
      <div className={teamLeftClasses}>
        <div className={styles.teamContent}>
          <div>
            <div className={styles.teamCode}>{team1.code}</div>
            <div className={styles.teamName}>{team1.name}</div>
          </div>
        </div>
      </div>

      <div className={styles.vs}>VS</div>

      <div className={teamRightClasses}>
        <div className={styles.teamContent}>
          <div>
            <div className={styles.teamCode}>{team2.code}</div>
            <div className={styles.teamName}>{team2.name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}