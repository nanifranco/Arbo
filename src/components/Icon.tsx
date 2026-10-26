const paths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm9 16-4.2-4.2',
  diary: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zm0 15A1.5 1.5 0 0 0 6.5 21H19v-3M9 7h6M9 10.5h4',
  community: 'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c.6-3.4 3.2-5.5 6.5-5.5S14.4 16.6 15 20M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 14.7c2.4.6 4 2.5 4.5 5.3',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  heart: 'M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.8 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.2 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20z',
  bookmark: 'M6 3.5h12V21l-6-4.2L6 21z',
  pin: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4.5l3 2',
  calendar: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8.5 3v4M15.5 3v4',
  ticket: 'M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V14a2 2 0 0 0 0-4zM15 6v12',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6 6 18',
  filter: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  map: 'M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20',
  edit: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v5.5M12 7.5v.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  logout: 'M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15M10 16l-4-4 4-4M6 12h10',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h0M4 12h0M4 18h0',
  repeat: 'M17 2.5 20.5 6 17 9.5M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5',
  chat: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z',
  access: 'M12 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 8.5l7 1.5 7-1.5M12 10v5l-3 6M12 15l3 6',
  seat: 'M6 4h12v8H6zM4 12h16v3H4zM6 15v6M18 15v6',
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, filled = false, className = '', strokeWidth = 1.8 }: { name: IconName; size?: number; filled?: boolean; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

/** Estrella dibujada a mano: el símbolo de calificación de ÁRBO */
export function HandStar({ size = 18, fill = 'currentColor', className = '' }: { size?: number; fill?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12.3 1.8c.5 2.6 1.4 5.6 2.6 7.4 2 .4 4.6.4 7.2.3-2 1.6-4.3 3-5.9 4 .5 2.5 1.6 5.2 2.4 8.1-2.2-1.6-4.4-3.4-6.5-4.6-2.2 1.3-4.6 3.1-6.8 4.4.8-2.7 1.8-5.4 2.5-7.9C6 12.4 3.8 11 1.8 9.4c2.6.1 5.3.1 7.4-.3 1.2-1.9 2.2-4.7 3.1-7.3z"
        fill={fill}
        stroke="rgba(0,0,0,.18)"
        strokeWidth=".6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Asterisco de marca (el "*" de ÁRBO) */
export function BrandAsterisk({ size = 22, color = '#E9B321', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g stroke={color} strokeWidth="2.6" strokeLinecap="round">
        <path d="M12 2.5c.2 6.5-.2 12.5.3 19" />
        <path d="M3.5 7.5c5.6 3 11.2 6.2 17 9" />
        <path d="M20.5 7c-5.5 3.3-11.4 6.4-17 9.6" />
      </g>
    </svg>
  )
}
