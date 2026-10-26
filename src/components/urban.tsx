/**
 * Gráfica urbana de ÁRBO: pictogramas de recinto (en el espíritu de la señalética del Metro,
 * con dibujos propios), diagrama "Ruta Teatral" con los teatros como estaciones,
 * letreros de estación y toldo de puesto callejero.
 */
import type { ReactNode } from 'react'
import { productionsAtVenue } from '../lib/catalog'
import type { Venue } from '../data/types'

const W = '#FBF8F2'

// ——— Pictogramas ———

const PICTO: Record<string, ReactNode> = {
  // cortina metálica de bodega
  'foro-la-banqueta': (
    <g fill="none" stroke={W} strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 7h14v12H5z" />
      <path d="M5 10h14M5 13h14M5 16h14" />
      <path d="M4 7l8-3 8 3" />
    </g>
  ),
  // telón
  'teatro-jacaranda': (
    <g fill={W}>
      <path d="M4 5h16v2H4z" />
      <path d="M5 7h5c0 5-1 9 1 12H5z" />
      <path d="M19 7h-5c0 5 1 9-1 12h6z" />
    </g>
  ),
  // tinaco en la azotea
  'sala-la-azotea': (
    <g fill={W}>
      <rect x="8" y="5" width="8" height="8" rx="2" />
      <path d="M9 13v3M15 13v3" stroke={W} strokeWidth="1.6" />
      <path d="M4 16h16v3H4z" />
    </g>
  ),
  // zaguán
  'foro-el-zaguan': (
    <g fill="none" stroke={W} strokeWidth="1.8">
      <path d="M6 20V10a6 6 0 0 1 12 0v10" />
      <path d="M12 6v14M9 14h.5M15 14h-.5" strokeLinecap="round" />
    </g>
  ),
  // sandía del mercado
  'teatro-del-mercado': (
    <g>
      <path d="M4 9a8 8 0 0 0 16 0z" fill={W} />
      <path d="M6 9a6 6 0 0 0 12 0z" fill="#B71C1C" />
      <circle cx="10" cy="11.5" r=".9" fill="#191919" />
      <circle cx="13.5" cy="12" r=".9" fill="#191919" />
      <circle cx="12" cy="14" r=".9" fill="#191919" />
    </g>
  ),
  // tranvía
  'teatro-tranvia': (
    <g fill="none" stroke={W} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="7" width="12" height="10" rx="2" />
      <path d="M6 12h12M9 17l-2 3M15 17l2 3M10 7l2-3 2 3" />
    </g>
  ),
  // arcos
  'foro-los-arcos': (
    <g fill="none" stroke={W} strokeWidth="1.8">
      <path d="M4 19V11a4 4 0 0 1 8 0v8M12 19V11a4 4 0 0 1 8 0v8M3 19h18" />
    </g>
  ),
  // estrella de marquesina
  'gran-teatro-reforma': (
    <g fill={W}>
      <path d="M12 3l2.4 5.3 5.6.6-4.2 3.8 1.2 5.6L12 15.5 7 18.3l1.2-5.6L4 8.9l5.6-.6z" />
    </g>
  ),
  // máscara de luchador (dibujo propio, genérico)
  'teatro-arena-doctores': (
    <g>
      <path d="M12 3c4.5 0 7 3.5 7 8s-3 9-7 9-7-4.5-7-9 2.5-8 7-8z" fill={W} />
      <path d="M8 10c1-.8 2.5-.8 3 0-.6 1-2.4 1-3 0zM16 10c-1-.8-2.5-.8-3 0 .6 1 2.4 1 3 0z" fill="#191919" />
      <path d="M10 15.5h4" stroke="#191919" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 3v4" stroke="#B71C1C" strokeWidth="1.6" />
    </g>
  ),
}

