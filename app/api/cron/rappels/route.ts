import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Rappels de ligue désactivés : chaque joueur règle ses rappels dans son profil.',
  })
}