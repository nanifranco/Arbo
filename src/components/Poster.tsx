import { useId } from 'react'
import type { PosterMotif, Production } from '../data/types'

/**
 * Cartel tipográfico generado para cada producción de demostración.
 * Sustituye al "cartel oficial" mientras no haya imágenes reales de las compañías.
 */

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

function Motif({ kind, color, accent }: { kind: PosterMotif; color: string; accent: string }) {
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
          <path d="M-30 24h60M-26 24v-14h52v14M-22 10a22 22 0 0 1 44 0" />
          <path d="M-14 -4 Q0 -18 14 -4" />
          <path d="M0 -12v-10M-3 -22h6" />
          <path d="M-18 24v-10M-6 24v-10M6 24v-10M18 24v-10" strokeWidth="2.4" />
          <circle cy="-26" r="3" fill={accent} stroke="none" />
        </g>
      )
    case 'silla':
      return (
        <g {...s} fill="none">
          <path d="M-14 -28 Q0 -34 14 -28 L12 0 H-12 Z" fill={accent} />
          <path d="M-16 0h32M-13 0 -16 30M13 0 16 30M-8 0 -10 22M8 0 10 22" />
        </g>
      )
    case 'ojo':
      return (
        <g {...s} fill="none">
          <path d="M-32 0 Q0 -26 32 0 Q0 26 -32 0z" />
          <circle r="10" fill={accent} stroke="none" />
          <circle r="4" fill={color} stroke="none" />
          <path d="M-22 -16 -26 -24M0 -20v-10M22 -16 26 -24" />
        </g>
      )
    case 'corazon':
      return (
        <g>
          <path d="M0 26 C-30 6 -32 -18 -14 -22 C-6 -24 -1 -18 0 -12 C1 -18 6 -24 14 -22 C32 -18 30 6 0 26z" fill={accent} stroke={color} strokeWidth="3" />
          <path d="M-20 -30 -14 -38M0 -32v-8M20 -30 14 -38" {...s} />
        </g>
      )
    case 'luna':
      return (
        <g>
          <path d="M10 -28 A28 28 0 1 0 10 28 A22 22 0 1 1 10 -28z" fill={color} />
          <circle cx="22" cy="-18" r="3" fill={accent} />
          <circle cx="28" cy="6" r="2" fill={accent} />
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

export function Poster({ production, className = '', showCompany = true }: { production: Production; className?: string; showCompany?: boolean }) {
  const id = useId().replace(/:/g, '')
  const { bg, fg, accent, layout, motif } = production.poster
  const title = production.title
  const marker = "'Permanent Marker', 'Marker Felt', cursive"
  const slab = "'Alfa Slab One', Rockwell, Georgia, serif"
  const mono = "'Courier Prime', 'Courier New', monospace"

  let body: JSX.Element
  if (layout === 'rotulo') {
    const lines = wrap(title, 11)
    const size = Math.min(40, 230 / Math.max(...lines.map((l) => l.length)))
    body = (
      <>
        <rect x="0" y="210" width="200" height="90" fill={accent} />
        <g transform="translate(150 255) rotate(8)">
          <Motif kind={motif} color={fg} accent={bg} />
        </g>
        <g transform="rotate(-4 100 100)">
          {lines.map((l, i) => (
            <text key={i} x="14" y={52 + i * size * 1.02} fontFamily={marker} fontSize={size} fill={fg}>
              {l.toUpperCase()}
            </text>
          ))}
        </g>
      </>
    )
  } else if (layout === 'sol') {
    const lines = wrap(title, 14)
    const size = Math.min(26, 190 / Math.max(...lines.map((l) => l.length)))
    body = (
      <>
        <circle cx="100" cy="104" r="62" fill={accent} />
        <g transform="translate(100 104) scale(1.35)">
          <Motif kind={motif} color={fg} accent={bg} />
        </g>
        {lines.map((l, i) => (
          <text key={i} x="100" y={208 + i * size * 1.15} textAnchor="middle" fontFamily={slab} fontSize={size} fill={fg}>
            {l.toUpperCase()}
          </text>
        ))}
      </>
    )
  } else if (layout === 'franjas') {
    const lines = wrap(title, 12)
    const size = Math.min(30, 200 / Math.max(...lines.map((l) => l.length)))
    body = (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="0" y={i * 50 + 10} width="200" height="20" fill={accent} opacity=".55" />
        ))}
        <g transform="rotate(-3 100 120)">
          <rect x="16" y={78} width="168" height={lines.length * size * 1.1 + 26} fill="#F5F0E6" />
          {lines.map((l, i) => (
            <text key={i} x="100" y={100 + i * size * 1.1 + size * 0.45} textAnchor="middle" fontFamily={marker} fontSize={size} fill="#191919">
              {l}
            </text>
          ))}
        </g>
        <g transform="translate(100 236) scale(1.1)">
          <Motif kind={motif} color={fg} accent={accent} />
        </g>
      </>
    )
  } else if (layout === 'recorte') {
    const lines = wrap(title, 12)
    const size = Math.min(28, 190 / Math.max(...lines.map((l) => l.length)))
    const paper = bg === '#F5F0E6' ? '#191919' : '#F5F0E6'
    const ink = bg === '#F5F0E6' ? '#F5F0E6' : '#191919'
    body = (
      <>
        <g transform="translate(100 92) scale(1.5)">
          <Motif kind={motif} color={fg} accent={accent} />
        </g>
        <path d={`M8 172 L40 168 L70 175 L110 167 L150 174 L192 168 L194 ${190 + lines.length * size * 1.1} L150 ${196 + lines.length * size * 1.1} L100 ${189 + lines.length * size * 1.1} L50 ${197 + lines.length * size * 1.1} L6 ${190 + lines.length * size * 1.1} Z`} fill={paper} />
        {lines.map((l, i) => (
          <text key={i} x="100" y={192 + i * size * 1.1 + size * 0.1} textAnchor="middle" fontFamily={marker} fontSize={size} fill={ink}>
            {l}
          </text>
        ))}
      </>
    )
  } else {
    const lines = wrap(title, 9)
    const size = Math.min(34, 168 / Math.max(...lines.map((l) => l.length)) * 1.05)
    body = (
      <>
        <g transform="translate(152 70) rotate(-10) scale(1.1)">
          <Motif kind={motif} color={fg} accent={accent} />
        </g>
        {lines.map((l, i) => (
          <text key={i} x="14" y={150 + i * size * 1.05} fontFamily={slab} fontSize={size} fill={fg}>
            {l.toUpperCase()}
          </text>
        ))}
        <rect x="14" y={150 + lines.length * size * 1.05 - size * 0.55} width="60" height="5" fill={accent} />
      </>
    )
  }

  return (
    <svg viewBox="0 0 200 300" className={`block w-full h-auto ${className}`} role="img" aria-label={`Cartel de ${title}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`g${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed={title.length} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width="200" height="300" fill={bg} />
      {body}
      {showCompany && (
        <text x="14" y="288" fontFamily={mono} fontSize="9" fontWeight="700" fill={layout === 'rotulo' ? bg : fg} opacity=".9">
          {production.company.toUpperCase().slice(0, 30)}
        </text>
      )}
      <rect width="200" height="300" filter={`url(#g${id})`} />
    </svg>
  )
}
