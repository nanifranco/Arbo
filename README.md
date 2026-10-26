# ÁRBO — Teatro para vivir la ciudad

Prototipo interactivo de ÁRBO, una plataforma dedicada al teatro de la Ciudad de México: cartelera, diario teatral, reseñas, perfiles de artistas y teatros, mapa y comunidad.

> **Datos de demostración.** Todas las producciones, compañías, personas, teatros, direcciones, funciones, precios y reseñas son ficticios (`src/data/demo.ts`). No existe integración de venta de boletos.

## Correr el proyecto

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/index.html autocontenido
```

Stack: React 18 + TypeScript + Tailwind CSS 4 + Vite.

## Publicación (GitHub Pages)

`.github/workflows/pages.yml` compila y publica el sitio en cada push a `main`. Requiere activar una sola vez **Settings → Pages → Source: GitHub Actions**.

## Reglas del PRD ya reflejadas

- **Umbral de calificación:** el promedio solo se publica con 10 calificaciones o más (`RATING_THRESHOLD` en `lib/catalog.ts`); por debajo se muestran las individuales.
- **Sugerir obra:** formulario con detección de títulos parecidos mientras se escribe; la solicitud queda “En revisión”.
- **Listas propias** además de Por ver y Favoritas.
- **Registro con ciudad o país** opcional, para obras vistas fuera de la CDMX.

## Estructura

```
src/
  data/types.ts      Modelo: Work (obra) → Production (puesta en escena) → Season (temporada)
  data/demo.ts       Catálogo ficticio de demostración
  lib/catalog.ts     Capa de acceso a datos (reemplazable por una API/BD)
  lib/store.tsx      Estado del usuario (diario, por ver, favoritas, seguidos) y navegación
  components/        Cartel generado, estrellas, botones, chips, boletos, iconos
  screens/           Bienvenida, Inicio, Buscar, Ficha, Diario, Registrar/Reseñar,
                     Perfil, Artista, Teatro, Mapa, Por ver, Comunidad
```

## Sistema visual

- **La pared y la ficha:** la marca vive en carteles, rótulos y titulares; la interfaz es clara como un programa de mano.
- **Color:** crema papel de fondo, rojo como identidad y acción principal, amarillo y rosa como acentos, verde para información secundaria.
- **Tipografía (incluida en el proyecto, sin Google Fonts):** Permanent Marker (marca), Anton (letra de cartel: titulares y cifras), Caveat Brush (notas a mano), DM Sans (interfaz), Courier Prime (boletos y programa de mano).
- **Fotografía:** cada obra tiene fotos de escena y un cartel fotográfico en duotono; los teatros y la ciudad tienen foto. Son fotos de referencia de Unsplash (licencia libre, enlazadas desde su CDN), no de las producciones ficticias. Si una foto no carga, se usa un cartel o fachada ilustrada.
- **Revisión:** el workflow manual “Revisar prototipo” verifica que las fotos respondan y guarda capturas en la rama `revision`.

## Siguiente paso: base de datos

Las pantallas solo leen datos a través de `lib/catalog.ts` y escriben a través de `lib/store.tsx`. Para conectar un backend, reemplaza esas funciones por consultas (p. ej. Supabase/Postgres) manteniendo los tipos de `data/types.ts`.
