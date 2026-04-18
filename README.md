# PlanLab

Plataforma edtech para docentes que centraliza planificación, gestión de actividades, seguimiento de resultados y generación de reportes pedagógicos.

## Visión del producto

PlanLab busca reducir la carga operativa del profesor y elevar la calidad de las decisiones pedagógicas con un flujo único:

1. Diseñar planes de clase con apoyo de IA.
2. Gestionar actividades por curso y estudiante.
3. Medir resultados y progreso en tiempo real.
4. Emitir reportes accionables para equipos directivos y familias.

## Arquitectura

- **Frontend:** Next.js App Router + TypeScript + Tailwind CSS.
- **UI/UX:** Arquitectura modular por dominios (`features`) y por capas de presentación (`components`).
- **Validación:** Zod + React Hook Form para formularios y parseo seguro de respuestas IA.
- **Integraciones preparadas:** Supabase (auth + data), Gemini (servicios IA), PDF API route.
- **Persistencia:** SQL inicial para Supabase con RLS por `auth.uid()`.

## Estructura de módulos

```bash
src/
  app/
    (public)/
    (dashboard)/
    api/
  components/
    ui/ layout/ shared/ landing/ auth/ dashboard/ plans/ activities/ results/ reports/
  features/
    auth/ plans/ activities/ results/ reports/ profile/
  lib/
    supabase/ gemini/ pdf/ utils/ validations/ constants/
  types/ data/ providers/ hooks/ styles/
```

## Roadmap por entregas

### Entrega 1

- Landing premium de marca PlanLab.
- Login y registro con validación.
- Shell base de dashboard responsive.
- Vistas iniciales de planes, actividades, resultados y reportes.
- Base técnica para Supabase, Gemini y endpoint PDF.

### Entrega 2 (actual)

- Autenticación real con Supabase Auth.
- Protección de rutas privadas con middleware.
- Perfil docente real y base de datos multitenant con RLS.
- Estructura lista para CRUD por docente (grupos, estudiantes, planes, actividades, reportes).

### Entrega 3

- Generación asistida de planes con Gemini.
- Evaluación automática y analítica por objetivos.
- Exportación PDF real con plantillas institucionales.

### Entrega 4

- Panel directivo multi-curso.
- Reportes comparativos por periodo.
- Alertas tempranas y recomendaciones pedagógicas.

## Puesta en marcha

```bash
npm install
npm run dev
```

Variables recomendadas en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

© Daniel Fernandez. Todos los derechos reservados.
