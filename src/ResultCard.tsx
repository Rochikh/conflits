import { useState } from 'react'
import type { ConflictResult } from './types'

interface Props {
  result: ConflictResult
}

const SECTIONS: { key: keyof ConflictResult; label: string }[] = [
  { key: 'representation_erronee', label: 'Représentation erronée identifiée' },
  { key: 'situation_declenchante', label: 'Situation déclenchante narrative' },
  { key: 'question_bascule', label: 'Question de bascule' },
  { key: 'mecanisme_cognitif', label: 'Mécanisme cognitif activé' },
  { key: 'ancrage_theorique', label: 'Ancrage théorique' },
  { key: 'debrief_formateur', label: 'Proposition de débriefage pour le·la formateur·rice' },
]

function resultToText(result: ConflictResult): string {
  return SECTIONS.map(
    ({ key, label }) => `${label}\n${'—'.repeat(label.length)}\n${result[key]}`
  ).join('\n\n')
}

export default function ResultCard({ result }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultToText(result))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may fail in some contexts */
    }
  }

  return (
    <section className="result-card">
      {SECTIONS.map(({ key, label }) => (
        <div key={key} className="result-block">
          <h3>{label}</h3>
          <p>{result[key]}</p>
        </div>
      ))}
      <div className="result-actions no-print">
        <button className="btn btn-copy" onClick={handleCopy}>
          {copied ? 'Copié !' : 'Copier tout'}
        </button>
      </div>
    </section>
  )
}
