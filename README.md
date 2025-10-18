# Eybitech Next.js

Migración progresiva desde React+Vite a Next.js (App Router).

## Requisitos
- Node 18+
- Variables en `.env.local`:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_APP_URL (opcional)
  - GEMINI_API_KEY (server-only)

## Instalación
1. Instala dependencias
2. Ejecuta el servidor de desarrollo

## Scripts
- `npm run dev` – desarrollo
- `npm run build` – build
- `npm start` – producción

## Notas
- Tailwind y utilidades portadas en `app/globals.css`.
- Supabase cliente en `lib/supabase/browserClient.js`.
- Home en `app/page.jsx` (ISR: revalidate=60).
- Agrega más páginas en `app/*`.
