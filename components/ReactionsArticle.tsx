'use client'

import { useState } from 'react'
import { reagirArticle } from '@/app/leagues/[id]/reactions'
import { REACTIONS } from '@/lib/reactionsJournal'

export type ReactionJoueur = { emoji: string; utilisateur_id: string; pseudo: string }

/*
 * Barre de réactions sous un article du journal.
 *  - toucher un émoji : réagir (le retoucher enlève sa réaction ; en toucher un autre la remplace)
 *  - toucher le petit chiffre : voir qui a réagi
 */
export default function ReactionsArticle({
  ligueId,
  semaineId,
  articleId,
  initiales,
  monId,
  monPseudo,
}: {
  ligueId: number
  semaineId: number
  articleId: string
  initiales: ReactionJoueur[]
  monId: string
  monPseudo: string
}) {
  const [liste, setListe] = useState<ReactionJoueur[]>(initiales)
  const [detail, setDetail] = useState<string | null>(null)
  const [erreur, setErreur] = useState(false)

  const maReaction = liste.find((r) => r.utilisateur_id === monId)?.emoji ?? null

  async function reagir(emoji: string) {
    const avant = liste
    const sans = liste.filter((r) => r.utilisateur_id !== monId)
    setListe(maReaction === emoji ? sans : [...sans, { emoji, utilisateur_id: monId, pseudo: monPseudo }])
    setErreur(false)
    const res = await reagirArticle(ligueId, semaineId, articleId, emoji)
    if (!res.ok) {
      setListe(avant)
      setErreur(true)
    }
  }

  return (
    <div style={{ marginTop: 10, width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {REACTIONS.map((emoji) => {
          const gens = liste.filter((r) => r.emoji === emoji)
          const actif = maReaction === emoji
          const ouvert = detail === emoji
          return (
            <div
              key={emoji}
              style={{
                display: 'flex', alignItems: 'center', borderRadius: 999, overflow: 'hidden',
                border: actif ? '1px solid #F0C040' : '0.5px solid rgba(255,255,255,0.2)',
                background: actif ? 'rgba(240,192,64,0.18)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <button
                type="button"
                onClick={() => reagir(emoji)}
                aria-label={`Réagir ${emoji}`}
                aria-pressed={actif}
                style={{ background: 'none', border: 'none', padding: gens.length ? '4px 4px 4px 10px' : '4px 10px', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}
              >
                {emoji}
              </button>
              {gens.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDetail(ouvert ? null : emoji)}
                  aria-label={`Voir qui a réagi ${emoji}`}
                  aria-expanded={ouvert}
                  style={{
                    background: 'none', border: 'none', padding: '4px 10px 4px 4px', fontSize: 12, fontWeight: 600,
                    color: ouvert ? '#F0C040' : '#9FB0CF', cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: 3,
                  }}
                >
                  {gens.length}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {detail && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#9FB0CF', lineHeight: 1.5 }}>
          {detail}{' '}
          {liste.filter((r) => r.emoji === detail).map((r) => (r.utilisateur_id === monId ? 'Toi' : r.pseudo)).join(', ')}
        </div>
      )}
      {erreur && <div style={{ marginTop: 6, fontSize: 12, color: '#e05252' }}>La réaction n'a pas pu être enregistrée, réessaie.</div>}
    </div>
  )
}