export function VenuePictogram({ venue, size = 36, className = '' }: { venue: Pick<Venue, 'id' | 'color' | 'name'>; size?: number; className?: string }) {
  const bg = venue.color === '#E9B321' || venue.color === '#E76F91' ? '#191919' : venue.color
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-[22%] shadow-[inset_0_0_0_2px_rgba(255,255,255,.25)] ${className}`} style={{ width: size, height: size, background: bg }} aria-hidden="true">
      <svg viewBox="0 0 24 24" style={{ width: size * 0.7, height: size * 0.7 }}>
        {PICTO[venue.id] ?? <circle cx="12" cy="12" r="6" fill={W} />}
      </svg>
    </span>
  )
}

// ——— Letrero de estación ———

export function StationSign({ venue, title, subtitle, className = '' }: { venue?: Pick<Venue, 'id' | 'color' | 'name'>; title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-md bg-[#20242b] px-3 py-2.5 text-papel shadow-[0_8px_18px_-12px_rgba(0,0,0,.8)] ring-1 ring-black/40 ${className}`}>
      {venue ? (
        <VenuePictogram venue={venue} size={44} />
      ) : (
        <span className="grid size-11 shrink-0 place-items-center rounded-[22%] bg-metro font-sign text-[20px]" aria-hidden="true">
          Á
        </span>
      )}
      <div className="min-w-0">
        <div className="truncate font-sign text-[22px] uppercase leading-none md:text-[28px]">{title}</div>
        {subtitle && <div className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-papel/65">{subtitle}</div>}
      </div>
    </div>
  )
}

// ——— Toldo de puesto ———

export function Awning({ colors = ['#B71C1C', '#FBF8F2'], className = '', label }: { colors?: [string, string] | string[]; className?: string; label?: string }) {
  const stripes = 18
  return (
    <div className={`relative ${className}`} aria-hidden={!label}>
      <svg viewBox={`0 0 ${stripes * 10} 26`} preserveAspectRatio="none" className="block h-10 w-full md:h-12">
        {Array.from({ length: stripes }).map((_, i) => (
          <g key={i}>
            <rect x={i * 10} y="0" width="10" height="18" fill={colors[i % 2]} />
            <path d={`M${i * 10} 18 a5 6 0 0 0 10 0z`} fill={colors[i % 2]} />
          </g>
        ))}
        <rect x="0" y="0" width={stripes * 10} height="3" fill="#191919" opacity=".25" />
      </svg>
      {label && (
        <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-sm bg-tinta px-3 py-0.5 font-sign text-[13px] uppercase tracking-wide text-amarillo md:text-[15px]">
          {label}
        </span>
      )}
    </div>
  )
}

// ——— Diagrama "Ruta Teatral" ———

export const LINES = [
  { id: 'rosa', name: 'Línea Rosa', note: 'Avenidas y estrenos', color: '#E4007C', stops: ['gran-teatro-reforma', 'teatro-tranvia', 'sala-la-azotea', 'teatro-arena-doctores'] },
  { id: 'verde', name: 'Línea Verde', note: 'Teatro de barrio', color: '#00843D', stops: ['teatro-del-mercado', 'teatro-jacaranda', 'teatro-arena-doctores', 'foro-la-banqueta', 'foro-el-zaguan'] },
  { id: 'naranja', name: 'Línea Naranja', note: 'De la Juárez a la Narvarte', color: '#E87722', stops: ['teatro-tranvia', 'teatro-jacaranda', 'foro-la-banqueta'] },
  { id: 'amarilla', name: 'Línea Amarilla', note: 'Rumbo al sur', color: '#F7B500', stops: ['gran-teatro-reforma', 'teatro-del-mercado', 'foro-los-arcos', 'foro-el-zaguan'] },
]

// posiciones esquemáticas (no geográficas) y lado de la etiqueta
type Side = 'above' | 'below' | 'right' | 'br'
const POS: Record<string, [number, number, Side]> = {
  'gran-teatro-reforma': [22, 24, 'above'],
  'teatro-tranvia': [60, 24, 'above'],
  'sala-la-azotea': [100, 24, 'above'],
  'teatro-del-mercado': [22, 50, 'br'],
  'teatro-jacaranda': [60, 50, 'below'],
  'teatro-arena-doctores': [100, 50, 'right'],
  'foro-la-banqueta': [100, 72, 'right'],
  'foro-los-arcos': [22, 74, 'br'],
  'foro-el-zaguan': [64, 86, 'below'],
}

/** Nombre corto de estación: sin "Teatro", "Foro", "Sala" */
export const stationName = (name: string) => name.replace(/^(Gran Teatro|Teatro|Foro|Sala)\s+/i, '').replace(/^(del|de la|de)\s+/i, '')

function segment([x1, y1]: readonly [number, number, ...unknown[]], [x2, y2]: readonly [number, number, ...unknown[]]) {
  if (x1 === x2 || y1 === y2) return `L${x2} ${y2}`
  const dx = x2 - x1
  const dy = y2 - y1
  const d = Math.min(Math.abs(dx), Math.abs(dy))
  if (Math.abs(dy) > Math.abs(dx)) return `L${x1} ${y2 - Math.sign(dy) * d} L${x2} ${y2}`
  return `L${x2 - Math.sign(dx) * d} ${y1} L${x2} ${y2}`
}

