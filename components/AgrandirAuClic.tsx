'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/*
 * Entoure une image : un clic dessus l'affiche en grand, au milieu de l'écran, sur fond sombre.
 * Un clic n'importe où (ou la touche Échap) referme. Le clic n'ouvre pas le lien qui entoure
 * parfois l'image (ligne du classement, carte de ligue…).
 * Sert aux photos de joueurs, aux logos de ligues, et plus tard aux badges de récompense.
 */
export default function AgrandirAuClic({
  src,
  alt,
  rond = false,
  children,
}: {
  src: string
  alt: string
  rond?: boolean // vrai pour les avatars « dessinés » (carrés) : affichés en rond comme dans le site
  children: React.ReactNode
}) {
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    if (!ouvert) return
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [ouvert])

  return (
    <span
      style={{ display: 'contents' }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOuvert(true)
      }}
    >
      {children}
      {ouvert &&
        createPortal(
          <div
            role="dialog"
            aria-label={alt}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOuvert(false)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              cursor: 'zoom-out',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={
                rond
                  ? { width: 'min(80vw, 360px)', height: 'min(80vw, 360px)', objectFit: 'cover', borderRadius: '50%' }
                  : { maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 16 }
              }
            />
            <button
              type="button"
              aria-label="Fermer"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #33415a',
                background: 'rgba(22,35,63,0.92)',
                color: 'white',
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>,
          document.body
        )}
    </span>
  )
}