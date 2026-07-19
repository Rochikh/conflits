import type { ConflictResult, DestabilisationLevel } from './types'

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
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept, contexte, niveau }),
  })

  if (!response.ok) {
    let message = `Erreur API (${response.status})`
    try {
      const err = await response.json()
      if (err.error) message = err.error
    } catch {
      // corps non JSON, on garde le message par défaut
    }
    throw new Error(message)
  }

  const data = await response.json()
  const cleaned = stripMarkdownFences(data.content ?? '')

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
