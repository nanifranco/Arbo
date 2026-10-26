/**
 * Modelo de datos de ÁRBO.
 *
 * Separa tres niveles que en el teatro suelen confundirse:
 *  - Work (obra):        el texto dramático. "Medea" de Eurípides.
 *  - Production:         una puesta en escena concreta de esa obra: compañía, dirección, elenco, cartel.
 *  - Season (temporada): cuándo y dónde se presenta esa producción. Una producción puede tener
 *                        estreno, temporadas y reposiciones en distintos teatros.
 *
 * Las entradas del diario y las reseñas apuntan a la producción (y opcionalmente a la temporada
 * en la que se vio), de modo que una producción terminada sigue viva en el Archivo.
 */

export type Genre =
  | 'Comedia'
  | 'Drama'
  | 'Tragedia'
  | 'Teatro físico'
  | 'Cabaret'
  | 'Infantil'
  | 'Unipersonal'
  | 'Clásico'
  | 'Contemporáneo'
  | 'Musical'

export type AgeRating = 'Todo público' | '+12' | '+15' | '+18'

export interface Work {
  id: string
  title: string
  author: string
  year?: number
  note?: string
}

export type PosterLayout = 'rotulo' | 'sol' | 'franjas' | 'recorte' | 'slab'
export type PosterMotif = 'mascaras' | 'estrella' | 'cupula' | 'silla' | 'ojo' | 'corazon' | 'luna' | 'mano' | 'trole'

export interface PosterStyle {
  bg: string
  fg: string
  accent: string
  layout: PosterLayout
  motif: PosterMotif
}

export interface Credit {
  personId: string
  role: string // "Dirección", "Dramaturgia", "Actriz", ...
  character?: string
}

export interface ScheduleSlot {
  /** 0 = domingo ... 6 = sábado */
  day: number
  time: string // "20:00"
}

export type SeasonKind = 'Estreno' | 'Temporada' | 'Reposición'

export interface Season {
  id: string
  venueId: string
  kind: SeasonKind
  start: string // ISO yyyy-mm-dd
  end: string
  schedule: ScheduleSlot[]
  priceFrom: number
  priceTo: number
}

export interface Production {
  id: string
  workId: string
  /** Título con el que se anuncia la producción (puede diferir del de la obra) */
  title: string
  company: string
  genres: Genre[]
  durationMin: number
  age: AgeRating
  synopsis: string
  poster: PosterStyle
  /** Fotos de escena (ids de Unsplash, solo referencia visual en el prototipo). La primera es la principal. */
  photos?: string[]
  credits: Credit[]
  seasons: Season[]
}

export interface Person {
  id: string
  name: string
  roles: string[]
  bio: string
  from: string
}

export interface Venue {
  id: string
  name: string
  neighborhood: string
  alcaldia: string
  address: string
  /** Coordenadas en el mapa ilustrativo (0–100) */
  x: number
  y: number
  capacity: number
  founded?: number
  description: string
  access: string[]
  color: string
  /** Foto del recinto (id de Unsplash, referencia visual) */
  photo?: string
}

export interface CommunityUser {
  id: string
  name: string
  handle: string
  bio: string
  color: string
  followers: number
}

export interface CommunityReview {
  id: string
  userId: string
  productionId: string
  rating: number // 0.5 – 5
  text: string
  date: string
  likes: number
  spoiler?: boolean
}

// ——— Estado del usuario (vive en el dispositivo en el prototipo) ———

export interface DiaryEntry {
  id: string
  productionId: string
  seasonId?: string
  date: string
  rating?: number
  review?: string
  spoiler?: boolean
  /** Ciudad o país donde se vio (útil para obras fuera de la cartelera de CDMX) */
  place?: string
  createdAt: string
}

export interface UserProfile {
  name: string
  handle: string
  bio: string
  isDemo: boolean
}

export interface UserList {
  id: string
  name: string
  description: string
  productionIds: string[]
  createdAt: string
}

/** Solicitud para agregar una obra al catálogo; el equipo la revisa antes de publicarla */
export interface WorkSuggestion {
  id: string
  title: string
  author: string
  company: string
  country: string
  year: string
  note: string
  status: 'En revisión'
  createdAt: string
}
