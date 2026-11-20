'use client'

import { useState } from 'react'
import { TbPencilMinus, TbShield, TbPhoto } from 'react-icons/tb'
import { changerAvatar, changerPseudo, changerEquipeFavorite } from '@/app/profile/actions'
import { retirerPhotoProfil } from '@/app/photos/actions'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import { getCouleurAccent } from '@/lib/teamColors'
import AvatarSelector from './AvatarSelector'
import UserAvatar from './UserAvatar'
import PhotoUploader from './PhotoUploader'
import {
  BoutonModifier,
  PanneauModification,
  LigneChoix,
  styleBoutonValider,
  styleBoutonRetour,
  styleChamp,
} from './PanneauModification'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

type Vue = 'menu' | 'pseudo' | 'equipe' | 'photo'

interface ModifierProfilProps {
  pseudo: string
  avatarId: number
  photoChemin: string | null
  photoEnAttente: boolean
  userId: string
  equipe: string | null
}

/*
 * En-tête du profil : photo (un clic l'agrandit), pseudo, équipe favorite, et UN seul bouton
 * « Modifier mon profil » qui ouvre le choix pseudo / équipe favorite / photo ou avatar.
 */
export default function ModifierProfil({
  pseudo,
  avatarId,
  photoChemin,
  photoEnAttente,
  userId,
  equipe,
}: ModifierProfilProps) {
  const [ouvert, setOuvert] = useState(false)
  const [vue, setVue] = useState<Vue>('menu')
  const [avatarChoisi, setAvatarChoisi] = useState(avatarId)
  const [montrerPhoto, setMontrerPhoto] = useState(false)

  const nomEquipe = equipe ? (NOMS_EQUIPES[equipe] ?? equipe) : 'aucune'

  const fermer = () => {
    setOuvert(false)
    setVue('menu')
    setAvatarChoisi(avatarId)
    setMontrerPhoto(false)
  }
  const retourMenu = () => {
    setVue('menu')
    setAvatarChoisi(avatarId)
    setMontrerPhoto(false)
  }

  const titres: Record<Vue, string> = {
    menu: 'Que veux-tu modifier ?',
    pseudo: 'Ton pseudo',
    equipe: 'Ton équipe favorite',
    photo: 'Ta photo ou ton avatar',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
        <UserAvatar avatarId={avatarId} photoChemin={photoChemin} size={80} userName={pseudo} />
        <h1 style={{ margin: 0 }}>{pseudo}</h1>
      </div>

      <p style={{ fontSize: 12, color: '#9fb0c9', margin: '0 0 10px' }}>
        Équipe favorite :{' '}
        <span style={{ color: equipe ? getCouleurAccent(equipe) : '#C8352E', fontWeight: 600 }}>{nomEquipe}</span>
      </p>

      <BoutonModifier
        libelle="Modifier mon profil"
        ouvert={ouvert}
        onClick={() => (ouvert ? fermer() : setOuvert(true))}
      />

      {ouvert && (
        <PanneauModification titre={titres[vue]} onFermer={fermer}>
          {vue === 'menu' && (
            <>
              <LigneChoix
                icone={<TbPencilMinus size={18} />}
                libelle="Pseudo"
                valeur={pseudo}
                onClick={() => setVue('pseudo')}
              />
              <LigneChoix
                icone={<TbShield size={18} />}
                libelle="Équipe favorite"
                valeur={nomEquipe}
                onClick={() => setVue('equipe')}
              />
              <LigneChoix
                icone={<TbPhoto size={18} />}
                libelle="Photo ou avatar"
                valeur={photoChemin ? 'Ma photo' : `Avatar ${avatarId}`}
                onClick={() => setVue('photo')}
              />
            </>
          )}

          {vue === 'pseudo' && (
            <form action={changerPseudo}>
              <input
                type="text"
                name="pseudo"
                defaultValue={pseudo}
                required
                minLength={2}
                maxLength={20}
                aria-label="Nouveau pseudo"
                style={styleChamp}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="submit" style={styleBoutonValider}>Valider</button>
                <button type="button" onClick={retourMenu} style={styleBoutonRetour}>Retour</button>
              </div>
            </form>
          )}

          {vue === 'equipe' && (
            <form action={changerEquipeFavorite} onSubmit={fermer}>
              <select name="equipe_favorite" defaultValue={equipe ?? ''} required style={styleChamp}>
                {!equipe && <option value="" disabled>Choisir une équipe</option>}
                {EQUIPES_NFL.map((code) => (
                  <option key={code} value={code}>
                    {NOMS_EQUIPES[code] ?? code}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="submit" style={styleBoutonValider}>Valider</button>
                <button type="button" onClick={retourMenu} style={styleBoutonRetour}>Retour</button>
              </div>
            </form>
          )}

          {vue === 'photo' && (
            <div>
              <AvatarSelector selectedId={avatarChoisi} onSelect={setAvatarChoisi} />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: 'rgba(200, 53, 46, 0.1)',
                  borderRadius: 6,
                  margin: '12px 0',
                }}
              >
                <UserAvatar avatarId={avatarChoisi} size={48} zoom={false} />
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#999' }}>Avatar {avatarChoisi}/16</p>
              </div>

              <form action={changerAvatar} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <input type="hidden" name="avatar_id" value={avatarChoisi} />
                <button type="submit" style={styleBoutonValider}>Valider</button>
                <button type="button" onClick={retourMenu} style={styleBoutonRetour}>Retour</button>
              </form>

              <div style={{ borderTop: '1px solid #33415a', marginTop: 16, paddingTop: 14, textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9fb0c9' }}>Ou utilise ta propre photo</p>

                {photoEnAttente && (
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#f5c969' }}>
                    Une photo est en attente de validation. Ton avatar actuel reste affiché en attendant.
                  </p>
                )}

                {!montrerPhoto ? (
                  <button
                    type="button"
                    onClick={() => setMontrerPhoto(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: '1px dashed #C8352E',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {photoChemin ? 'Changer ma photo' : 'Ajouter ma photo'}
                  </button>
                ) : (
                  <PhotoUploader type="profil" cible={userId} onTermine={() => setMontrerPhoto(false)} />
                )}

                {photoChemin && (
                  <form action={retirerPhotoProfil} style={{ marginTop: 12 }}>
                    <button
                      type="submit"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9fb0c9',
                        fontSize: 12,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Retirer ma photo et revenir à l&apos;avatar
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </PanneauModification>
      )}
    </div>
  )
}