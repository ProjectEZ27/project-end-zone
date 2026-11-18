'use client'

import { useState } from 'react'
import { supprimerMonCompte } from '@/app/profile/supprimerCompte'

/** Lien discret « Supprimer mon compte » et sa fenêtre de confirmation (taper SUPPRIMER). */
export default function SupprimerCompte() {
  const [ouvert, setOuvert] = useState(false)
  const [mot, setMot] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function valider(formData: FormData) {
    if (mot.trim() !== 'SUPPRIMER') {
      setErreur('Écris SUPPRIMER en majuscules pour confirmer')
      return
    }
    setEnCours(true)
    setErreur('')
    const resultat = await supprimerMonCompte(formData)
    // En cas de réussite, le serveur redirige : on n'arrive ici qu'en cas d'échec
    if (resultat && !resultat.ok) setErreur(resultat.message)
    setEnCours(false)
  }

  function fermer() {
    if (enCours) return
    setOuvert(false)
    setMot('')
    setErreur('')
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 28 }}>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        style={{ background: 'none', border: 'none', color: '#e05252', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
      >
        Supprimer mon compte
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-suppression"
          onClick={fermer}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 380, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 14, padding: 20, color: 'white', textAlign: 'left', fontSize: 14, lineHeight: 1.5 }}
          >
            <p id="titre-suppression" style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Supprimer ton compte ?</p>
            <p style={{ color: '#c9d4e5', margin: '0 0 6px' }}>Tout sera effacé pour de bon :</p>
            <ul style={{ margin: '0 0 10px 18px', padding: 0, color: '#c9d4e5' }}>
              <li>tes pronostics et tes points</li>
              <li>tes pronostics spéciaux, réactions et photo</li>
              <li>ta place dans les classements et les ligues</li>
            </ul>
            <p style={{ color: '#c9d4e5', margin: '0 0 12px' }}>
              Si tu es commissaire, le membre le plus ancien de ta ligue prend ta place.
            </p>
            <form action={valider}>
              <label htmlFor="confirmation-suppression" style={{ fontSize: 12, color: '#9fb0c9' }}>
                Écris SUPPRIMER pour confirmer
              </label>
              <input
                id="confirmation-suppression"
                name="confirmation"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                value={mot}
                onChange={(e) => { setMot(e.target.value); setErreur('') }}
                style={{ width: '100%', marginTop: 4, padding: 8, background: '#0b1220', color: 'white', border: '0.5px solid #33415a', borderRadius: 6, boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: 12, color: '#e05252', minHeight: 16, margin: '4px 0 0' }}>{erreur}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={fermer}
                  style={{ flex: 1, padding: 10, background: 'transparent', color: 'white', border: '0.5px solid #33415a', borderRadius: 8, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: 10, background: '#C8352E', color: 'white', border: 'none', borderRadius: 8, cursor: enCours ? 'wait' : 'pointer', opacity: enCours ? 0.6 : 1 }}
                >
                  {enCours ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}