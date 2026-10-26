/**
 * Lenguaje "Marquesina": el glamour de la cartelera (focos, telón, programa de mano)
 * cruzado con la gráfica urbana de la CDMX (placas de calle, señalética de Metro, neón).
 */
import type { CSSProperties, ReactNode } from 'react'

// ——— Marquesina con focos ———

function BulbRow({ n, vertical = false }: { n: number; vertical?: boolean }) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : ''} justify-between`} aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="bulb" style={{ animationDelay: `${(i % 4) * 0.4}s` }} />
      ))}
    </div>
  )
}

export function MarqueeSign({ top, children, bottom, className = '', compact = false }: { top?: ReactNode; children: ReactNode; bottom?: ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={`relative rounded-[6px] bg-[#1b1416] p-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] ring-2 ring-oro ${className}`}>
      <div className="absolute inset-x-3 top-1"><BulbRow n={compact ? 14 : 22} /></div>
      <div className="absolute inset-x-3 bottom-1"><BulbRow n={compact ? 14 : 22} /></div>
      <div className="absolute inset-y-4 left-1"><BulbRow n={compact ? 3 : 5} vertical /></div>
      <div className="absolute inset-y-4 right-1"><BulbRow n={compact ? 3 : 5} vertical /></div>
      <div className={`relative mx-2.5 my-2 rounded-[3px] border border-oro/50 bg-gradient-to-b from-[#fbf3df] to-[#efe2c2] text-center text-tinta ${compact ? 'px-3 py-2' : 'px-4 py-3 md:px-8 md:py-4'}`}>
        {top && <div className="font-display text-[12px] uppercase tracking-[0.3em] text-rojo md:text-[14px]">{top}</div>}
        <div className={`font-display uppercase leading-[0.95] tracking-wide ${compact ? 'text-[22px]' : 'text-[30px] md:text-[46px]'}`}>{children}</div>
        {bottom && <div className="mt-1 font-display text-[12px] uppercase tracking-[0.25em] text-grafito md:text-[14px]">{bottom}</div>}
      </div>
    </div>
  )
}

// ——— Neón (Eje Central de noche) ———

export function Neon({ children, color = '#FF3B8D', className = '', flicker = false, as: Tag = 'span' }: { children: ReactNode; color?: string; className?: string; flicker?: boolean; as?: 'span' | 'h2' | 'h1' | 'div' }) {
  return (
    <Tag className={`neon ${flicker ? 'neon-flicker' : ''} ${className}`} style={{ ['--neon-color' as string]: color } as CSSProperties}>
      {children}
    </Tag>
  )
}

// ——— Señalética de Metro (estación ficticia por colonia) ———

const LINE_COLORS: Record<string, string> = {
  Centro: '#E4007C',
  'Roma Norte': '#00A4E4',
  Condesa: '#F7B500',
  Juárez: '#6CBE45',
  Narvarte: '#9B7FB6',
  Coyoacán: '#E87722',
  'San Ángel': '#00843D',
  Doctores: '#C8102E',
  Tacubaya: '#8E7A5B',
}

export function MetroChip({ name, small = false }: { name: string; small?: boolean }) {
  const c = LINE_COLORS[name] ?? '#E4007C'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-papel pr-2 font-sans font-bold text-tinta ring-1 ring-tinta/15 ${small ? 'text-[11px]' : 'text-[12.5px]'}`}>
      <span className={`grid place-items-center rounded-[5px] text-papel ${small ? 'size-5' : 'size-6'}`} style={{ background: c }} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={small ? 'size-3.5' : 'size-4'} fill="currentColor">
          <path d="M5 4h14v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM8 20l-2 2M16 20l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="7.5" y="6.5" width="9" height="5" rx="1" fill={c} />
          <circle cx="9" cy="15" r="1.2" fill={c} />
          <circle cx="15" cy="15" r="1.2" fill={c} />
        </svg>
      </span>
      {name}
    </span>
  )
}

// ——— Placa de calle CDMX ———

export function StreetPlate({ street, colonia, className = '' }: { street: string; colonia: string; className?: string }) {
  return (
    <div className={`inline-flex flex-col overflow-hidden rounded-[4px] border-2 border-white/90 bg-placa text-left text-white shadow-[0_6px_14px_-8px_rgba(0,0,0,.6)] ring-1 ring-tinta/30 ${className}`}>
      <span className="px-3 pt-1.5 font-sign text-[15px] uppercase leading-none tracking-wide">{street}</span>
      <span className="mt-1 border-t border-white/40 bg-[#163273] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em]">Col. {colonia}</span>
    </div>
  )
}

// ——— Laurel con cita de reseña ———

export function Laurel({ children, source, light = false }: { children: ReactNode; source?: string; light?: boolean }) {
  const c = light ? '#F3DC9B' : '#B8862A'
  const leaf = (flip: boolean) => (
    <svg viewBox="0 0 20 48" className="h-10 w-4 shrink-0" style={{ transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <path d="M16 46 C 6 36, 4 20, 12 2" stroke={c} strokeWidth="1.6" fill="none" />
      {[8, 16, 24, 32, 40].map((y, i) => (
        <ellipse key={y} cx={i % 2 ? 8 : 12} cy={y} rx="4.2" ry="2" transform={`rotate(${i % 2 ? -35 : 35} ${i % 2 ? 8 : 12} ${y})`} fill={c} />
      ))}
    </svg>
  )
  return (
    <div className={`inline-flex items-center gap-1 ${light ? 'text-oro-claro' : 'text-[#7a5a17]'}`}>
      {leaf(false)}
      <div className="text-center leading-tight">
        <div className="font-playbill text-[14px]">{children}</div>
        {source && <div className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em] opacity-80">{source}</div>}
      </div>
      {leaf(true)}
    </div>
  )
}

// ——— Encabezado tipo programa de mano ———

export function PlaybillRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-[3px] ${className}`} aria-hidden="true">
      <span className="h-[3px] bg-tinta" />
      <span className="h-px bg-tinta" />
    </div>
  )
}
