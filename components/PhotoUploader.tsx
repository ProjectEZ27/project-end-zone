'use client'

import { useRef, useState } from 'react'
import { envoyerPhoto } from '@/app/photos/actions'

const APERCU = 180
const TAILLE = 256

export default function PhotoUploader({
  type,
  cible,
  onTermine,
}: {
  type: 'profil' | 'ligue'
  cible: string
  onTermine?: () => void
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [urlImage, setUrlImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [decalage, setDecalage] = useState({ x: 0, y: 0 })
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [envoye, setEnvoye] = useState(false)
  const depart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const echelle = image ? (APERCU / Math.min(image.naturalWidth, image.naturalHeight)) * zoom : 1
  const largeur = image ? image.naturalWidth * echelle : 0
  const hauteur = image ? image.naturalHeight * echelle : 0
  const maxX = Math.max(0, (largeur - APERCU) / 2)
  const maxY = Math.max(0, (hauteur - APERCU) / 2)
  const ox = Math.max(-maxX, Math.min(maxX, decalage.x))
  const oy = Math.max(-maxY, Math.min(maxY, decalage.y))

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setUrlImage(url)
      setZoom(1)
      setDecalage({ x: 0, y: 0 })
      setMessage(null)
    }
    img.onerror = () => setMessage("Cette image n'a pas pu être lue.")
    img.src = url
  }

  function debutGlisse(e: React.PointerEvent<HTMLDivElement>) {
    depart.current = { x: e.clientX, y: e.clientY, ox, oy }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function glisse(e: React.PointerEvent<HTMLDivElement>) {
    if (!depart.current) return
    const nx = depart.current.ox + (e.clientX - depart.current.x)
    const ny = depart.current.oy + (e.clientY - depart.current.y)
    setDecalage({ x: Math.max(-maxX, Math.min(maxX, nx)), y: Math.max(-maxY, Math.min(maxY, ny)) })
  }

  function finGlisse() {
    depart.current = null
  }

  async function envoyer() {
    if (!image) return
    setEnvoi(true)
    setMessage(null)

    const canvas = document.createElement('canvas')
    canvas.width = TAILLE
    canvas.height = TAILLE
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setEnvoi(false)
      setMessage("Ton navigateur ne peut pas préparer l'image.")
      return
    }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, TAILLE, TAILLE)
    const r = TAILLE / APERCU
    ctx.drawImage(image, ((APERCU - largeur) / 2 + ox) * r, ((APERCU - hauteur) / 2 + oy) * r, largeur * r, hauteur * r)

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) {
      setEnvoi(false)
      setMessage("L'image n'a pas pu être préparée.")
      return
    }

    const fd = new FormData()
    fd.append('type', type)
    fd.append('cible', cible)
    fd.append('fichier', new File([blob], 'photo.jpg', { type: 'image/jpeg' }))

    const res = await envoyerPhoto(fd)
    setEnvoi(false)
    setMessage(res.message)
    if (res.ok) {
      setEnvoye(true)
      onTermine?.()
    }
  }

  const bouton: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  }

  if (envoye) {
    return <p style={{ fontSize: 13, color: '#f5c969', margin: 0 }}>{message}</p>
  }

  return (
    <div>
      {!image ? (
        <label
          style={{
            ...bouton,
            display: 'inline-block',
            backgroundColor: '#C8352E',
            color: '#fff',
          }}
        >
          Choisir une photo
          <input type="file" accept="image/*" onChange={choisirFichier} style={{ display: 'none' }} />
        </label>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: '#9fb0c9', margin: '0 0 8px' }}>Déplace et zoome pour cadrer</p>
          <div
            onPointerDown={debutGlisse}
            onPointerMove={glisse}
            onPointerUp={finGlisse}
            onPointerCancel={finGlisse}
            style={{
              position: 'relative',
              width: APERCU,
              height: APERCU,
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto 10px',
              border: '2px solid #C8352E',
              touchAction: 'none',
              cursor: 'grab',
              background: '#16233F',
            }}
          >
            {urlImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlImage}
                alt="Aperçu"
                draggable={false}
                style={{
                  position: 'absolute',
                  width: largeur,
                  height: hauteur,
                  left: (APERCU - largeur) / 2 + ox,
                  top: (APERCU - hauteur) / 2 + oy,
                  maxWidth: 'none',
                  userSelect: 'none',
                }}
              />
            )}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            style={{ width: '70%' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button
              type="button"
              onClick={() => { setImage(null); setUrlImage(null) }}
              style={{ ...bouton, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Autre photo
            </button>
            <button
              type="button"
              onClick={envoyer}
              disabled={envoi}
              style={{ ...bouton, backgroundColor: '#C8352E', color: '#fff', border: 'none', opacity: envoi ? 0.6 : 1 }}
            >
              {envoi ? 'Envoi...' : 'Envoyer pour validation'}
            </button>
          </div>
        </div>
      )}
      {message && <p style={{ fontSize: 12, color: '#ff8f87', marginTop: 8 }}>{message}</p>}
    </div>
  )
}