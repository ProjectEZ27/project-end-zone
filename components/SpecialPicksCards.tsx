import InfoToggle from './InfoToggle'
import ChoixEquipeSuperBowl from './ChoixEquipeSuperBowl'
import ChoixMvp from './ChoixMvp'

interface SpecialPick {
  type: string
  choix: string
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  textAlign: 'center',
  backgroundColor: 'rgba(22, 35, 63, 0.4)',
}

function SuperBowlInfo() {
  return (
    <>
      <p style={{ margin: '0 0 10px' }}>
        C'est la grande finale qui désigne le champion NFL, jouée début février — LE match de l'année.
      </p>
      <p style={{ margin: '0 0 10px' }}>
        <strong>Le dernier vainqueur :</strong> les Seattle Seahawks, qui ont écrasé les New England Patriots
        29-13 lors du Super Bowl LX (8 février 2026) — leur 2e titre de l'histoire.
      </p>
      <p style={{ margin: 0 }}>
        <strong>Favoris souvent cités</strong> pour la prochaine édition : les Los Angeles Rams, aux côtés des
        habitués comme les Buffalo Bills et les Baltimore Ravens.
      </p>
    </>
  )
}

function MvpInfo() {
  return (
    <>
      <p style={{ margin: '0 0 10px' }}>
        C'est la récompense individuelle la plus prestigieuse de la NFL, décernée au joueur jugé le plus
        déterminant de la saison régulière. Dans les faits, ça récompense presque toujours un quarterback
        d'une équipe qui gagne beaucoup.
      </p>
      <p style={{ margin: '0 0 10px' }}>
        <strong>Le dernier vainqueur :</strong> Matthew Stafford (Los Angeles Rams), sacré en février 2026
        dans le vote le plus serré depuis plus de 20 ans.
      </p>
      <p style={{ margin: 0 }}>
        <strong>Souvent cités pour cette saison :</strong> Josh Allen (Buffalo Bills), Lamar Jackson (Baltimore
        Ravens) et Joe Burrow (Cincinnati Bengals).
      </p>
    </>
  )
}

export function SpecialPicksPreseason({ saisonId, mesPronosSpeciaux }: { saisonId: string; mesPronosSpeciaux: SpecialPick[] }) {
  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)
  const superBowlPreseason = trouve('super_bowl_preseason')
  const mvp = trouve('mvp')

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>
          🏆 Vainqueur du Super Bowl
          <InfoToggle label="En savoir plus sur le Super Bowl">
            <SuperBowlInfo />
          </InfoToggle>
        </h2>
        <p style={{ fontSize: 12, color: '#999' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {superBowlPreseason && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {superBowlPreseason.choix}</strong></p>
        )}
        <ChoixEquipeSuperBowl saisonId={saisonId} type="super_bowl_preseason" choixActuel={superBowlPreseason?.choix} />
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>
          ⭐ MVP de la saison
          <InfoToggle label="En savoir plus sur le MVP">
            <MvpInfo />
          </InfoToggle>
        </h2>
        <p style={{ fontSize: 12, color: '#999' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {mvp && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {mvp.choix}</strong></p>
        )}
        <ChoixMvp saisonId={saisonId} choixActuel={mvp?.choix} />
      </div>
    </div>
  )
}

export function SpecialPicksAvantPlayoffs({ saisonId, mesPronosSpeciaux }: { saisonId: string; mesPronosSpeciaux: SpecialPick[] }) {
  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)
  const avantPlayoffs = trouve('super_bowl_avant_playoffs')
  const superBowlPreseason = trouve('super_bowl_preseason')
  const mvp = trouve('mvp')

  return (
    <div style={{ marginBottom: 24 }}>
      {(superBowlPreseason || mvp) && (
        <div style={{ ...cardStyle, textAlign: 'left', backgroundColor: 'rgba(22, 35, 63, 0.6)' }}>
          <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px', textAlign: 'center' }}>
            📋 Tes pronostics de la Week 1
          </p>
          {superBowlPreseason && (
            <p style={{ fontSize: 13, margin: '4px 0' }}>🏆 Vainqueur Super Bowl : <strong>{superBowlPreseason.choix}</strong></p>
          )}
          {mvp && (
            <p style={{ fontSize: 13, margin: '4px 0' }}>⭐ MVP : <strong>{mvp.choix}</strong></p>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>
          🏆 Vainqueur du Super Bowl — avant playoffs
          <InfoToggle label="En savoir plus sur le Super Bowl">
            <SuperBowlInfo />
          </InfoToggle>
        </h2>
        <p style={{ fontSize: 12, color: '#999' }}>+5 points si bon pronostic · à faire avant le début du Wild Card</p>
        {avantPlayoffs && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {avantPlayoffs.choix}</strong></p>
        )}
        <ChoixEquipeSuperBowl saisonId={saisonId} type="super_bowl_avant_playoffs" choixActuel={avantPlayoffs?.choix} />
      </div>
    </div>
  )
}

export function SpecialPicksRecap({ mesPronosSpeciaux }: { mesPronosSpeciaux: SpecialPick[] }) {
  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)
  const superBowlPreseason = trouve('super_bowl_preseason')
  const mvp = trouve('mvp')
  const avantPlayoffs = trouve('super_bowl_avant_playoffs')

  if (!superBowlPreseason && !mvp && !avantPlayoffs) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ ...cardStyle, textAlign: 'left', backgroundColor: 'rgba(22, 35, 63, 0.6)' }}>
        <h2 style={{ fontSize: 16, textAlign: 'center' }}>📋 Récap de tes pronostics spéciaux</h2>
        {superBowlPreseason && (
          <p style={{ fontSize: 13, margin: '6px 0' }}>
            🏆 Vainqueur Super Bowl (avant saison) : <strong>{superBowlPreseason.choix}</strong>
          </p>
        )}
        {avantPlayoffs && (
          <p style={{ fontSize: 13, margin: '6px 0' }}>
            🏆 Vainqueur Super Bowl (avant playoffs) : <strong>{avantPlayoffs.choix}</strong>
          </p>
        )}
        {mvp && (
          <p style={{ fontSize: 13, margin: '6px 0' }}>
            ⭐ MVP de la saison : <strong>{mvp.choix}</strong>
          </p>
        )}
      </div>
    </div>
  )
}