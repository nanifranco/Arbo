import { useId, useState, type ReactNode } from 'react'
import { unsplash } from './Photo'
import { currentSeason, fmt, getPerson, getVenue } from '../lib/catalog'
import type { PosterMotif, Production } from '../data/types'

/**
 * Cartel generado para cada producción de demostración (sustituye al cartel oficial).
 * Inspirado en la gráfica de teatro independiente: risografía a dos tintas con desfase,
 * semitonos, letra de cartel condensada, rótulo a pincel, créditos y fechas como en un cartel real.
 */

const INK = '#191919'
const CREAM = '#F5F0E6'
const MARKER = "'Permanent Marker', 'Marker Felt', cursive"
const DISPLAY = "'Anton', Impact, 'Arial Narrow', sans-serif"
const MONO = "'Courier Prime', 'Courier New', monospace"

function wrap(text: string, max: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

function Figure({ x, y, s = 1, color, pose = 0 }: { x: number; y: number; s?: number; color: string; pose?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <circle cx="0" cy="-58" r="9" />
      <path d={pose === 0 ? 'M-12 -46 Q0 -50 12 -46 L16 -10 L10 -10 L8 30 L2 30 L0 -4 L-2 30 L-8 30 L-10 -10 L-16 -10Z' : 'M-12 -46 Q0 -50 12 -46 L26 -66 L30 -62 L16 -36 L12 -8 L10 30 L3 30 L0 -2 L-4 30 L-11 30 L-10 -10 L-22 -20 L-18 -26 L-10 -18Z'} />
    </g>
  )
}

export function Motif({ kind, color, accent }: { kind: PosterMotif; color: string; accent: string }) {
  const s = { stroke: color, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'mascaras':
      return (
        <g>
          <g transform="rotate(-12) translate(-16 0)">
            <path d="M-18 -20 Q0 -28 18 -20 Q20 6 0 22 Q-20 6 -18 -20z" fill={color} />
            <path d="M-10 -8 q4 -4 8 0M2 -8 q4 -4 8 0M-8 8 q8 6 16 0" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <g transform="rotate(14) translate(18 6)">
            <path d="M-18 -20 Q0 -28 18 -20 Q20 6 0 22 Q-20 6 -18 -20z" fill={accent} stroke={color} strokeWidth="2.5" />
            <path d="M-10 -6 q4 4 8 0M2 -6 q4 4 8 0M-8 12 q8 -6 16 0" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )
    case 'estrella':
      return (
        <g {...s} strokeWidth={5}>
          <path d="M0 -30 C1 -10 -1 10 1 30" />
          <path d="M-26 -14 C-8 -4 10 5 26 15" />
          <path d="M26 -15 C9 -4 -9 6 -26 16" />
          <circle r="5" fill={accent} stroke="none" />
        </g>
      )
    case 'cupula':
      return (
        <g {...s} fill="none">
          <path d="M-34 26h68M-30 26v-14h60v14" fill={accent} />
          <path d="M-24 12 Q-24 -22 0 -24 Q24 -22 24 12Z" fill={accent} />
          <path d="M0 -24 Q-8 -6 -14 12 M0 -24 Q8 -6 14 12 M0 -24 V12" strokeWidth="2" />
          <path d="M-6 -24 V-32 H6 V-24 M0 -32 V-40" />
          <path d="M-22 26 v-10 M-10 26 v-10 M2 26 v-10 M14 26 v-10" strokeWidth="2.2" />
        </g>
      )
    case 'silla':
      return (
        <g {...s} fill="none">
          <path d="M-14 -28 Q0 -34 14 -28 L12 0 H-12 Z" fill={accent} />
          <path d="M-16 0h32M-13 0 -16 30M13 0 16 30M-8 0 -10 22M8 0 10 22" />
          <text x="0" y="-12" textAnchor="middle" fontFamily={MARKER} fontSize="8" fill={color} stroke="none">
            ✱
          </text>
        </g>
      )
    case 'ojo':
      return (
        <g {...s} fill="none">
          <path d="M-32 0 Q0 -26 32 0 Q0 26 -32 0z" fill={CREAM} />
          <circle r="11" fill={accent} stroke="none" />
          <circle r="4.5" fill={color} stroke="none" />
          <path d="M-22 -16 -26 -24M0 -20v-10M22 -16 26 -24M-12 -19 -14 -28M12 -19 14 -28" />
        </g>
      )
    case 'corazon':
      return (
        <g>
          <path d="M0 26 C-30 6 -32 -18 -14 -22 C-6 -24 -1 -18 0 -12 C1 -18 6 -24 14 -22 C32 -18 30 6 0 26z" fill={accent} stroke={color} strokeWidth="3" />
          <path d="M-20 -30 -14 -38M0 -32v-8M20 -30 14 -38" {...s} />
          <path d="M-6 -6 L6 4 M-4 6 L8 -4" {...s} strokeWidth="2" />
        </g>
      )
    case 'luna':
      return (
        <g>
          <path d="M8 -27 A28 28 0 1 0 8 27 A30 30 0 0 0 8 -27z" fill={color} />
          <circle cx="22" cy="-18" r="3" fill={accent} />
          <circle cx="28" cy="6" r="2" fill={accent} />
          <circle cx="-30" cy="-26" r="1.6" fill={accent} />
        </g>
      )
    case 'mano':
      return (
        <g {...s} fill="none">
          <path d="M0 30 C-16 12 -22 2 -22 -8 A22 22 0 0 1 22 -8 C22 2 16 12 0 30z" fill={accent} />
          <circle cy="-8" r="8" fill={color} stroke="none" />
          <path d="M-34 32 Q-10 24 0 30 Q12 36 34 28" strokeDasharray="4 5" />
        </g>
      )
    case 'trole':
      return (
        <g {...s} fill="none">
          <path d="M-12 -18 -26 -36M8 -18 -6 -36" strokeWidth="2.4" />
          <rect x="-34" y="-18" width="68" height="34" rx="6" fill={accent} />
          <path d="M-26 -10h12v10h-12zM-8 -10h12v10H-8zM10 -10h16v10H10z" fill={color} stroke="none" opacity=".85" />
          <circle cx="-20" cy="18" r="5" fill={color} stroke="none" />
          <circle cx="20" cy="18" r="5" fill={color} stroke="none" />
        </g>
      )
  }
}

export function IllustratedPoster({ production, className = '', showCompany = true }: { production: Production; className?: string; showCompany?: boolean }) {
  const id = useId().replace(/:/g, '')
  const { bg, fg, accent, layout, motif } = production.poster
  const title = production.title
  const { season } = currentSeason(production)
  const venue = getVenue(season.venueId)
  const director = production.credits.find((c) => /Dirección/.test(c.role))
  const cast = production.credits.filter((c) => /Act|Intérprete|Titiritera/.test(c.role)).slice(0, 3)
  const credits = [director && `DIRECCIÓN ${getPerson(director.personId)?.name.toUpperCase()}`, cast.length && `CON ${cast.map((c) => getPerson(c.personId)?.name.toUpperCase()).join(' · ')}`].filter(Boolean) as string[]
  const dates = `${fmt.dayMonth(season.start)} — ${fmt.dayMonth(season.end)}`.toUpperCase()
  const pat = `h${id}`
  const seed = title.length

  let art: ReactNode
  let footerInk = fg
  const footerTop = layout === 'recorte'

  if (layout === 'rotulo') {
    const lines = wrap(title.toUpperCase(), 10)
    const size = Math.min(40, 220 / Math.max(...lines.map((l) => l.length)))
    footerInk = bg
    art = (
      <>
        <rect x="0" y="0" width="200" height="300" fill={`url(#${pat})`} opacity=".22" />
        <rect x="0" y="222" width="200" height="78" fill={accent} />
        <g transform="translate(152 196) rotate(8) scale(1.15)">
          <Motif kind={motif} color={fg} accent={bg} />
        </g>
        <g transform="rotate(-5 100 100)">
          {lines.map((l, i) => (
            <text key={'m' + i} x="16.5" y={62 + i * size * 1.02 + 1.5} fontFamily={MARKER} fontSize={size} fill={accent} opacity=".9">
              {l}
            </text>
          ))}
          {lines.map((l, i) => (
            <text key={i} x="14" y={62 + i * size * 1.02} fontFamily={MARKER} fontSize={size} fill={fg}>
              {l}
            </text>
          ))}
          <path d={`M14 ${70 + (lines.length - 1) * size * 1.02 + 8} C 60 ${64 + lines.length * size} 110 ${74 + lines.length * size} 150 ${66 + lines.length * size}`} stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      </>
    )
  } else if (layout === 'sol') {
    const lines = wrap(title.toUpperCase(), 13)
    const lh = Math.min(26, 64 / lines.length)
    art = (
      <>
        <circle cx="100" cy="112" r="68" fill={accent} />
        <circle cx="100" cy="112" r="68" fill={`url(#${pat})`} opacity=".45" />
        <circle cx="104" cy="108" r="68" fill="none" stroke={fg} strokeWidth="1" opacity=".5" />
        <g transform="translate(100 112) scale(1.55)">
          <Motif kind={motif} color={fg} accent={bg} />
        </g>
        {lines.map((l, i) => (
          <g key={i}>
            <text x="101.5" y={208 + i * lh + 1.5} textAnchor="middle" fontFamily={DISPLAY} fontSize={lh} textLength={Math.min(176, l.length * lh * 0.62)} lengthAdjust="spacingAndGlyphs" fill={accent} opacity=".8">
              {l}
            </text>
            <text x="100" y={208 + i * lh} textAnchor="middle" fontFamily={DISPLAY} fontSize={lh} textLength={Math.min(176, l.length * lh * 0.62)} lengthAdjust="spacingAndGlyphs" fill={fg}>
              {l}
            </text>
          </g>
        ))}
      </>
    )
  } else if (layout === 'franjas') {
    const lines = wrap(title, 12)
    const size = Math.min(28, 190 / Math.max(...lines.map((l) => l.length)))
    art = (
      <>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="0" y={i * 44 + 6} width="200" height="18" fill={accent} opacity=".6" />
        ))}
        <rect x="7" y="7" width="186" height="286" fill="none" stroke={fg} strokeWidth="1.5" />
        <rect x="10" y="10" width="180" height="280" fill="none" stroke={fg} strokeWidth=".6" />
        <g transform={`rotate(${(seed % 5) - 3} 100 120)`}>
          <rect x="18" y="74" width="164" height={lines.length * size * 1.08 + 28} fill={CREAM} />
          <rect x="18" y="74" width="164" height={lines.length * size * 1.08 + 28} fill={`url(#${pat})`} opacity=".08" />
          {lines.map((l, i) => (
            <text key={i} x="100" y={98 + i * size * 1.08 + size * 0.4} textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={INK}>
              {l}
            </text>
          ))}
          <rect x="70" y="68" width="60" height="12" fill="#F6E3A8" opacity=".85" transform="rotate(-4 100 74)" />
        </g>
        <g transform="translate(100 214) scale(1.15)">
          <Motif kind={motif} color={fg} accent={accent} />
        </g>
      </>
    )
  } else if (layout === 'recorte') {
    const lines = wrap(title, 12)
    const size = Math.min(26, 186 / Math.max(...lines.map((l) => l.length)))
    const dark = bg !== CREAM
    const paper = dark ? CREAM : INK
    const ink = dark ? INK : CREAM
    const spot = dark ? '#FFF6D8' : '#191919'
    art = (
      <>
        <path d="M86 0 L114 0 L170 200 L30 200Z" fill={spot} opacity={dark ? 0.16 : 0.1} />
        <path d="M86 0 L114 0 L170 200 L30 200Z" fill={`url(#${pat})`} opacity=".25" />
        <ellipse cx="100" cy="196" rx="70" ry="10" fill={spot} opacity={dark ? 0.22 : 0.12} />
        <Figure x={88} y={164} s={1.25} color={dark ? '#0d0d0d' : INK} pose={seed % 2} />
        <Figure x={128} y={170} s={1.0} color={dark ? '#0d0d0d' : INK} pose={(seed + 1) % 2} />
        <g transform="translate(166 96) scale(.7)">
          <Motif kind={motif} color={accent} accent={fg} />
        </g>
        <path
          d={`M8 206 L40 201 L70 208 L110 200 L150 207 L192 201 L194 ${222 + lines.length * size * 1.08} L150 ${228 + lines.length * size * 1.08} L100 ${221 + lines.length * size * 1.08} L50 ${229 + lines.length * size * 1.08} L6 ${222 + lines.length * size * 1.08} Z`}
          fill={paper}
        />
        {lines.map((l, i) => (
          <text key={i} x="100" y={226 + i * size * 1.08} textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={ink}>
            {l}
          </text>
        ))}
      </>
    )
  } else {
    // slab: letra de cartel gigante que llena el ancho
    const lines = wrap(title.toUpperCase(), 8)
    const lh = Math.min(54, 170 / lines.length)
    art = (
      <>
        <rect x="0" y="0" width="200" height="300" fill={`url(#${pat})`} opacity=".18" />
        {lines.map((l, i) => (
          <g key={i}>
            <text x="13" y={78 + i * lh * 0.92 + 2} fontFamily={DISPLAY} fontSize={lh} textLength={Math.min(174, l.length * lh * 0.58)} lengthAdjust="spacingAndGlyphs" fill={accent}>
              {l}
            </text>
            <text x="11" y={78 + i * lh * 0.92} fontFamily={DISPLAY} fontSize={lh} textLength={Math.min(174, l.length * lh * 0.58)} lengthAdjust="spacingAndGlyphs" fill={fg}>
              {l}
            </text>
          </g>
        ))}
        <g transform={`translate(148 ${Math.min(214, 78 + lines.length * lh * 0.92 + 16)}) rotate(-10) scale(1.2)`} style={{ mixBlendMode: 'multiply' }}>
          <Motif kind={motif} color={fg} accent={accent} />
        </g>
      </>
    )
  }

  return (
    <svg viewBox="0 0 200 300" className={`block h-auto w-full ${className}`} role="img" aria-label={`Cartel de ${title}`}>
      <defs>
        <pattern id={pat} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="2.5" cy="2.5" r="1.25" fill={fg} />
        </pattern>
        <filter id={`g${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={seed} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .3 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset=".55" stopColor="#000" stopOpacity=".07" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill={bg} />
      {showCompany && venue && (
        <text x="100" y="20" textAnchor="middle" fontFamily={MONO} fontSize="6.4" fontWeight="700" fill={layout === 'rotulo' ? fg : fg} opacity=".85" letterSpacing=".6">
          {`${venue.name.toUpperCase()} PRESENTA`}
        </text>
      )}
      {art}
      {showCompany && (
        <g fill={footerInk}>
          <text x="14" y={footerTop ? 40 : layout === 'franjas' ? 270 : 266} fontFamily={DISPLAY} fontSize="13" letterSpacing=".5">
            {dates}
          </text>
          {credits.map((c, i) => (
            <text key={i} x="14" y={(footerTop ? 49 : layout === 'franjas' ? 279 : 276) + i * 7.5} fontFamily={MONO} fontSize="5" fontWeight="700" opacity=".9">
              {c.slice(0, 52)}
            </text>
          ))}
        </g>
      )}
      {/* desgaste: dobleces, brillo y grano */}
      <path d="M0 150 H200 M100 0 V300" stroke="#000" strokeOpacity=".05" strokeWidth="1" />
      <rect width="200" height="300" fill={`url(#w${id})`} />
      <rect width="200" height="300" filter={`url(#g${id})`} />
      {seed % 3 === 0 && <path d="M200 0 L184 0 L200 14Z" fill={CREAM} opacity=".9" />}
    </svg>
  )
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
}

/**
 * Cartel fotográfico: foto de escena en duotono con los colores de la producción,
 * título tipográfico, fechas y créditos. Si la foto no carga, usa el cartel ilustrado.
 */
export function Poster({ production, className = '', showCompany = true }: { production: Production; className?: string; showCompany?: boolean }) {
  const [failed, setFailed] = useState(false)
  const photo = production.photos?.[0]
  if (!photo || failed) return <IllustratedPoster production={production} className={className} showCompany={showCompany} />

  const { bg, fg, accent, layout } = production.poster
  const dark = luminance(bg) < 70
  const cream = bg === CREAM
  const { season } = currentSeason(production)
  const venue = getVenue(season.venueId)
  const director = production.credits.find((c) => /Dirección/.test(c.role))
  const cast = production.credits.filter((c) => /Act|Intérprete|Titiritera/.test(c.role)).slice(0, 3)
  const title = production.title
  const longest = Math.max(...title.split(' ').map((w) => w.length))
  const useMarker = layout === 'rotulo' || layout === 'franjas' || layout === 'recorte'
  const titleSize = useMarker ? Math.min(15, 150 / Math.max(longest + 2, title.length / 2.2)) : Math.min(22, 175 / Math.max(longest + 1, title.length / 2.6))
  const band = cream ? INK : bg
  const bandText = cream ? CREAM : fg

  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden ${className}`} style={{ containerType: 'inline-size', background: band }} role="img" aria-label={`Cartel de ${title}`}>
      {/* foto en duotono */}
      <img
        src={unsplash(photo, 600)}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="absolute inset-x-0 top-0 h-[78%] w-full object-cover"
        style={{ filter: dark || cream ? 'grayscale(1) contrast(1.2) brightness(.95)' : 'grayscale(1) contrast(1.25) brightness(1.05)', mixBlendMode: dark || cream ? 'normal' : 'multiply' }}
      />
      {(dark || cream) && <div className="absolute inset-x-0 top-0 h-[78%]" style={{ background: accent, mixBlendMode: 'soft-light', opacity: 0.55 }} />}
      {/* fundido hacia la banda de color */}
      <div className="absolute inset-x-0 top-[38%] h-[41%]" style={{ background: `linear-gradient(to bottom, transparent, ${band})` }} />

      {showCompany && venue && (
        <div className="absolute inset-x-0 top-0 px-[6cqw] pt-[5cqw] text-center font-mono font-bold uppercase tracking-wider" style={{ fontSize: '3.3cqw', color: dark || cream ? '#FBF8F2' : INK, textShadow: dark || cream ? '0 1px 2px rgba(0,0,0,.6)' : '0 1px 0 rgba(255,255,255,.4)' }}>
          {venue.name} presenta
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 px-[6cqw] pb-[5cqw]">
        {layout === 'franjas' || layout === 'recorte' ? (
          <div className="mb-[3cqw] inline-block -rotate-2 px-[3.5cqw] py-[2cqw] shadow-md" style={{ background: CREAM, color: INK }}>
            <div className="font-marker leading-[1]" style={{ fontSize: `${titleSize * 0.85}cqw` }}>
              {title}
            </div>
          </div>
        ) : (
          <div className={`${useMarker ? 'font-marker normal-case' : 'font-display uppercase'} mb-[2cqw] leading-[0.92]`} style={{ fontSize: `${titleSize}cqw`, color: bandText, textShadow: `0.6cqw 0.6cqw 0 ${accent}` }}>
            {title}
          </div>
        )}
        {showCompany && (
          <>
            <div className="font-display uppercase tracking-wide" style={{ fontSize: '6.4cqw', color: bandText, lineHeight: 1.05 }}>
              {fmt.dayMonth(season.start)} — {fmt.dayMonth(season.end)}
            </div>
            <div className="mt-[1cqw] font-mono font-bold uppercase leading-tight opacity-85" style={{ fontSize: '2.6cqw', color: bandText }}>
              {director && <div className="truncate">Dirección {getPerson(director.personId)?.name}</div>}
              {cast.length > 0 && <div className="truncate">Con {cast.map((c) => getPerson(c.personId)?.name).join(' · ')}</div>}
            </div>
          </>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: 'var(--grain)', opacity: 0.7 }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.12), transparent 45%, rgba(0,0,0,.06) 55%, transparent)' }} />
    </div>
  )
}
