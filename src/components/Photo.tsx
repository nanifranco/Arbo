import { useState, type ReactNode } from 'react'

/**
 * Fotografías de referencia.
 *
 * Las imágenes vienen de Unsplash (licencia libre, enlazadas desde su CDN) y son SOLO de
 * referencia visual para el prototipo: no son fotos de las producciones ficticias.
 * Si una imagen no carga (sin conexión o en entornos que bloquean imágenes externas),
 * se muestra el respaldo (`fallback`).
 */

export function unsplash(id: string, w = 900, h?: number) {
  const size = h ? `&w=${w}&h=${h}&fit=crop` : `&w=${w}`
  return `https://images.unsplash.com/${id}?auto=format&q=70${size}&crop=entropy`
}

export function Photo({
  id,
  alt,
  className = '',
  imgClassName = '',
  w = 900,
  fallback,
  children,
  grade = 'natural',
}: {
  id?: string
  alt: string
  className?: string
  imgClassName?: string
  w?: number
  fallback?: ReactNode
  children?: ReactNode
  /** natural: color con leve contraste · mono: blanco y negro · warm: cálido teatral */
  grade?: 'natural' | 'mono' | 'warm'
}) {
  const [failed, setFailed] = useState(false)
  const filter = { natural: 'contrast(1.06) saturate(.92)', mono: 'grayscale(1) contrast(1.15)', warm: 'contrast(1.08) saturate(1.05) sepia(.18)' }[grade]
  return (
    <div className={`relative overflow-hidden bg-tinta ${className}`}>
      {id && !failed ? (
        <img src={unsplash(id, w)} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`} style={{ filter }} />
      ) : (
        fallback
      )}
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: 'var(--grain)', opacity: 0.55 }} aria-hidden="true" />
      {children}
    </div>
  )
}

/** Hook mínimo para saber si una foto cargó (para alternar entre foto y respaldo dibujado) */
export function usePhotoState() {
  const [failed, setFailed] = useState(false)
  return { failed, onError: () => setFailed(true) }
}
