import type { DestabilisationLevel } from './types'

interface Props {
  onClose: () => void
  onLoadExample: (concept: string, contexte: string, niveau: DestabilisationLevel) => void
}

export default function HelpModal({ onClose, onLoadExample }: Props) {
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleExample() {
    onLoadExample(
      'Un bon formateur maîtrise parfaitement son sujet',
      'Formation de formateurs',
      'Dissonance forte'
    )
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          &times;
        </button>

        <div className="modal-block">
          <h3>Ce que fait l'outil</h3>
          <p>
            Cet outil génère une situation concrète qui fait tomber une croyance
            professionnelle erronée chez tes apprenant·es. C'est plus efficace qu'un
            exposé théorique : le conflit cognitif force la remise en question.
          </p>
        </div>

        <div className="modal-block">
          <h3>Comment remplir les champs</h3>
          <p>
            Entre la croyance à déconstruire, le contexte professionnel et le niveau
            d'intensité souhaité. Essaie avec cet exemple :
          </p>
          <button className="modal-example" onClick={handleExample}>
            <span className="modal-example-label">Charger cet exemple</span>
            <span className="modal-example-fields">
              <span><strong>Concept :</strong> Un bon formateur maîtrise parfaitement son sujet</span>
              <span><strong>Contexte :</strong> Formation de formateurs</span>
              <span><strong>Niveau :</strong> Dissonance forte</span>
            </span>
          </button>
        </div>

        <div className="modal-block">
          <h3>Les niveaux de déstabilisation</h3>
          <ul className="modal-levels">
            <li>
              <strong>Questionnement doux</strong> — Soulève un doute sans brusquer.
              Idéal pour amorcer une réflexion en début de séance.
            </li>
            <li>
              <strong>Dissonance forte</strong> — Confronte directement la croyance avec
              un contre-exemple frappant. Le niveau recommandé.
            </li>
            <li>
              <strong>Rupture radicale</strong> — Provoque un choc cognitif. À utiliser
              avec un public averti et un débriefage solide.
            </li>
          </ul>
        </div>

        <button className="btn btn-secondary modal-close-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}
