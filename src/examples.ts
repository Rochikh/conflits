import type { DestabilisationLevel } from './types'

export interface Example {
  concept: string
  contexte: string
  niveau: DestabilisationLevel
}

const EXAMPLES: Example[] = [
  {
    concept: 'Un bon formateur maîtrise parfaitement son sujet',
    contexte: 'Formation de formateurs',
    niveau: 'Dissonance forte',
  },
  {
    concept: 'Le leadership est une qualité innée',
    contexte: 'Management',
    niveau: 'Rupture radicale',
  },
  {
    concept: 'Les gens apprennent mieux quand on adapte le contenu à leur style d\'apprentissage',
    contexte: 'Ingénierie pédagogique',
    niveau: 'Dissonance forte',
  },
  {
    concept: 'Un·e bon·ne soignant·e ne montre pas ses émotions',
    contexte: 'Soins infirmiers',
    niveau: 'Questionnement doux',
  },
  {
    concept: 'Le multitâche est un signe d\'efficacité',
    contexte: 'Gestion de projet',
    niveau: 'Dissonance forte',
  },
  {
    concept: 'La motivation suffit pour réussir',
    contexte: 'Accompagnement professionnel',
    niveau: 'Rupture radicale',
  },
  {
    concept: 'Un feedback négatif démotive toujours',
    contexte: 'Ressources humaines',
    niveau: 'Questionnement doux',
  },
  {
    concept: 'Les expert·es sont les meilleur·es pédagogues',
    contexte: 'Enseignement supérieur',
    niveau: 'Dissonance forte',
  },
  {
    concept: 'La communication non-violente résout tous les conflits',
    contexte: 'Médiation',
    niveau: 'Rupture radicale',
  },
  {
    concept: 'Plus on répète, mieux on retient',
    contexte: 'Formation continue',
    niveau: 'Questionnement doux',
  },
]

export function getRandomExample(): Example {
  return EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
}
