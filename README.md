# PlanLab

PlanLab es una plataforma pedagógica para docentes que integra planificación de clase, gestión de grupos, actividades, resultados, reportes y apoyo con IA en un solo flujo de trabajo.

## Qué resuelve

PlanLab organiza el proceso docente de punta a punta:

- Crear y mejorar planes de clase.
- Programar actividades por grupo.
- Registrar asistencia, notas y observaciones por estudiante.
- Detectar alertas pedagógicas tempranas.
- Generar reportes y exportaciones académicas.
- Apoyar decisiones con propuestas estructuradas de IA.

## Flujo principal del producto

```text
Grupos -> Estudiantes -> Planes -> Actividades -> Resultados -> Reportes
```

## Funcionalidades actuales

### Base académica

- Autenticación real con Supabase.
- Protección de rutas privadas.
- Perfil docente real.
- CRUD de grupos y estudiantes.
- Importación masiva de estudiantes.
- CRUD de planes de clase.
- CRUD de actividades.
- Registro por estudiante en actividades.
- Resultados reales con métricas básicas.
- Dashboard real del docente.
- Reportes base conectados a datos reales.

### Capa inteligente

- Generación de planes con IA.
- Mejora de planes existentes con IA.
- Estrategias de refuerzo desde resultados.
- Validación estricta con Zod para respuestas IA.

### Exportación

- Exportación PDF en backend.
- Exportación Word editable para planes.
- Nombres de archivo legibles y consistentes.

### Experiencia de producto

- Interfaz premium en modo oscuro.
- Modo claro adaptado.
- Buscador global.
- Centro de notificaciones.
- Skeletons, toasts y estados vacíos consistentes.

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js App Router + React + TypeScript |
| UI | Tailwind CSS + componentes modulares propios |
| Datos | Supabase Database + Auth + Storage |
| Validación | Zod + React Hook Form |
| IA | Gemini mediante `@google/genai` |
| Documentos | `@react-pdf/renderer` + `docx` |

## Arquitectura del proyecto

```text
src/
  app/
    (public)/
    (dashboard)/
    api/
  components/
    layout/
    pdf/
    shared/
    ui/
  features/
    activities/
    auth/
    dashboard/
    groups/
    plans/
    profile/
    reports/
    results/
  lib/
    gemini/
    notifications/
    pdf/
    plans/
    supabase/
    validations/
    word/
  styles/
```

## Variables de entorno

Crea un archivo `.env.local` con estas variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
SUPABASE_DOCUMENTS_BUCKET=documents
```

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

## Scripts útiles

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Requisitos de Supabase

PlanLab espera estas capacidades activas:

- Auth por correo electrónico.
- RLS habilitado en tablas por `auth.uid()`.
- Bucket para documentos exportados.
- Esquema base del proyecto ya creado.

### Tabla de notificaciones

Si vas a usar notificaciones persistentes, ejecuta el SQL incluido en:

- [supabase/notifications.sql](supabase/notifications.sql)

Ese archivo crea:

- tabla `public.notifications`
- índices útiles
- políticas RLS por usuario autenticado

Si la tabla aún no existe, la app usa un fallback seguro basado en el estado actual del sistema para no romper la interfaz.

## Exportaciones

### PDF

- Generación en backend.
- Documentos blancos, legibles e imprimibles.
- Uso de datos reales desde Supabase.

### Word

- Exportación editable para planes de clase.
- Reutiliza la misma estructura normalizada que la vista previa y el PDF.

## IA en PlanLab

La integración con Gemini está diseñada para producto, no como chatbot:

- Toda llamada ocurre del lado servidor.
- La clave no se expone en frontend.
- La salida estructurada se valida con Zod.
- El docente revisa y aplica la propuesta antes de guardarla.

## Estado actual

PlanLab está orientado a uso real docente, con foco en:

- estabilidad funcional
- consistencia visual
- claridad pedagógica
- evolución incremental sin rehacer la arquitectura

## Validación recomendada antes de publicar

```bash
npm run typecheck
npm run lint
npm run build
```

## Autoría

Desarrollado por Daniel Fernandez para la evolución de PlanLab como producto edtech profesional.
