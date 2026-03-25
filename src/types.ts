export interface ConflictResult {
  representation_erronee: string
  situation_declenchante: string
  question_bascule: string
  mecanisme_cognitif: string
  ancrage_theorique: string
  debrief_formateur: string
}

export type DestabilisationLevel =
  | 'Questionnement doux'
  | 'Dissonance forte'
  | 'Rupture radicale'
