import { useState, type ReactNode } from 'react'
import { currentSeason, getVenue, RATING_THRESHOLD, STATUS_LABEL, type RatingStats, type Status } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { Production } from '../data/types'
import { BrandAsterisk, HandStar, Icon, type IconName } from './Icon'
import { Poster } from './Poster'

// ——— Marca ———

export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const s = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-7xl md:text-8xl' }[size]
  const a = { sm: 14, md: 18, lg: 28, xl: 44 }[size]
  return (
    <span className={`inline-flex items-start font-marker text-rojo leading-none ${s} ${className}`} aria-label="ÁRBO">
      <span aria-hidden="true" className="-rotate-3 inline-block">ÁRBO</span>
      <BrandAsterisk size={a} className="-mt-1 ml-0.5" />
    </span>
  )
}

/** Sello que identifica datos ficticios */
export function DemoBadge({ className = '', label = 'Demo' }: { className?: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border-[1.5px] border-dashed border-verde/70 px-1.5 py-[1px] font-mono text-[10px] font-bold uppercase tracking-wider text-verde ${className}`}
      title="Información ficticia para el prototipo"
    >
      {label}
    </span>
  )
}

export function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    cartelera: 'bg-rojo text-papel',
    proximamente: 'bg-amarillo text-tinta',
    archivo: 'bg-carton text-grafito',
  }
  return <span className={`eyebrow inline-block rounded-full px-2 py-0.5 !text-[10px] ${styles[status]}`}>{STATUS_LABEL[status]}</span>
}

// ——— Calificación ———

export function Stars({ value, size = 14, showNumber = false }: { value: number; size?: number; showNumber?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <HandStar size={size} fill="var(--color-linea)" className="absolute inset-0" />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 1 ? size : size / 2 }}>
                <HandStar size={size} fill="var(--color-amarillo)" />
              </span>
            )}
          </span>
        )
      })}
      {showNumber && <span className="ml-1 font-mono text-xs font-bold tabular">{value.toFixed(1)}</span>}
    </span>
  )
}

/** Calificación de la comunidad respetando el umbral: sin promedio hasta tener suficientes calificaciones */
export function CommunityScore({ stats, size = 12, compact = false }: { stats: RatingStats; size?: number; compact?: boolean }) {
  if (stats.avg !== null)
    return (
      <span className="inline-flex items-center gap-1.5">
        <Stars value={stats.avg} size={size} />
        {!compact && <span className="text-xs text-gris tabular">{stats.count} calificaciones</span>}
      </span>
    )
  if (stats.count === 0) return <span className="text-xs text-gris">Sin calificaciones</span>
  return (
    <span className="text-xs text-gris tabular" title={`El promedio se publica a partir de ${RATING_THRESHOLD} calificaciones`}>
      {compact ? `${stats.count}/${RATING_THRESHOLD} calif.` : `${stats.count} de ${RATING_THRESHOLD} calificaciones para promedio`}
    </span>
  )
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value
  const size = 40
  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = shown >= i ? 1 : shown >= i - 0.5 ? 0.5 : 0
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <HandStar size={size} fill="var(--color-linea)" className="absolute inset-0" />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 1 ? size : size / 2 }}>
                  <HandStar size={size} fill="var(--color-amarillo)" />
                </span>
              )}
              {[i - 0.5, i].map((v, k) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={value === v}
                  aria-label={`${v} estrellas`}
                  className={`absolute top-0 h-full w-1/2 cursor-pointer ${k === 0 ? 'left-0' : 'right-0'}`}
                  onMouseEnter={() => setHover(v)}
                  onClick={() => onChange(value === v ? 0 : v)}
                />
              ))}
            </span>
          )
        })}
      </div>
      <span className="font-mono text-lg font-bold tabular w-10">{value ? value.toFixed(1) : '—'}</span>
    </div>
  )
}

// ——— Botones y chips ———

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'ink'
export function Button({
  children,
  onClick,
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  disabled,
  ariaPressed,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  icon?: IconName
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaPressed?: boolean
}) {
  const v: Record<BtnVariant, string> = {
    primary: 'bg-rojo text-papel hover:bg-rojo-hondo shadow-[0_2px_0_#6d0f0f]',
    secondary: 'bg-papel text-tinta border border-linea hover:border-grafito',
    ghost: 'text-tinta hover:bg-carton/60',
    ink: 'bg-tinta text-papel hover:bg-grafito',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${v[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={18} filled={ariaPressed && (icon === 'bookmark' || icon === 'heart')} />}
      {children}
    </button>
  )
}

export function Chip({ children, active, onClick, className = '' }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  const base = `inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${className}`
  if (!onClick) return <span className={`${base} border-linea bg-papel text-grafito`}>{children}</span>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={`${base} ${active ? 'border-tinta bg-tinta text-papel' : 'border-linea bg-papel text-tinta hover:border-grafito'}`}
    >
      {children}
    </button>
  )
}

export function GenreTag({ genre }: { genre: string }) {
  return <span className="inline-block rounded-sm bg-amarillo-claro px-1.5 py-0.5 text-[11px] font-semibold text-tinta">{genre}</span>
}

// ——— Estructura ———

export function SectionTitle({ children, action, onAction, id, note, eyebrow }: { children: ReactNode; action?: string; onAction?: () => void; id?: string; note?: string; eyebrow?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1 text-gris">{eyebrow}</div>}
        <h2 id={id} className="flex flex-wrap items-baseline gap-x-3 font-display text-[26px] uppercase leading-[0.95] tracking-[0.01em] text-tinta md:text-[30px]">
          <span>{children}</span>
          {note && <span className="rounded-sm bg-rojo px-1.5 py-0.5 font-sans text-[11px] font-bold uppercase leading-none tracking-widest text-papel">{note}</span>}
        </h2>
      </div>
      {action && (
        <button onClick={onAction} className="group inline-flex shrink-0 items-center gap-1 pb-0.5 text-[13px] font-bold text-rojo">
          <span className="group-hover:underline">{action}</span>
          <Icon name="arrow" size={15} />
        </button>
      )}
    </div>
  )
}

export function ScreenHeader({ title, right, sub }: { title?: string; right?: ReactNode; sub?: string }) {
  const nav = useNav()
  return (
    <div className="sticky top-[env(safe-area-inset-top,0px)] z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-linea/70 bg-crema/95 px-4 py-2 backdrop-blur md:mx-0 md:rounded-b-xl md:px-2">
      {nav.canGoBack && (
        <button onClick={nav.back} className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-carton/60" aria-label="Regresar">
          <Icon name="back" size={22} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {title && <div className="truncate text-[15px] font-bold">{title}</div>}
        {sub && <div className="truncate text-xs text-gris">{sub}</div>}
      </div>
      {right}
    </div>
  )
}

export function EmptyState({ title, text, action, onAction, icon = 'ticket' }: { title: string; text: string; action?: string; onAction?: () => void; icon?: IconName }) {
  return (
    <div className="wall relative flex flex-col items-center overflow-hidden rounded-xl px-6 py-10 text-center">
      <div className="relative mb-4">
        <div className="grid h-28 w-20 -rotate-3 place-items-center border-2 border-dashed border-grafito/40 bg-papel/50 text-grafito/60">
          <Icon name={icon} size={30} />
        </div>
        <span className="tape" style={{ width: 54 }} />
      </div>
      <h3 className="font-display text-2xl uppercase leading-none">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-grafito">{text}</p>
      {action && (
        <Button className="mt-5" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  const dark = color === '#E9B321' || color === '#E76F91' || color === '#F6E3A8'
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-marker"
      style={{ width: size, height: size, background: color, color: dark ? '#191919' : '#FBF8F2', fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ——— Tarjetas de producción ———

export function PosterCard({ production, width = 'w-[132px]', showVenue = true, badge }: { production: Production; width?: string; showVenue?: boolean; badge?: ReactNode; tilt?: boolean }) {
  const nav = useNav()
  const { season, status } = currentSeason(production)
  const venue = getVenue(season.venueId)
  const rot = 0
  const daysLeft = Math.ceil((new Date(season.end).getTime() - Date.now()) / 86400000)
  return (
    <button onClick={() => nav.go({ name: 'production', id: production.id })} className={`group shrink-0 text-left ${width}`}>
      <div className="poster-lift relative" style={{ rotate: `${rot}deg` }}>
        <div className="overflow-hidden rounded-[3px] shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_18px_-10px_rgba(25,25,25,.55)]">
          <Poster production={production} />
        </div>
        <div className="absolute left-1.5 top-1.5">{badge ?? (status !== 'cartelera' ? <StatusPill status={status} /> : daysLeft <= 21 && daysLeft >= 0 ? <span className="eyebrow inline-block -rotate-3 rounded-sm bg-amarillo px-1.5 py-0.5 !text-[9.5px] text-tinta shadow">Últimas funciones</span> : null)}</div>
      </div>
      <div className="mt-2.5 line-clamp-2 text-[13.5px] font-bold leading-snug">{production.title}</div>
      {showVenue && venue && <div className="mt-0.5 truncate text-xs text-gris">{venue.name}</div>}
    </button>
  )
}

export function ToastHost() {
  const { toast } = useStore()
  if (!toast) return null
  const tone = toast.tone === 'error' ? 'bg-rojo text-papel' : toast.tone === 'info' ? 'bg-amarillo text-tinta' : 'bg-tinta text-papel'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-50 flex justify-center px-4 md:bottom-8" role="status" aria-live="polite">
      <div key={toast.id} className={`pop-in pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg ${tone}`}>
        <Icon name={toast.tone === 'error' ? 'info' : 'check'} size={16} />
        {toast.text}
      </div>
    </div>
  )
}

/** Diálogo dentro de la página (el prototipo no usa alert/confirm del navegador) */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tinta/40 md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pop-in w-full max-w-md rounded-t-2xl bg-papel p-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-xl md:rounded-2xl md:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-marker text-xl">{title}</h3>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-carton" aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children, error, hint, htmlFor }: { label: string; children: ReactNode; error?: string; hint?: string; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rojo" role="alert">
          <Icon name="info" size={14} /> {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-gris">{hint}</p>
      )}
    </div>
  )
}

export const inputCls =
  'w-full rounded-lg border border-linea bg-papel px-3 py-2.5 text-[15px] text-tinta placeholder:text-gris/70 focus:border-tinta focus:outline-none aria-[invalid=true]:border-rojo'