const OFFSET: Record<string, [number, number]> = { rosa: [0, -0.9], verde: [0, 0.9], naranja: [0.9, 0], amarilla: [-0.9, 0] }

export function TheaterRoute({ venues, onSelect, selected }: { venues: Venue[]; onSelect: (id: string) => void; selected?: string; compact?: boolean }) {
  const byId = Object.fromEntries(venues.map((v) => [v.id, v]))
  const transfers = new Set(Object.keys(POS).filter((id) => LINES.filter((l) => l.stops.includes(id)).length > 1))
  const FS = 2.6
  const CH = 1.85 // ancho aproximado por carácter (Bungee)
  return (
    <div>
      <div className="no-scrollbar overflow-x-auto">
        <svg viewBox="0 0 150 98" className="block h-auto w-full min-w-[560px]" role="group" aria-label="Diagrama Ruta Teatral: los teatros como estaciones">
          <rect width="150" height="98" fill="#F4F1EA" />
          <g stroke="#E6E0D3" strokeWidth=".2">
            {Array.from({ length: 31 }).map((_, i) => (
              <line key={i} x1={i * 5} y1="0" x2={i * 5} y2="98" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={i} x1="0" y1={i * 5} x2="150" y2={i * 5} />
            ))}
          </g>
          {LINES.map((l) => {
            const pts = l.stops.filter((s) => POS[s]).map((s) => POS[s])
            const [ox, oy] = OFFSET[l.id]
            const d = `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((p, i) => segment(pts[i], p)).join(' ')
            return <path key={l.id} d={d} transform={`translate(${ox} ${oy})`} fill="none" stroke={l.color} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" />
          })}
          {Object.entries(POS).map(([id, [x, y, side]]) => {
            const v = byId[id]
            if (!v) return null
            const count = productionsAtVenue(id).cartelera.length
            const active = selected === id
            const name = stationName(v.name).toUpperCase()
            const w = 6 + 1.2 + name.length * CH
            const [lx, ly] = side === 'above' ? [x - w / 2, y - 11] : side === 'below' ? [x - w / 2, y + 4] : side === 'right' ? [x + 4, y - 3] : [x + 2.8, y + 4]
            const bg = v.color === '#E9B321' || v.color === '#E76F91' ? '#191919' : v.color
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`${v.name}, ${count} obras en cartelera`}
                aria-pressed={active}
                onClick={() => onSelect(id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(id)}
                className="cursor-pointer focus:outline-none"
              >
                {active && <circle cx={x} cy={y} r="5.2" fill="#191919" opacity=".14" />}
                {transfers.has(id) ? <rect x={x - 2.8} y={y - 2.8} width="5.6" height="5.6" rx="2.8" fill="#fff" stroke="#191919" strokeWidth=".75" /> : <circle cx={x} cy={y} r="2" fill="#fff" stroke="#191919" strokeWidth=".75" />}
                <g transform={`translate(${lx} ${ly})`}>
                  <rect x="-1" y="-1" width={w + 2} height="8" rx="1.4" fill={active ? '#FFF6D8' : '#F4F1EA'} opacity=".92" />
                  <rect width="6" height="6" rx="1.3" fill={bg} />
                  <svg x=".6" y=".6" width="4.8" height="4.8" viewBox="0 0 24 24">
                    {PICTO[id]}
                  </svg>
                  {count > 0 && (
                    <g transform="translate(5.6 0)">
                      <circle r="1.7" fill="#B71C1C" stroke="#fff" strokeWidth=".4" />
                      <text y=".75" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="2" fill="#fff">
                        {count}
                      </text>
                    </g>
                  )}
                  <text x="7.4" y="4.6" fontFamily="'Bungee', sans-serif" fontSize={FS} fill="#191919">
                    {name}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {LINES.map((l) => (
          <li key={l.id} className="flex items-center gap-2 text-[12px]">
            <span className="h-1.5 w-7 rounded-full" style={{ background: l.color }} />
            <b>{l.name}</b>
            <span className="text-gris">{l.note}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-[12px] text-gris">
          <span className="grid size-4 place-items-center rounded-full bg-rojo text-[9px] font-bold text-papel">2</span> obras en cartelera
        </li>
      </ul>
    </div>
  )
}
