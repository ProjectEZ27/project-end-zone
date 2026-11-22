import type { MetadataRoute } from 'next'

// Fiche d'identité de l'appli : nom, couleurs, icônes et mode « plein écran ».
// Elle permet d'ajouter le jeu à l'écran d'accueil du téléphone, sans barre d'adresse.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Project End Zone',
    short_name: 'End Zone',
    description: 'Pronostics NFL entre amis',
    lang: 'fr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0d1420',
    theme_color: '#0d1420',
    icons: [
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}