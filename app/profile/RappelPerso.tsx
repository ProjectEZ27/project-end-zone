'use client'

import { toggleRappelPerso } from './actions'

export default function RappelPerso({ actif }: { actif: boolean }) {
  return (
    <form action={toggleRappelPerso}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          name="rappel_perso_actif"
          defaultChecked={actif}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        Me rappeler 1h avant le premier match de la semaine
      </label>
    </form>
  )
}