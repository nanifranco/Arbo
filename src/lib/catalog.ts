/**
 * Capa de acceso al catálogo.
 *
 * Las pantallas nunca importan los datos de demostración directamente: los piden aquí.
 * Para conectar una base de datos real basta con reemplazar las funciones de este archivo
 * (o convertirlas en consultas asíncronas) sin tocar los componentes.
 */
import { communityReviews, communityUsers, people, productions, venues, works } from '../data/demo'
import type { CommunityReview, Genre, Production, Season, Venue } from '../data/types'

// ——— Fechas ———

export const TODAY = startOfDay(new Date())

export function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}
export function parseISO(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const DAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export const fmt = {
  short: (iso: string) => {
    const d = parseISO(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  },
  dayMonth: (iso: string) => {
    const d = parseISO(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`
  },
  monthYear: (iso: string) => {
    const d = parseISO(iso)
    return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
  },
  weekday: (iso: string) => DAYS[parseISO(iso).getDay()],
  weekdayLong: (day: number) => DAYS_LONG[day],
  range: (a: string, b: string) => {
    const da = parseISO(a)
    const db = parseISO(b)
    const sameYear = da.getFullYear() === db.getFullYear()
    return `${da.getDate()} ${MONTHS[da.getMonth()]}${sameYear ? '' : ' ' + da.getFullYear()} – ${db.getDate()} ${MONTHS[db.getMonth()]} ${db.getFullYear()}`
  },
  price: (a: number, b: number) => (a === b ? `$${a}` : `$${a} – $${b}`),
  monthShort: (m: number) => MONTHS[m],
}

// ——— Búsqueda básica por id ———

export const getProduction = (id: string) => productions.find((p) => p.id === id)
export const getWork = (id: string) => works.find((w) => w.id === id)
export const getVenue = (id: string) => venues.find((v) => v.id === id)
export const getPerson = (id: string) => people.find((p) => p.id === id)
export const getCommunityUser = (id: string) => communityUsers.find((u) => u.id === id)
export const getSeason = (p: Production, seasonId?: string) => p.seasons.find((s) => s.id === seasonId)

export const allProductions = () => productions
export const allVenues = () => venues
export const allPeople = () => people
export const allCommunityUsers = () => communityUsers
export const allCommunityReviews = () => communityReviews

export const ALL_GENRES: Genre[] = ['Comedia', 'Drama', 'Tragedia', 'Teatro físico', 'Cabaret', 'Infantil', 'Unipersonal', 'Clásico', 'Contemporáneo', 'Musical']

// ——— Temporadas y estado de cartelera ———

export type Status = 'cartelera' | 'proximamente' | 'archivo'

export function seasonStatus(s: Season, today = TODAY): Status {
  if (parseISO(s.end) < today) return 'archivo'
  if (parseISO(s.start) > today) return 'proximamente'
  return 'cartelera'
}

/** Temporada vigente, o la próxima, o la más reciente; y el estado que le corresponde */
export function currentSeason(p: Production): { season: Season; status: Status } {
  const running = p.seasons.find((s) => seasonStatus(s) === 'cartelera')
  if (running) return { season: running, status: 'cartelera' }
  const upcoming = p.seasons
    .filter((s) => seasonStatus(s) === 'proximamente')
    .sort((a, b) => a.start.localeCompare(b.start))[0]
  if (upcoming) return { season: upcoming, status: 'proximamente' }
  const last = [...p.seasons].sort((a, b) => b.end.localeCompare(a.end))[0]
  return { season: last, status: 'archivo' }
}

export const STATUS_LABEL: Record<Status, string> = {
  cartelera: 'En cartelera',
  proximamente: 'Próximamente',
  archivo: 'Archivo',
}

export interface Performance {
  date: string
  time: string
  seasonId: string
}

/** Funciones generadas a partir del horario semanal de la temporada */
export function upcomingPerformances(season: Season, count = 6, from = TODAY): Performance[] {
  const out: Performance[] = []
  const start = parseISO(season.start)
  const end = parseISO(season.end)
  const d = new Date(Math.max(from.getTime(), start.getTime()))
  let guard = 0
  while (d <= end && out.length < count && guard < 400) {
    const slots = season.schedule.filter((s) => s.day === d.getDay()).sort((a, b) => a.time.localeCompare(b.time))
    for (const s of slots) if (out.length < count) out.push({ date: toISO(d), time: s.time, seasonId: season.id })
    d.setDate(d.getDate() + 1)
    guard++
  }
  return out
}

export function performsOn(season: Season, date: Date) {
  const iso = toISO(date)
  if (iso < season.start || iso > season.end) return []
  return season.schedule.filter((s) => s.day === date.getDay())
}

// ——— Comunidad ———

export function reviewsFor(productionId: string): CommunityReview[] {
  return communityReviews.filter((r) => r.productionId === productionId).sort((a, b) => b.date.localeCompare(a.date))
}

/** Calificación promedio de la comunidad (incluye la del usuario si existe) */
export function ratingStats(productionId: string, own: number[] = []) {
  const ratings = [...reviewsFor(productionId).map((r) => r.rating), ...own]
  // Base de calificaciones de demostración adicionales para que el histograma no se vea vacío
  const seed = demoRatingBase[productionId] ?? []
  const all = [...ratings, ...seed]
  const count = all.length
  const avg = count ? all.reduce((a, b) => a + b, 0) / count : 0
  const dist = [1, 2, 3, 4, 5].map((star) => all.filter((r) => Math.ceil(r) === star).length)
  return { avg, count, dist }
}

const demoRatingBase: Record<string, number[]> = {
  trolebus: [4, 4.5, 5, 3.5, 4, 4, 3, 4.5, 5, 4],
  jacaranda: [4, 4, 3.5, 5, 4.5, 3, 4, 4],
  azotea: [4, 3.5, 4, 4.5, 3],
  sonambulos: [3, 4, 3.5, 4.5, 3, 4],
  'medea-barrio': [5, 4.5, 5, 4, 5, 4.5, 4, 5, 3.5],
  programa: [4.5, 5, 4, 4.5],
  cartografia: [5, 4.5, 4.5, 4],
  loteria: [4.5, 5, 4, 4],
  charol: [4, 3.5, 4.5, 4, 3, 4],
  'casa-dos-puertas': [4, 3.5, 4, 4.5],
  'fuera-de-cuadro': [4.5, 5, 4, 4.5, 5],
  mudanzas: [],
}

export function popularity(productionId: string) {
  const reviews = reviewsFor(productionId)
  return reviews.length * 10 + reviews.reduce((a, r) => a + r.likes, 0) / 5 + (demoRatingBase[productionId]?.length ?? 0) * 2
}

// ——— Relaciones ———

export function creditsOf(personId: string) {
  return productions.flatMap((p) => p.credits.filter((c) => c.personId === personId).map((c) => ({ production: p, credit: c })))
}

export function productionsAtVenue(venueId: string) {
  const items = productions.flatMap((p) => p.seasons.filter((s) => s.venueId === venueId).map((s) => ({ production: p, season: s, status: seasonStatus(s) })))
  return {
    cartelera: items.filter((i) => i.status === 'cartelera'),
    proximamente: items.filter((i) => i.status === 'proximamente'),
    archivo: items.filter((i) => i.status === 'archivo').sort((a, b) => b.season.end.localeCompare(a.season.end)),
  }
}

export function venueOfCurrent(p: Production): Venue | undefined {
  return getVenue(currentSeason(p).season.venueId)
}

// ——— Búsqueda de texto ———

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

export function searchAll(q: string) {
  const n = normalize(q)
  if (!n) return { productions: [], venues: [], people: [] }
  const hit = (...fields: string[]) => fields.some((f) => normalize(f).includes(n))
  return {
    productions: productions.filter((p) => {
      const w = getWork(p.workId)
      return hit(p.title, p.company, w?.title ?? '', w?.author ?? '', ...p.genres)
    }),
    venues: venues.filter((v) => hit(v.name, v.neighborhood, v.alcaldia)),
    people: people.filter((p) => hit(p.name, ...p.roles)),
  }
}
