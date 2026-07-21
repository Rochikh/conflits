import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = process.env.PORT || 3001
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-v4-flash'
const API_KEY = process.env.DEEPSEEK_API_KEY

if (!API_KEY) {
  console.error('DEEPSEEK_API_KEY manquante. Lancez avec: node --env-file=.env.local server.mjs')
  process.exit(1)
}

const SYSTEM_PROMPT = `Tu es un ingénieur pédagogique expert en psychologie cognitive et en formation d'adultes. Tu génères des situations déclenchantes conçues pour provoquer un conflit cognitif chez des apprenants professionnels.
Réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après. Structure exacte :
{
  "representation_erronee": "string",
  "situation_declenchante": "string",
  "question_bascule": "string",
  "mecanisme_cognitif": "string",
  "ancrage_theorique": "string",
  "debrief_formateur": "string"
}

Consignes supplémentaires par champ :
- ancrage_theorique : UNE seule référence. Auteur + année + concept directement lié à la représentation erronée ciblée. Pas de liste bibliographique.
- question_bascule : formuler à la deuxième personne, en situation concrète, sans que la bonne réponse soit évidente à la lecture. La question doit mettre le formateur en inconfort, pas le confirmer dans ce qu'il sait déjà.
- debrief_formateur : ne jamais mentionner les styles d'apprentissage (auditif, visuel, kinesthésique). C'est un mythe pédagogique réfuté (Pashler et al., 2008). Utiliser uniquement des stratégies validées empiriquement.`

const NIVEAUX = ['Questionnement doux', 'Dissonance forte', 'Rupture radicale']
const MAX_INPUT_LENGTH = 500

// Limite simple par IP : 10 requêtes par tranche de 10 minutes
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  let data = ''
  for await (const chunk of req) {
    data += chunk
    if (data.length > 10_000) throw new Error('Corps de requête trop volumineux')
  }
  return JSON.parse(data)
}

async function handleGenerate(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress
  if (rateLimited(ip)) {
    return sendJson(res, 429, { error: 'Trop de requêtes. Réessayez dans quelques minutes.' })
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    return sendJson(res, 400, { error: 'Requête invalide.' })
  }

  const { concept, contexte, niveau } = body
  if (
    typeof concept !== 'string' || !concept.trim() || concept.length > MAX_INPUT_LENGTH ||
    typeof contexte !== 'string' || !contexte.trim() || contexte.length > MAX_INPUT_LENGTH ||
    !NIVEAUX.includes(niveau)
  ) {
    return sendJson(res, 400, { error: 'Paramètres invalides.' })
  }

  const userPrompt = `Concept : ${concept}
Contexte métier : ${contexte}
Niveau de déstabilisation souhaité : ${niveau}
Génère une situation déclenchante complète.`

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    console.error(`Erreur DeepSeek (${response.status}): ${await response.text()}`)
    return sendJson(res, 502, { error: 'Erreur du service de génération.' })
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ content }))
}

async function serveStatic(req, res) {
  const path = normalize(new URL(req.url, 'http://x').pathname).replace(/^(\.\.[/\\])+/, '')
  let file = join('dist', path === '/' ? 'index.html' : path)
  let body
  try {
    body = await readFile(file)
  } catch {
    file = 'dist/index.html'
    body = await readFile(file)
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(body)
}

createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/generate') {
      await handleGenerate(req, res)
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      await serveStatic(req, res)
    } else {
      sendJson(res, 405, { error: 'Méthode non autorisée.' })
    }
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Erreur serveur.' })
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur sur http://0.0.0.0:${PORT}`)
})
