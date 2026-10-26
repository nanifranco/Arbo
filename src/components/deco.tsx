/**
 * Recursos gráficos de ÁRBO: cinta, sellos, rótulos pintados, notas a mano, marquesina,
 * ilustraciones de la ciudad, retratos en semitono, fachadas y mapas de butacas.
 * Todo se dibuja con SVG/CSS: sin fotografías inventadas.
 */
import { useId, type CSSProperties, type ReactNode } from 'react'

export const INK = '#191919'
export const CREAM = '#F5F0E6'
export const PAPER = '#FBF8F2'

export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return Math.abs(h)
}

export function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
}

// ——— Cinta ———
export function Tape({ className = '', style, tone = 'yellow' }: { className?: string; style?: CSSProperties; tone?: 'yellow' | 'pink' | 'clear' }) {
  return <span aria-hidden="true" className={`tape ${tone === 'pink' ? 'tape-pink' : tone === 'clear' ? 'tape-clear' : ''} ${className}`} style={style} />
}

// ——— Sello de goma ———
export function Stamp({ children, color = '#B71C1C', rotate = -8, className = '', size = 'md', animate = false }: { children: ReactNode; color?: string; rotate?: number; className?: string; size?: 'sm' | 'md' | 'lg'; animate?: boolean }) {
  const id = useId().replace(/:/g, '')
  const pad = { sm: 'px-1.5 py-0.5 text-[11px]', md: 'px-2.5 py-1 text-sm', lg: 'px-4 py-1.5 text-xl' }[size]
  return (
    <span className={`relative inline-block ${animate ? 'stamp-in' : ''} ${className}`} style={{ rotate: `${rotate}deg`, color }}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={`st${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="t" />
          <feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </svg>
      <span
        className={`inline-block rounded-[5px] border-[2.5px] font-display uppercase leading-none tracking-wide ${pad}`}
        style={{ borderColor: color, outline: `1.5px solid ${color}`, outlineOffset: 2, filter: `url(#st${id})` }}
      >
        {children}
      </span>
    </span>
  )
}

// ——— Nota a mano con flecha opcional ———
export function HandNote({ children, arrow, className = '', color = '#B71C1C' }: { children: ReactNode; arrow?: 'left' | 'down' | 'right' | 'up'; className?: string; color?: string }) {
  const arrows = {
    left: 'M44 6 C 30 4, 14 8, 4 18 M4 18 L 14 17 M4 18 L 7 8',
    right: 'M4 6 C 18 4, 34 8, 44 18 M44 18 L 34 17 M44 18 L 41 8',
    down: 'M8 2 C 6 14, 10 26, 22 34 M22 34 L 12 32 M22 34 L 20 24',
    up: 'M22 34 C 10 26, 6 14, 8 2 M8 2 L 3 11 M8 2 L 15 9',
  }
  return (
    <span className={`inline-flex items-center gap-1 font-hand leading-none ${className}`} style={{ color }}>
      {arrow === 'left' && (
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d={arrows.left} />
        </svg>
      )}
      <span>{children}</span>
      {(arrow === 'right' || arrow === 'down' || arrow === 'up') && (
        <svg width={arrow === 'right' ? 48 : 28} height={arrow === 'right' ? 24 : 38} viewBox={arrow === 'right' ? '0 0 48 24' : '0 0 28 38'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d={arrows[arrow]} />
        </svg>
      )}
    </span>
  )
}

// ——— Círculo trazado a mano alrededor de un elemento ———
export function Circled({ children, color = '#B71C1C', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M8 22 C 6 8, 40 3, 62 4 C 88 5, 98 14, 94 26 C 90 37, 50 39, 26 35 C 8 32, 2 22, 14 12" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}

// ——— Marquesina ———
export function Marquee({ items, className = '', tone = 'rojo' }: { items: string[]; className?: string; tone?: 'rojo' | 'tinta' | 'amarillo' }) {
  const colors = { rojo: 'bg-rojo text-papel', tinta: 'bg-tinta text-amarillo', amarillo: 'bg-amarillo text-tinta' }[tone]
  const run = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-4 font-display text-lg uppercase tracking-wide">{t}</span>
          <span aria-hidden="true" className="font-marker text-xl text-amarillo">
            ✱
          </span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`overflow-hidden py-2 ${colors} ${className}`} aria-label={items.join(', ')}>
      <div className="marquee-track" aria-hidden="true">
        {run}
        {run}
        {run}
        {run}
      </div>
    </div>
  )
}

// ——— Rótulo pintado (cartel callejero) ———
export function PaintedSign({ lines, bg = '#E9B321', fg = INK, className = '', rotate = -2, note }: { lines: string[]; bg?: string; fg?: string; className?: string; rotate?: number; note?: string }) {
  return (
    <div className={`torn-bottom relative px-4 pb-6 pt-4 ${className}`} style={{ background: bg, color: fg, rotate: `${rotate}deg`, backgroundImage: 'var(--grain)' }}>
      {lines.map((l, i) => (
        <div key={i} className="font-marker uppercase leading-[0.95]" style={{ fontSize: `clamp(1.25rem, ${4.4 - l.length * 0.08}vw, 2.6rem)` }}>
          {l}
        </div>
      ))}
      {note && <div className="mt-2 font-hand text-lg leading-none opacity-80">{note}</div>}
    </div>
  )
}

// ——— Calcomanía circular ———
export function Sticker({ children, bg = '#E76F91', fg = INK, size = 76, rotate = 10, className = '' }: { children: ReactNode; bg?: string; fg?: string; size?: number; rotate?: number; className?: string }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-full text-center font-display uppercase leading-[0.95] shadow-[0_3px_0_rgba(0,0,0,.15)] ${className}`}
      style={{ width: size, height: size, background: bg, color: fg, rotate: `${rotate}deg`, fontSize: size * 0.17, border: `3px solid ${PAPER}` }}
    >
      <span className="px-1.5">{children}</span>
    </span>
  )
}

// ——— Horizonte de la ciudad en tinta ———
export function Skyline({ className = '', ink = INK, showTaxi = true }: { className?: string; ink?: string; showTaxi?: boolean }) {
  const s = { stroke: ink, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  return (
    <svg viewBox="0 0 600 170" className={`block h-auto w-full ${className}`} aria-hidden="true">
      {/* jacarandas */}
      {[
        [34, 92, 40],
        [78, 104, 30],
        [560, 96, 38],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M${x} 160 L${x} ${y + 10} M${x} ${y + 26} L${x - 12} ${y + 8} M${x} ${y + 20} L${x + 10} ${y + 6}`} {...s} fill="none" />
          <circle cx={x} cy={y} r={r} fill="#9C7BC4" opacity=".55" />
          <circle cx={x - r * 0.4} cy={y - r * 0.3} r={r * 0.62} fill="#B79AD8" opacity=".6" />
          <circle cx={x + r * 0.45} cy={y + r * 0.1} r={r * 0.55} fill="#8A68B8" opacity=".5" />
          {Array.from({ length: 14 }).map((_, k) => (
            <circle key={k} cx={x + Math.cos(k * 2.4) * r * 0.8} cy={y + Math.sin(k * 1.7) * r * 0.7} r="2.2" fill="#E9D8FA" />
          ))}
        </g>
      ))}
      {/* Torre Latinoamericana */}
      <g>
        <path d="M128 160 V44 H160 V160" fill={PAPER} {...s} />
        <path d="M132 44 L136 26 H152 L156 44 M139 26 L141 14 H147 L149 26 M144 14 V2" fill={PAPER} {...s} />
        {Array.from({ length: 19 }).map((_, i) => (
          <path key={i} d={`M128 ${52 + i * 6} H160`} stroke={ink} strokeWidth=".8" opacity=".55" />
        ))}
        <path d="M144 44 V160" stroke={ink} strokeWidth=".8" opacity=".5" />
      </g>
      {/* Palacio de Bellas Artes */}
      <g>
        <path d="M196 160 V112 H404 V160" fill={PAPER} {...s} />
        <path d="M190 112 H410 M196 120 H404" {...s} fill="none" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M${212 + i * 16} 124 V156`} stroke={ink} strokeWidth="1.4" />
        ))}
        <path d="M282 160 V138 Q300 128 318 138 V160" fill="#E9B321" {...s} />
        {/* cúpula central */}
        <path d="M252 112 Q252 60 300 56 Q348 60 348 112 Z" fill="#E9B321" {...s} />
        {[-36, -18, 0, 18, 36].map((dx) => (
          <path key={dx} d={`M${300 + dx * 0.15} 57 Q${300 + dx} 80 ${300 + dx * 1.3} 112`} stroke={ink} strokeWidth="1.3" fill="none" />
        ))}
        <path d="M258 96 Q300 88 342 96" stroke={ink} strokeWidth="1.2" fill="none" />
        <path d="M288 56 V44 H312 V56" fill="#E9B321" {...s} />
        <path d="M292 44 Q300 30 308 44" fill="#E9B321" {...s} />
        <path d="M300 32 V20 M296 22 L300 16 L304 22" {...s} fill="none" />
        {/* cúpulas laterales */}
        {[214, 386].map((x) => (
          <g key={x}>
            <path d={`M${x - 14} 112 Q${x - 14} 90 ${x} 88 Q${x + 14} 90 ${x + 14} 112Z`} fill="#E9B321" {...s} />
            <path d={`M${x} 88 V80`} {...s} />
          </g>
        ))}
      </g>
      {/* farol */}
      <g>
        <path d="M430 160 V90 M424 90 H436 L433 80 H427Z" {...s} fill={PAPER} />
        <circle cx="430" cy="86" r="10" fill="#E9B321" opacity=".35" />
      </g>
      {/* Ángel de la Independencia */}
      <g>
        <path d="M470 160 V58 M464 160 V150 H476 V160 M466 58 H474" {...s} fill="none" />
        <path d="M470 56 L462 44 L470 48 L478 40 L474 52Z M470 48 V36" fill="#E9B321" {...s} />
      </g>
      {/* puesto callejero */}
      <g>
        <path d="M498 160 V128 H548 V160" fill={PAPER} {...s} />
        <path d="M492 128 L500 112 H546 L554 128Z" fill="#B71C1C" {...s} />
        {[504, 516, 528, 540].map((x) => (
          <path key={x} d={`M${x} 112 L${x - 3} 128`} stroke={PAPER} strokeWidth="4" />
        ))}
        <path d="M492 128 L500 112 H546 L554 128Z" fill="none" {...s} />
        <rect x="506" y="136" width="10" height="14" fill="#E76F91" stroke={ink} strokeWidth="1.2" />
        <rect x="522" y="134" width="10" height="16" fill="#E9B321" stroke={ink} strokeWidth="1.2" />
        <rect x="536" y="138" width="8" height="12" fill="#21418F" stroke={ink} strokeWidth="1.2" />
      </g>
      {/* taxi rosa */}
      {showTaxi && (
        <g transform="translate(330 136)">
          <path d="M0 18 V10 Q2 4 10 4 L18 -4 H42 L52 4 Q62 5 62 12 V18Z" fill="#E76F91" {...s} />
          <path d="M20 -2 H30 V4 H14Z M33 -2 H41 L47 4 H33Z" fill={PAPER} stroke={ink} strokeWidth="1.2" />
          <rect x="24" y="-10" width="14" height="5" fill={PAPER} stroke={ink} strokeWidth="1.2" />
          <circle cx="14" cy="19" r="5" fill={ink} />
          <circle cx="50" cy="19" r="5" fill={ink} />
        </g>
      )}
      <path d="M0 160.5 H600" stroke={ink} strokeWidth="2.4" />
    </svg>
  )
}

// ——— Retrato en semitono (sin foto real) ———
export function HalftonePortrait({ seed, bg: accentBg = '#23452E', className = '', label }: { seed: string; bg?: string; ink?: string; className?: string; label?: string }) {
  const id = useId().replace(/:/g, '')
  // Retrato monocromo tipo foto de archivo; el color de acento solo aparece como franja inferior
  const bg = '#2B2825'
  const ink = '#E8DFCD'
  const h = hash(seed)
  const hair = h % 4
  const tilt = (h % 7) - 3
  const head = (
    <g transform={`rotate(${tilt} 100 120)`}>
      <ellipse cx="100" cy="92" rx="36" ry="44" />
      <path d="M82 128 L80 150 Q100 160 120 150 L118 128Z" />
      <path d="M22 240 Q26 168 100 156 Q174 168 178 240Z" />
      {hair === 0 && <path d="M62 86 Q60 40 100 38 Q144 38 140 90 Q130 60 100 62 Q74 62 62 86Z" />}
      {hair === 1 && <path d="M60 100 Q52 36 102 36 Q150 38 142 104 Q150 150 128 160 Q140 110 132 70 Q100 54 70 72 Q60 112 72 160 Q52 140 60 100Z" />}
      {hair === 2 && <path d="M64 78 Q74 44 104 46 Q134 48 138 78 Q120 62 100 64 Q78 64 64 78Z M128 56 Q150 30 162 48 Q150 58 136 66Z" />}
      {hair === 3 && <path d="M60 92 Q54 46 92 40 Q118 30 138 48 Q150 64 142 94 Q134 72 122 66 Q104 76 80 70 Q66 76 60 92Z" />}
    </g>
  )
  return (
    <svg viewBox="0 0 200 240" className={`block h-auto w-full ${className}`} role="img" aria-label={label ?? 'Retrato ilustrado'}>
      <defs>
        <pattern id={`d${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="2" cy="2" r="1.35" fill={ink} />
        </pattern>
        <pattern id={`f${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="2" cy="2" r=".55" fill={ink} />
        </pattern>
        <radialGradient id={`g${id}`} cx="35%" cy="25%" r="80%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`m${id}`}>
          <g fill={`url(#g${id})`}>{head}</g>
        </mask>
      </defs>
      <rect width="200" height="240" fill={bg} />
      <rect width="200" height="240" fill={`url(#f${id})`} opacity=".35" />
      <g fill={`url(#d${id})`}>{head}</g>
      <rect width="200" height="240" fill={bg} mask={`url(#m${id})`} opacity=".55" />
      <rect y="232" width="200" height="8" fill={accentBg} />
    </svg>
  )
}

// ——— Fachada del teatro ———
export type FacadeStyle = 'bodega' | 'proscenio' | 'azotea' | 'casona' | 'mercado' | 'cochera' | 'arcos'

export function Facade({ name, color, style, className = '' }: { name: string; color: string; style: FacadeStyle; className?: string }) {
  const s = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const }
  const signFg = isLight(color) ? INK : PAPER
  const short = name.length > 18 ? name.replace(/^(Teatro|Foro|Sala) /, '') : name
  const fs = Math.min(22, 300 / short.length)
  const sign = (y: number, w = 220) => (
    <g>
      <rect x={200 - w / 2} y={y} width={w} height="34" rx="3" fill={color} {...s} />
      {Array.from({ length: Math.floor(w / 14) }).map((_, i) => (
        <circle key={i} cx={200 - w / 2 + 7 + i * 14} cy={y - 5} r="2.6" fill="#E9B321" stroke={INK} strokeWidth=".8" />
      ))}
      <text x="200" y={y + 24} textAnchor="middle" fontFamily="'Permanent Marker', cursive" fontSize={fs} fill={signFg}>
        {short.toUpperCase()}
      </text>
    </g>
  )
  const posters = (x: number, y: number, n = 3) =>
    Array.from({ length: n }).map((_, i) => {
      const cols = ['#B71C1C', '#E9B321', '#E76F91', '#21418F', '#23452E']
      return <rect key={i} x={x + i * 18} y={y + (i % 2) * 3} width="14" height="20" fill={cols[(i + name.length) % cols.length]} stroke={INK} strokeWidth="1" transform={`rotate(${(i % 3) - 1} ${x + i * 18} ${y})`} />
    })
  let body: ReactNode
  switch (style) {
    case 'proscenio':
      body = (
        <g>
          <path d="M70 200 V70 L200 30 L330 70 V200" fill={PAPER} {...s} />
          {[100, 150, 250, 300].map((x) => (
            <rect key={x} x={x - 10} y="120" width="20" height="40" rx="10" fill="#9C7BC4" opacity=".35" stroke={INK} strokeWidth="1.5" />
          ))}
          <path d="M175 200 V140 Q200 120 225 140 V200" fill="#B71C1C" {...s} />
          {sign(78, 200)}
          {posters(92, 170)}
          {posters(254, 170)}
        </g>
      )
      break
    case 'azotea':
      body = (
        <g>
          <path d="M90 200 V60 H310 V200" fill={PAPER} {...s} />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={110 + c * 38} y={74 + r * 30} width="20" height="18" fill={r === 0 && c % 2 ? '#E9B321' : '#EFE7D6'} stroke={INK} strokeWidth="1.2" />),
          )}
          <path d="M110 60 V36 H170 V60 M120 36 V26 M160 36 V26" {...s} fill="none" />
          <path d="M200 40 L320 40" stroke={INK} strokeWidth="1.2" />
          {[210, 232, 254, 276, 298].map((x, i) => (
            <rect key={x} x={x} y="40" width="12" height={14 + (i % 2) * 5} fill={['#E76F91', '#E9B321', '#21418F', '#B71C1C', '#F5F0E6'][i]} stroke={INK} strokeWidth=".8" />
          ))}
          {sign(4, 190)}
          <path d="M180 200 V170 H220 V200" fill="#23452E" {...s} />
        </g>
      )
      break
    case 'casona':
      body = (
        <g>
          <path d="M60 200 V80 H340 V200" fill="#F2D9C4" {...s} />
          <path d="M60 80 H340 V92 H60Z" fill={color} {...s} />
          {[100, 160, 240, 300].map((x) => (
            <g key={x}>
              <rect x={x - 14} y="108" width="28" height="44" fill="#EFE7D6" {...s} />
              <path d={`M${x - 18} 152 H${x + 18} M${x - 14} 108 Q${x} 98 ${x + 14} 108`} {...s} fill="none" />
            </g>
          ))}
          <path d="M176 200 V140 Q200 116 224 140 V200" fill="#6B3E1F" {...s} />
          <path d="M200 200 V132" stroke={INK} strokeWidth="1.2" />
          {sign(42, 230)}
        </g>
      )
      break
    case 'mercado':
      body = (
        <g>
          <path d="M40 200 V96 H360 V200" fill={PAPER} {...s} />
          <path d="M40 96 L200 56 L360 96" fill="#E9B321" {...s} />
          {[70, 130, 190, 250, 310].map((x, i) => (
            <g key={x}>
              <path d={`M${x - 24} 150 L${x - 18} 136 H${x + 18} L${x + 24} 150Z`} fill={['#B71C1C', '#E76F91', '#21418F', '#23452E', '#B71C1C'][i]} {...s} />
              <rect x={x - 22} y="150" width="44" height="50" fill="#EFE7D6" stroke={INK} strokeWidth="1.4" />
              <text x={x} y="148" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="7" fill={PAPER}>
                {['FRUTAS', 'JUGOS', 'FONDA', 'FLORES', 'TEATRO'][i]}
              </text>
            </g>
          ))}
          {sign(100, 250)}
        </g>
      )
      break
    case 'cochera':
      body = (
        <g>
          <path d="M40 200 V90 Q200 40 360 90 V200" fill="#DCCFB8" {...s} />
          {[90, 150, 250, 310].map((x) => (
            <path key={x} d={`M${x - 22} 200 V140 Q${x} 116 ${x + 22} 140 V200`} fill="#EFE7D6" {...s} />
          ))}
          <path d="M168 200 V128 Q200 100 232 128 V200" fill={INK} {...s} />
          <path d="M176 200 V136 M224 200 V136 M168 160 H232" stroke="#E9B321" strokeWidth="2" />
          {sign(70, 230)}
        </g>
      )
      break
    case 'arcos':
      body = (
        <g>
          <path d="M30 200 V96 H370 V200" fill="#CDBFA6" {...s} />
          {[70, 130, 190, 250, 310].map((x) => (
            <path key={x} d={`M${x - 24} 200 V140 Q${x} 104 ${x + 24} 140 V200`} fill="#1F3A28" {...s} />
          ))}
          {[70, 130, 190, 250, 310].map((x) => (
            <circle key={x} cx={x} cy="132" r="3" fill="#E9B321" />
          ))}
          {sign(58, 230)}
          <path d="M30 96 H370" stroke={INK} strokeWidth="3" />
        </g>
      )
      break
    default:
      // bodega
      body = (
        <g>
          <path d="M50 200 V82 L200 60 L350 82 V200" fill="#E7DCC6" {...s} />
          <rect x="100" y="120" width="200" height="80" fill="#3A3A3A" {...s} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M100 ${128 + i * 8} H300`} stroke="#6B6B6B" strokeWidth="1.2" />
          ))}
          <path d="M170 200 V150 H230 V200" fill="#E9B321" {...s} />
          {posters(110, 124, 3)}
          {posters(246, 124, 3)}
          {sign(80, 240)}
          <path d="M60 192 L84 176 M330 190 L314 172" stroke="#B71C1C" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
  }
  return (
    <svg viewBox="0 0 400 210" className={`block h-auto w-full ${className}`} aria-hidden="true">
      <rect width="400" height="210" fill="transparent" />
      {body}
      <path d="M0 200.5 H400" stroke={INK} strokeWidth="2.4" />
    </svg>
  )
}

// ——— Mapa de butacas: el aforo como visualización ———
export function SeatMap({ capacity, color = '#B71C1C', className = '' }: { capacity: number; color?: string; className?: string }) {
  const rows = Math.max(4, Math.min(14, Math.round(Math.sqrt(capacity / 2.4))))
  const seats: { x: number; y: number }[] = []
  // longitud de cada fila proporcional a su radio
  const radii = Array.from({ length: rows }, (_, r) => 34 + r * (150 / rows))
  const total = radii.reduce((a, b) => a + b, 0)
  let placed = 0
  radii.forEach((R, r) => {
    const n = r === rows - 1 ? capacity - placed : Math.round((capacity * R) / total)
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.16 + (0.68 * (i + 0.5)) / n)
      seats.push({ x: 160 + Math.cos(a) * R * 0.95, y: 30 + Math.sin(a) * R })
    }
    placed += n
  })
  const r = Math.max(1.3, Math.min(4.2, 640 / capacity))
  return (
    <svg viewBox="0 0 320 200" className={`block h-auto w-full ${className}`} role="img" aria-label={`Mapa ilustrativo de ${capacity} butacas`}>
      <path d="M100 8 H220 V24 Q160 34 100 24Z" fill={INK} />
      <text x="160" y="20" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="10" fill={CREAM} letterSpacing="2">
        ESCENARIO
      </text>
      {seats.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r} fill={i % 23 === 7 ? '#E9B321' : color} />
      ))}
    </svg>
  )
}

// ——— Separador con asteriscos ———
export function StarRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-rojo ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-linea" />
      <span className="font-marker text-lg">✱</span>
      <span className="h-px flex-1 bg-linea" />
    </div>
  )
}

/** Estilo de fachada de cada recinto de demostración */
export const FACADE: Record<string, FacadeStyle> = {
  'foro-la-banqueta': 'bodega',
  'teatro-jacaranda': 'proscenio',
  'sala-la-azotea': 'azotea',
  'foro-el-zaguan': 'casona',
  'teatro-del-mercado': 'mercado',
  'teatro-tranvia': 'cochera',
  'foro-los-arcos': 'arcos',
}
