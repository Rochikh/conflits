import { useState } from 'react'
import { generateConflict } from './api'
import type { ConflictResult, DestabilisationLevel } from './types'
import ResultCard from './ResultCard'
import './App.css'

const LEVELS: DestabilisationLevel[] = [
  'Questionnement doux',
  'Dissonance forte',
  'Rupture radicale',
]

export default function App() {
  const [concept, setConcept] = useState('')
  const [contexte, setContexte] = useState('')
  const [niveau, setNiveau] = useState<DestabilisationLevel>('Dissonance forte')
  const [result, setResult] = useState<ConflictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = concept.trim() !== '' && contexte.trim() !== ''

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await generateConflict(concept.trim(), contexte.trim(), niveau)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setConcept('')
    setContexte('')
    setNiveau('Dissonance forte')
    setResult(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Générateur de Conflits Cognitifs</h1>
        <p className="subtitle">
          Créez des situations déclenchantes pour provoquer une dissonance cognitive chez vos apprenants.
        </p>
      </header>

      <main className="main">
        <section className="form-section no-print">
          <div className="field">
            <label htmlFor="concept">Concept ou compétence à déconstruire</label>
            <textarea
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ex : Le leadership est inné"
              rows={2}
            />
          </div>

          <div className="field">
            <label htmlFor="contexte">Contexte métier</label>
            <textarea
              id="contexte"
              value={contexte}
              onChange={(e) => setContexte(e.target.value)}
              placeholder="Ex : management, soins, formation"
              rows={2}
            />
          </div>

          <div className="field">
            <label htmlFor="niveau">Niveau de déstabilisation</label>
            <select
              id="niveau"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as DestabilisationLevel)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
            >
              {loading ? 'Génération en cours…' : 'Générer'}
            </button>
            {result && (
              <button className="btn btn-secondary" onClick={handleReset}>
                Nouvelle génération
              </button>
            )}
          </div>
        </section>

        {loading && (
          <div className="loader">
            <div className="spinner" />
            <p>Analyse cognitive en cours…</p>
          </div>
        )}

        {error && (
          <div className="error-box no-print">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {result && <ResultCard result={result} />}
      </main>
    </div>
  )
}
