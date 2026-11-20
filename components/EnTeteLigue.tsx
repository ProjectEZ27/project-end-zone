'use client'

import { useState } from 'react'
import { TbPencilMinus, TbPhoto } from 'react-icons/tb'
import { changerLogoLigue } from '@/app/leagues/[id]/actions'
import { changerNomLigue } from '@/app/leagues/[id]/parametres/actions'
import { retirerPhotoLigue } from '@/app/photos/actions'
import LeagueLogo from './LeagueLogo'
import LeagueLogoSelector from './LeagueLogoSelector'
import PhotoUploader from './PhotoUploader'
import {
  BoutonModifier,
  PanneauModification,
  LigneChoix,
  styleBoutonValider,
  styleBoutonRetour,
  styleChamp,
} from './PanneauModification'

type Vue = 'menu' | 'nom' | 'logo'

interface EnTeteLigueProps {
  ligueId: string
  nom: string
  logoId: number
  estCommissaire: boolean
  photoChemin?: string | null
  photoEnAttente?: boolean
}

/*
 * En-tête de la page d'une ligue : logo (un clic l'agrandit), nom, et pour le commissaire
 * UN seul bouton « Modifier la ligue » qui ouvre le choix nom / logo ou photo.
 */
export default function EnTeteLigue({
  ligueId,
  nom,
  logoId,
  estCommissaire,
  photoChemin = null,
  photoEnAttente = false,
}: EnTeteLigueProps) {
  const [ouvert, setOuvert] = useState(false)
  const [vue, setVue] = useState<Vue>('menu')
  const [logoChoisi, setLogoChoisi] = useState(logoId)
  const [montrerPhoto, setMontrerPhoto] = useState(false)

  const fermer = () => {
    setOuvert(false)
    setVue('menu')
    setLogoChoisi(logoId)
    setMontrerPhoto(false)
  }
  const retourMenu = () => {
    setVue('menu')
    setLogoChoisi(logoId)
    setMontrerPhoto(false)
  }

  const titres: Record<Vue, string> = {
    menu: 'Que veux-tu modifier ?',
    nom: 'Nom de la ligue',
    logo: 'Logo ou photo',
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ marginBottom: 8 }}>
        <LeagueLogo logoId={logoId} size={110} leagueName={nom} photoChemin={photoChemin} zoom />
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>{nom}</h1>

      {estCommissaire && (
        <BoutonModifier
          libelle="Modifier la ligue"
          ouvert={ouvert}
          onClick={() => (ouvert ? fermer() : setOuvert(true))}
        />
      )}

      {estCommissaire && ouvert && (
        <PanneauModification titre={titres[vue]} onFermer={fermer}>
          {vue === 'menu' && (
            <>
              <LigneChoix
                icone={<TbPencilMinus size={18} />}
                libelle="Nom de la ligue"
                valeur={nom}
                onClick={() => setVue('nom')}
              />
              <LigneChoix
                icone={<TbPhoto size={18} />}
                libelle="Logo ou photo"
                valeur={photoChemin ? 'Ma photo' : `Logo ${logoId}`}
                onClick={() => setVue('logo')}
              />
            </>
          )}

          {vue === 'nom' && (
            <form action={changerNomLigue}>
              <input type="hidden" name="ligue_id" value={ligueId} />
              <input
                type="text"
                name="nom"
                defaultValue={nom}
                required
                minLength={2}
                maxLength={40}
                aria-label="Nouveau nom de la ligue"
                style={styleChamp}
              />
              <p style={{ fontSize: 12, color: '#9fb0c9', margin: '8px 0 0' }}>
                Les membres de la ligue sont prévenus par une notification.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="submit" style={styleBoutonValider}>Valider</button>
                <button type="button" onClick={retourMenu} style={styleBoutonRetour}>Retour</button>
              </div>
            </form>
          )}

          {vue === 'logo' && (
            <div>
              <LeagueLogoSelector selectedId={logoChoisi} onSelect={setLogoChoisi} />

              <form action={changerLogoLigue} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                <input type="hidden" name="ligue_id" value={ligueId} />
                <input type="hidden" name="logo_id" value={logoChoisi} />
                <button type="submit" style={styleBoutonValider}>Valider</button>
                <button type="button" onClick={retourMenu} style={styleBoutonRetour}>Retour</button>
              </form>

              <div style={{ borderTop: '1px solid #33415a', marginTop: 16, paddingTop: 14, textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9fb0c9' }}>Ou utilise une photo pour ta ligue</p>

                {photoEnAttente && (
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#f5c969' }}>
                    Une photo est en attente de validation. Le logo actuel reste affiché en attendant.
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
                    {photoChemin ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                ) : (
                  <PhotoUploader type="ligue" cible={ligueId} onTermine={() => setMontrerPhoto(false)} />
                )}

                {photoChemin && (
                  <form action={retirerPhotoLigue} style={{ marginTop: 12 }}>
                    <input type="hidden" name="ligue_id" value={ligueId} />
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
                      Retirer la photo et revenir au logo
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