export function urlPhoto(chemin: string) {
  // Un chemin qui commence par « / » est une image du site (ex. les écussons des régions)
  if (chemin.startsWith('/')) return chemin
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${chemin}`
}