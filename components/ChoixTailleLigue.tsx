'use client'

import { useState } from 'react'
import { PALIERS_LIGUE, TAILLE_MAX_GRATUITE } from '@/lib/paliersLigue'

/*
 * Choix de la taille d'une ligue. Seul le palier gratuit (≤ 50) est ouvert ;
 * les autres sont grisés et affichent un avertissement « payant » quand on les touche.
 * Le formulaire envoie toujours taille_max = 50.
 */
export default function ChoixTailleLigue() {
  const [info, setInfo] = useState<string | null>(null)

  return (
    <div style={{ textAlign: 'left' }}>
      <input type="hidden" name="taille_max" value={TAILLE_MAX_GRATUITE} />
      <div style={{ fontSize: 11, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Taille de la ligue
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PALIERS_LIGUE.map((p) => (
          <div
            key={p.id}
            onClick={() =>
              setInfo(
                p.gratuit
                  ? `Pas besoin de choisir un nombre : tes amis peuvent rejoindre, jusqu'à ${TAILLE_MAX_GRATUITE}.`
                  : '⚠️ Attention : les ligues de plus de 50 joueurs seront payantes. Cette option n’est pas encore ouverte.'
              )
            }
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              borderRadius: 8,
              padding: '9px 10px',
              fontSize: 13,
              border: p.gratuit ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
              background: p.gratuit ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.03)',
              color: p.gratuit ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: p.gratuit ? 'default' : 'not-allowed',
            }}
          >
            <span style={{ fontWeight: 600 }}>{p.gratuit ? '● ' : '🔒 '}{p.libelle}</span>
            <span style={{ fontSize: 11 }}>
              {p.gratuit ? 'Gratuit' : p.prix ?? 'Bientôt disponible'}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#9fb0c9', minHeight: 34, marginTop: 8 }}>
        {info ?? `Tes amis peuvent rejoindre, jusqu'à ${TAILLE_MAX_GRATUITE} joueurs.`}
      </div>
    </div>
  )
}