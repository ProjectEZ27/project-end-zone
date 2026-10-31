'use client'

import { useEffect, useRef, useState } from 'react'
import { TbArrowUp, TbArrowDown } from 'react-icons/tb'

export default function MouvementFleche({
  delta,
  moi,
  cleAnimation,
  animer,
}: {
  delta: number
  moi: boolean
  cleAnimation: string
  animer: boolean
}) {
  const racine = useRef<HTMLSpanElement>(null)
  const pastille = useRef<HTMLSpanElement>(null)
  const jouee = useRef(false)
  const [enAnimation, setEnAnimation] = useState(false)

  useEffect(() => {
    if (!moi || !animer || delta === 0 || jouee.current) return
    try {
      if (localStorage.getItem(cleAnimation)) return
    } catch {}
    jouee.current = true
    try {
      localStorage.setItem(cleAnimation, '1')
    } catch {}
    setEnAnimation(true)
    setTimeout(() => setEnAnimation(false), 2600)
  }, [moi, animer, delta, cleAnimation])

  useEffect(() => {
    if (!enAnimation) return
    const rgb = delta > 0 ? '78,232,146' : '255,107,95'
    racine.current?.parentElement?.animate(
      [
        { offset: 0.35, boxShadow: `0 0 22px rgba(${rgb},0.75)`, borderColor: `rgb(${rgb})` },
      ],
      { duration: 2400, easing: 'ease-out' }
    )
    pastille.current?.animate(
      [
        { transform: 'scale(0.3)', opacity: 0, offset: 0 },
        { transform: 'scale(1.2)', opacity: 1, offset: 0.25 },
        { transform: 'scale(1)', opacity: 1, offset: 0.4 },
        { transform: 'scale(1)', opacity: 1, offset: 0.85 },
        { transform: 'scale(0.9)', opacity: 0, offset: 1 },
      ],
      { duration: 2400, easing: 'ease-out' }
    )
  }, [enAnimation, delta])

  const couleur = delta > 0 ? '#4ee892' : '#ff6b5f'
  const n = Math.abs(delta)

  return (
    <span
      ref={racine}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        minWidth: 34,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 700,
        color: couleur,
      }}
    >
      {enAnimation ? (
        <span
          ref={pastille}
          style={{
            background: delta > 0 ? 'rgba(28,107,69,0.95)' : 'rgba(107,28,28,0.95)',
            border: `1px solid ${couleur}`,
            borderRadius: 14,
            padding: '3px 10px',
            fontSize: 12,
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          {delta > 0 ? '+' : '−'}{n} place{n > 1 ? 's' : ''}
        </span>
      ) : (
        <>
          {delta > 0 ? <TbArrowUp size={18} /> : <TbArrowDown size={18} />}
          {n}
        </>
      )}
    </span>
  )
}