/**
 * Mapa ilustrado de la Ciudad de México (no está a escala).
 * Coordenadas en un lienzo de 100 × 100; los teatros usan las mismas coordenadas.
 */
const INK = '#191919'

const hoods: { name: string; d: string; fill: string; lx: number; ly: number }[] = [
  { name: 'POLANCO', d: 'M8 10 L34 8 L36 24 L12 28Z', fill: '#E6DCC6', lx: 15, ly: 18 },
  { name: 'JUÁREZ', d: 'M36 28 L56 26 L58 40 L40 44Z', fill: '#E9D6CC', lx: 41, ly: 36 },
  { name: 'CENTRO', d: 'M56 18 L82 16 L84 40 L58 40Z', fill: '#F0D9A8', lx: 62, ly: 25 },
  { name: 'ROMA', d: 'M40 44 L58 40 L60 58 L42 60Z', fill: '#E3D3EE', lx: 45, ly: 52 },
  { name: 'CONDESA', d: 'M24 46 L40 44 L42 60 L26 64Z', fill: '#DCE6D2', lx: 26, ly: 57 },
  { name: 'NARVARTE', d: 'M44 60 L66 58 L68 76 L46 78Z', fill: '#E6DCC6', lx: 50, ly: 72 },
  { name: 'COYOACÁN', d: 'M44 80 L74 78 L76 98 L46 98Z', fill: '#E9D6CC', lx: 50, ly: 95 },
  { name: 'SAN ÁNGEL', d: 'M10 74 L40 76 L42 98 L12 98Z', fill: '#E3D3EE', lx: 15, ly: 95 },
]

export function CityMapBase({ labels = true, landmarks = true }: { labels?: boolean; landmarks?: boolean }) {
  return (
    <g>
      <rect width="100" height="100" fill="#EFE7D6" />
      {/* cuadrícula de calles */}
      <g stroke="#E2D7C1" strokeWidth=".35">
        {Array.from({ length: 34 }).map((_, i) => (
          <line key={'v' + i} x1={i * 3 + 1} y1="0" x2={i * 3 - 2} y2="100" />
        ))}
        {Array.from({ length: 34 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={i * 3} x2="100" y2={i * 3 + 1.5} />
        ))}
      </g>
      {hoods.map((h) => (
        <path key={h.name} d={h.d} fill={h.fill} opacity=".75" stroke="#D5C7AC" strokeWidth=".3" />
      ))}
      {/* Bosque de Chapultepec y lago */}
      <path d="M4 32 q10 -10 24 -4 q8 8 2 18 q-12 8 -24 2 q-6 -6 -2 -16z" fill="#C7D8BC" />
      <ellipse cx="14" cy="38" rx="4" ry="2.2" fill="#B6CBD9" />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={8 + ((i * 7) % 20)} cy={32 + ((i * 5) % 12)} r=".9" fill="#93B184" />
      ))}
      {/* Viveros */}
      <path d="M36 82 q5 -4 9 0 q2 5 -3 7 q-6 0 -6 -7z" fill="#C7D8BC" />
      {/* Avenidas */}
      <g fill="none" strokeLinecap="round">
        <path d="M14 30 L44 38 L64 26 L70 20" stroke="#FBF8F2" strokeWidth="2.4" />
        <path d="M14 30 L44 38 L64 26 L70 20" stroke="#E2C9A0" strokeWidth=".4" strokeDasharray="1 1" />
        <path d="M48 0 L50 100" stroke="#FBF8F2" strokeWidth="2.2" />
        <path d="M0 66 Q50 58 100 68" stroke="#FBF8F2" strokeWidth="2" />
        <path d="M74 0 L72 100" stroke="#FBF8F2" strokeWidth="1.6" />
        {/* línea de Metro ilustrativa */}
        <path d="M0 44 L30 44 L56 40 L80 34 L100 34" stroke="#E76F91" strokeWidth=".8" strokeDasharray="2 1.2" />
      </g>
      {labels && (
        <g fontFamily="'DM Sans', sans-serif" fontSize="2.2" fontWeight="700" fill="#8A8073" letterSpacing=".3">
          {hoods.map((h) => (
            <text key={h.name} x={h.lx} y={h.ly}>
              {h.name}
            </text>
          ))}
          <text x="6" y="48" fill="#5F7D52">
            CHAPULTEPEC
          </text>
          <text x="51" y="12" fill="#A39882" fontSize="1.8" transform="rotate(90 51 12)">
            INSURGENTES
          </text>
          <text x="20" y="31" fill="#A39882" fontSize="1.8" transform="rotate(14 20 31)">
            REFORMA
          </text>
        </g>
      )}
      {landmarks && (
        <g stroke={INK} strokeWidth=".35" strokeLinejoin="round">
          {/* Bellas Artes */}
          <g transform="translate(73 23)">
            <path d="M-4 2 H4 V0 H-4Z" fill="#FBF8F2" />
            <path d="M-2.6 0 Q-2.6 -3.4 0 -3.6 Q2.6 -3.4 2.6 0Z" fill="#E9B321" />
            <path d="M0 -3.6 V-4.6" />
          </g>
          {/* Torre Latinoamericana */}
          <path d="M79.6 31 V22 H81 V31Z M80.3 22 V20" fill="#FBF8F2" />
          {/* Ángel */}
          <g transform="translate(38 39)">
            <path d="M0 0 V-5" />
            <path d="M0 -5 L-1 -6.4 L0 -6 L1 -6.8 L0.6 -5.4Z" fill="#E9B321" />
          </g>
        </g>
      )}
    </g>
  )
}
