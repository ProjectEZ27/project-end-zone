import { Resend } from 'resend'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
const match = envContent.match(/RESEND_API_KEY=(.+)/)
const apiKey = match[1].trim()

const resend = new Resend(apiKey)

const result = await resend.emails.send({
  from: 'Project End Zone <onboarding@resend.dev>',
  to: 'projectendzone27@gmail.com',
  subject: 'Test — Project End Zone',
  html: '<p>Si tu reçois ce mail, la connexion à Resend fonctionne 🏈</p>',
})

console.log(result)