import RulesAccordion from '@/components/RulesAccordion'

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 10,
  fontSize: 13,
}
const thStyle: React.CSSProperties = {
  padding: '8px 6px',
  textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.6)',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
const tdStyle: React.CSSProperties = {
  padding: '8px 6px',
  textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}
const tdPoints: React.CSSProperties = { ...tdStyle, color: '#4ee892', fontWeight: 700, textAlign: 'right' }

export default function ReglesPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Regles.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px 100px', position: 'relative' }}>
      <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 4 }}>📖 Règles du jeu</h1>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32 }}>
        Tout ce qu'il faut savoir pour pronostiquer
      </p>

      {/* PRINCIPE DE BASE */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(200,53,46,0.15), rgba(200,53,46,0.05))',
          border: '1px solid rgba(200,53,46,0.35)',
          borderRadius: 10,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>🏈 Le principe</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: '6px 0' }}>
          Chaque semaine, tu pronostiques le vainqueur de chaque match NFL.{' '}
          <strong>1 bon pronostic = 1 point.</strong> C'est tout — simple à comprendre en 30 secondes.
        </p>
      </div>

      {/* BONUS HEBDO */}
      <RulesAccordion title="🎯 Bonus hebdomadaires" defaultOpen>
        <p>
          En plus d'1 point par bon pronostic, tu gagnes des bonus selon ton score de la semaine. Le seuil s'adapte
          automatiquement au nombre de matchs (une semaine "normale" a 16 matchs, mais peut en avoir moins à cause
          des semaines de repos des équipes) :
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Matchs dans la semaine</th>
              <th style={thStyle}>+1 pt dès</th>
              <th style={thStyle}>+2 pts dès</th>
              <th style={thStyle}>Perfect week</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>16 matchs</td>
              <td style={tdPoints}>6</td>
              <td style={tdPoints}>12</td>
              <td style={tdPoints}>+5</td>
            </tr>
            <tr>
              <td style={tdStyle}>15 matchs</td>
              <td style={tdPoints}>6</td>
              <td style={tdPoints}>11</td>
              <td style={tdPoints}>+5</td>
            </tr>
            <tr>
              <td style={tdStyle}>14 matchs</td>
              <td style={tdPoints}>5</td>
              <td style={tdPoints}>10</td>
              <td style={tdPoints}>+4</td>
            </tr>
            <tr>
              <td style={tdStyle}>13 matchs</td>
              <td style={tdPoints}>5</td>
              <td style={tdPoints}>9</td>
              <td style={tdPoints}>+4</td>
            </tr>
          </tbody>
        </table>
      </RulesAccordion>

      {/* PLAYOFFS */}
      <RulesAccordion title="🏆 Barème des playoffs">
        <p>Moins de matchs = chaque pronostic vaut plus cher.</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Tour</th>
              <th style={thStyle}>Par bon pronostic</th>
              <th style={thStyle}>Perfect round</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Wild Card (6 matchs)</td>
              <td style={tdPoints}>2 pts</td>
              <td style={tdPoints}>+4</td>
            </tr>
            <tr>
              <td style={tdStyle}>Divisionnaire (4 matchs)</td>
              <td style={tdPoints}>2 pts</td>
              <td style={tdPoints}>+4</td>
            </tr>
            <tr>
              <td style={tdStyle}>Finale de Conférence (2 matchs)</td>
              <td style={tdPoints}>4 pts</td>
              <td style={tdPoints}>+2</td>
            </tr>
            <tr>
              <td style={tdStyle}>Super Bowl (1 match)</td>
              <td style={tdPoints}>5 pts</td>
              <td style={tdStyle}>—</td>
            </tr>
          </tbody>
        </table>
      </RulesAccordion>

      {/* PRONOSTICS BONUS SUPER BOWL */}
      <RulesAccordion title="🏈 Les 2 pronostics Super Bowl anticipés" badge="jusqu'à 13 pts">
        <p>
          Deux pronostics indépendants sur le vainqueur du Super Bowl, à des moments différents de la saison — en
          plus du pronostic classique sur le match lui-même (voir barème des playoffs ci-dessus). Tu peux te tromper
          sur l'un et te rattraper sur l'autre.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Moment</th>
              <th style={thStyle}>Parmi</th>
              <th style={thStyle}>Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Avant la Week 1</td>
              <td style={tdStyle}>Les 32 équipes</td>
              <td style={tdPoints}>+8</td>
            </tr>
            <tr>
              <td style={tdStyle}>Avant le Wild Card</td>
              <td style={tdStyle}>Les 14 équipes qualifiées</td>
              <td style={tdPoints}>+5</td>
            </tr>
          </tbody>
        </table>
      </RulesAccordion>

      {/* MVP */}
      <RulesAccordion title="⭐ Pronostic MVP">
        <p>
          Avant la Week 1, en même temps que ton 1er pronostic Super Bowl, tu désignes le joueur qui sera élu MVP de
          la saison.
        </p>
        <p>
          <strong style={{ color: '#4ee892' }}>+8 points</strong> si bon, comptés en fin de saison.
        </p>
      </RulesAccordion>

      {/* VERROUILLAGE / VISIBILITÉ */}
      <RulesAccordion title="🔒 Verrouillage & visibilité">
        <ul style={{ margin: '6px 0', paddingLeft: 20 }}>
          <li style={{ marginBottom: 4 }}>
            Chaque match se verrouille à son propre coup d'envoi — pas de verrouillage global en début de semaine.
            Tu peux ajuster tes pronostics du dimanche même si le match du jeudi est déjà joué.
          </li>
          <li style={{ marginBottom: 4 }}>
            Avant le coup d'envoi d'un match, personne ne voit les pronostics de personne — même pas les tiens dans
            la liste publique.
          </li>
          <li style={{ marginBottom: 4 }}>
            Dès le coup d'envoi, les pronostics de ce match (et uniquement celui-ci) deviennent visibles pour toute
            la ligue, et figés.
          </li>
        </ul>
      </RulesAccordion>

      {/* ÉGALITÉS */}
      <RulesAccordion title="⚖️ En cas d'égalité">
        <p>Le classement se départage dans cet ordre :</p>
        <ul style={{ margin: '6px 0', paddingLeft: 20 }}>
          <li style={{ marginBottom: 4 }}>Score total</li>
          <li style={{ marginBottom: 4 }}>Nombre de semaines gagnées</li>
          <li style={{ marginBottom: 4 }}>Nombre de semaines parfaites</li>
        </ul>
      </RulesAccordion>

      {/* LIGUES */}
      <RulesAccordion title="🏟️ Un compte, plusieurs ligues">
        <p>
          Tu gardes un seul compte et peux rejoindre autant de ligues que tu veux avec tes amis. Pas besoin de
          multi-comptes.
        </p>
      </RulesAccordion>
      </div>
    </div>
  )
}