import type { ConflictResult, DestabilisationLevel } from './types'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-2.0-flash-001'

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

const REQUIRED_KEYS: (keyof ConflictResult)[] = [
  'representation_erronee',
  'situation_declenchante',
  'question_bascule',
  'mecanisme_cognitif',
  'ancrage_theorique',
  'debrief_formateur',
]

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
}

export async function generateConflict(
  concept: string,
  contexte: string,
  niveau: DestabilisationLevel
): Promise<ConflictResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Clé API OpenRouter manquante. Configurez VITE_OPENROUTER_API_KEY.')
  }

  const userPrompt = `Concept : ${concept}
Contexte métier : ${contexte}
Niveau de déstabilisation souhaité : ${niveau}
Génère une situation déclenchante complète.`

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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
    const errorText = await response.text()
    throw new Error(`Erreur API (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const rawContent: string = data.choices?.[0]?.message?.content ?? ''
  const cleaned = stripMarkdownFences(rawContent)

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('La réponse du modèle n\'est pas un JSON valide.')
  }

  for (const key of REQUIRED_KEYS) {
    if (typeof parsed[key] !== 'string' || !parsed[key]) {
      throw new Error(`Clé manquante ou invalide dans la réponse : "${key}"`)
    }
  }

  return parsed as unknown as ConflictResult
}
