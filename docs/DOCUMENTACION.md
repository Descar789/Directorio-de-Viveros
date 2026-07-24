# Documentación técnica — BuscaViveros

Directorio en línea de viveros de México. Este documento describe la logística de la página por partes: qué hace cada pieza, cómo se conectan y cómo fluye la información. Es la referencia técnica del proyecto; la guía operativa del día a día (moderar, cobrar destacados, campañas) vive en [`docs/operacion.md`](operacion.md).

**Última actualización:** 2026-07-22

---

## 1. Visión general

BuscaViveros conecta a compradores de plantas (público general y mayoristas) con viveros reales, empezando por el corredor Morelos – Estado de México – CDMX – Puebla.

**Modelo del sitio en una frase:** los visitantes buscan viveros por zona o cercanía sin necesidad de cuenta; los dueños de viveros se registran para reclamar o crear su ficha; un administrador modera todo y vende posiciones destacadas ($99/mes por municipio); los ingresos se complementan con AdSense.

### Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + servidor | Next.js 16 (App Router, Server Components, Server Actions) |
| UI | React 19, Tailwind CSS 4, lucide-react (iconos), Leaflet + react-leaflet (mapas) |
| Base de datos | Supabase (PostgreSQL + PostGIS) |
| Autenticación | Supabase Auth (Google OAuth + magic link por correo) |
| Almacenamiento de fotos | Supabase Storage (bucket `fotos-viveros`) |
| Hosting | Vercel (deploy automático al hacer push a `main`) |
| Gestor de paquetes | pnpm (npm prohibido en este repo) |
| Tests | Vitest (unitarios), Playwright (E2E), Lighthouse (performance) |

### Diseño

Paleta terracota/ciruela, tipografías Newsreader + Work Sans, estilo editorial. North Star: **"El Vivero de Confianza"**. Detalles en `DESIGN.md` y contexto de producto en `PRODUCT.md` (raíz del repo).

---

## 2. Estructura del repositorio

```
app/                  Rutas (App Router de Next.js)
├── page.tsx              Home: buscador, estados piloto, destacados
├── buscar/               Resultados de búsqueda (texto, insignia, cerca de mí)
├── viveros/[estado]/     Página de estado (SEO por zona)
│   └── [municipio]/      Página de municipio (SEO por zona)
├── vivero/[slug]/        Ficha pública de un vivero
├── entrar/               Login (Google OAuth o magic link)
├── auth/callback/        Retorno de OAuth (intercambio de código por sesión)
├── registro/             Wizard de alta de vivero (6 pasos, requiere sesión)
├── mi-vivero/            Panel del dueño (métricas, botón destacar)
│   └── editar/           Edición de la ficha propia (+ actions.ts)
├── admin/                Panel del administrador (layout exige rol admin)
│   ├── solicitudes/          Moderación de altas y reclamos
│   ├── viveros/              Tabla de todos los viveros (borrar, ver)
│   ├── destacados/           Activar/quitar destacados, avisos de renovación
│   ├── importar/             Carga masiva por CSV
│   └── actions.ts            Server Actions del admin (ver §6)
├── api/metrica/          POST público para contadores (vistas, clics)
├── privacidad/           Aviso de privacidad
├── sitemap.ts            Sitemap dinámico (fichas + páginas de zona)
├── layout.tsx            Layout raíz: fuentes, Header, Footer, Analytics, AvisoCookies
└── globals.css           Tokens de diseño y estilos globales (Tailwind 4)

components/           Componentes React reutilizables
├── Buscador.tsx          Caja de búsqueda + botón "cerca de mí" (geolocalización)
├── ViveroCard.tsx        Tarjeta de resultado (nombre, zona, insignias, destacado)
├── MapaViveros(Lazy)     Mapa Leaflet con pins de resultados (carga diferida)
├── GaleriaFotos.tsx      Galería de la ficha
├── BotonContacto.tsx     Botones WhatsApp / cómo llegar (disparan métricas)
├── InsigniaBadge.tsx     Chip de especialidad
├── AdSlot.tsx            Hueco de AdSense (solo carga con consentimiento)
├── Analytics.tsx         GA4 + Meta Pixel (solo con consentimiento)
├── AvisoCookies.tsx      Banner de cookies → lib/consentimiento.ts
├── registro/             Wizard y sus 6 pasos + mapa de pin
├── panel/                FormFicha (edición dueño) y Metricas
└── admin/                TablaViveros, TarjetaSolicitud, PanelDestacados, ImportadorCsv

lib/                  Lógica compartida (con tests unitarios .test.ts)
├── tipos.ts              Interfaces TS (Vivero, Solicitud, Perfil…) + esDestacado()
├── busqueda.ts           Consultas de búsqueda y ordenamiento (ver §4)
├── registro.ts           Validación del wizard, borrador local, compresión de fotos
├── csv.ts                Parser/validador del CSV de importación
├── zonas.ts              Catálogo de 32 estados, estados piloto, slugify()
├── analytics.ts          track() → GA4 + Pixel (no-op si no cargaron)
├── consentimiento.ts     Lectura/escritura del consentimiento de cookies
└── supabase/             Tres clientes (ver §3)

supabase/
├── migrations/           0001 esquema, 0002 RLS, 0003 fix métricas, 0004 storage
└── seed.sql              Catálogo inicial de insignias

proxy.ts              Middleware: refresca sesión y protege /mi-vivero, /admin, /registro
data/precarga-piloto.csv  Formato de referencia para importación
e2e/                  Tests Playwright (búsqueda, registro, admin)
scripts/lighthouse.mjs    Auditoría de performance
docs/                 Este documento, runbook de operación, specs y planes
```

---

## 3. Conexión con Supabase: los tres clientes

Toda la data vive en Supabase. Hay tres formas de conectarse, según el contexto:

| Cliente | Archivo | Uso | Credencial |
|---------|---------|-----|------------|
| Público | `lib/supabase/publico.ts` | Lecturas anónimas (búsqueda, fichas, zonas) | anon key |
| Browser | `lib/supabase/client.ts` | Acciones del usuario logueado en el navegador (login, subir fotos, crear solicitud) | anon key + sesión |
| Server | `lib/supabase/server.ts` | Server Actions y Server Components con sesión (cookies) | anon key + cookies de sesión |

**Regla clave:** la seguridad NO depende del cliente sino de las políticas RLS en la base (ver §7). Aunque alguien manipule el navegador, la base rechaza lo que su rol no permite.

`proxy.ts` (middleware de Next) corre en cada request a `/mi-vivero`, `/admin` y `/registro`: refresca la cookie de sesión y redirige a `/entrar?next=…` si no hay usuario.

---

## 4. Flujo del visitante (sin cuenta)

### Búsqueda

Tres caminos, todos en `lib/busqueda.ts`:

1. **Por texto** (`buscarViveros`): busca `ilike` sobre nombre, municipio y estado. Filtro opcional por insignia (especialidad). Página `/buscar?q=…&insignia=…`.
2. **Por zona** (`viverosPorZona`): páginas SEO `/viveros/[estado]` y `/viveros/[estado]/[municipio]`. Consulta directa por columnas `estado`/`municipio`.
3. **Cerca de mí** (`viverosCerca`): usa geolocalización del navegador y llama al RPC `buscar_cerca` (PostGIS, radio default 25 km).

Solo se muestran viveros `verificado` o `pre-cargado`. **Orden canónico de resultados** (mismo criterio en SQL `rango_vivero` y en TS `rangoVivero`):

1. Destacado vigente en su municipio (`destacado_hasta >= hoy` y `destacado_municipio == municipio`)
2. Verificado
3. Pre-cargado

### Ficha del vivero (`/vivero/[slug]`)

Muestra galería, descripción, horarios, insignias, mapa y botones de contacto. Los viveros `pre-cargados` muestran franja "¿Este vivero es tuyo?" que lleva al flujo de reclamo.

### Métricas de ficha

Cada vista de ficha y cada clic en WhatsApp / "cómo llegar" hace `POST /api/metrica` con `{viveroId, metrica}`. La ruta valida la métrica contra una lista blanca y llama al RPC `incrementar_metrica` (SECURITY DEFINER) — así el anónimo incrementa contadores sin tener permiso de UPDATE sobre la tabla. El dueño ve estos números en su panel.

### Analytics y cookies

- `AvisoCookies` pide consentimiento; se guarda vía `lib/consentimiento.ts`.
- Con consentimiento: `Analytics.tsx` carga GA4 (`NEXT_PUBLIC_GA_ID`) y Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`); `AdSlot` carga AdSense (`NEXT_PUBLIC_ADSENSE_CLIENT`).
- Eventos custom (`lib/analytics.ts`): `busqueda`, `clic_whatsapp`, `registro_iniciado`, `registro_completado`. `track()` es no-op silencioso si no hay scripts cargados.

---

## 5. Flujo del dueño de vivero

### Autenticación (`/entrar`)

Dos opciones vía Supabase Auth: **Google OAuth** (redirige a `/auth/callback`, que intercambia el código por sesión) o **magic link** por correo. Al primer login se crea su fila en `perfiles` con rol `dueno`.

### Registro de vivero nuevo (`/registro`)

Wizard de 6 pasos (`components/registro/Wizard.tsx` + `components/registro/pasos/`):

1. **Nombre** — obligatorio.
2. **Ubicación** — estado, municipio y pin en mapa (Leaflet).
3. **Contacto** — al menos WhatsApp o teléfono; `normalizarTelefono()` quita no-dígitos y antepone lada 52 a números de 10 dígitos.
4. **Especialidades** — al menos una (se vuelven insignias al aprobar).
5. **Fotos** — al menos una; `comprimirImagen()` redimensiona a máx 1600px y comprime a JPEG 0.8 en el navegador antes de subir al bucket `fotos-viveros`.
6. **Revisión** — resumen y envío.

La validación por paso vive en `lib/registro.ts` (`validarPaso`). El avance se guarda como **borrador en localStorage** (`bv-registro-borrador`): si el dueño cierra el navegador, retoma donde iba.

Al enviar **no se crea el vivero**: se crea una fila en `solicitudes` con `tipo='nuevo'` y el payload completo del wizard en `datos` (jsonb). Queda en espera de moderación (promesa: <24 h).

### Reclamo de ficha pre-cargada

Desde la franja "¿Este vivero es tuyo?" el dueño (logueado) crea una `solicitud` con `tipo='reclamo'`, `vivero_id` apuntando a la ficha, y evidencia (foto del local o texto).

### Panel del dueño (`/mi-vivero`)

- **Métricas**: vistas, clics de WhatsApp, clics de "cómo llegar" de su ficha.
- **Editar** (`/mi-vivero/editar`): la Server Action `actualizarVivero` localiza el vivero por `owner_id = user.id` y solo actualiza campos editables (nombre, descripción, contacto, dirección, coordenadas, horarios, fotos). Estatus, destacado y contadores están protegidos a nivel de base (ver §7) — aunque el código intentara cambiarlos, el trigger los revierte.
- **Destacar mi vivero**: botón que abre WhatsApp al admin (`NEXT_PUBLIC_ADMIN_WHATSAPP`). El cobro y la activación son manuales (ver §6).

---

## 6. Flujo del administrador (`/admin`)

El layout de `/admin` verifica rol `admin` en `perfiles`; además **cada Server Action re-verifica** con `exigirAdmin()` (`app/admin/actions.ts`) — la UI nunca es la única barrera.

### Moderación (`/admin/solicitudes`)

- **Aprobar solicitud `nuevo`** (`aprobarSolicitud`): genera slug único (`nombre-municipio`, con sufijo `-2`, `-3`… si colisiona), inserta el vivero como `verificado` con `owner_id = solicitante`, y vincula las especialidades como insignias.
- **Aprobar `reclamo`**: asigna `owner_id` al solicitante y sube la ficha a `verificado`.
- **Rechazar** (`rechazarSolicitud`): exige nota con el motivo (visible para el solicitante).

### Destacados (`/admin/destacados`)

- `activarDestacado(viveroId, hasta)`: fija `destacado_hasta` y `destacado_municipio`. **Límite duro: 3 destacados vigentes por municipio** — la acción cuenta los vigentes y bloquea el cuarto.
- `quitarDestacado`: limpia ambos campos.
- La expiración es automática: pasada la fecha, `esDestacado()` / `rango_vivero()` dejan de considerarlo destacado. No hay tarea programada; la fecha lo apaga sola.
- Los que vencen en ≤3 días se pintan en ámbar para cobrar renovación.

### Importación masiva (`/admin/importar`)

CSV con cabecera exacta `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion` (formato en `data/precarga-piloto.csv`). `lib/csv.ts` valida fila por fila; `importarViveros` inserta cada fila como `pre-cargado` y reporta errores con número de línea. Los pre-cargados aparecen en el directorio invitando al reclamo.

### Tabla general (`/admin/viveros`)

Listado completo con acción de borrado (`borrarVivero`, solo admin por RLS).

---

## 7. Base de datos (Supabase)

Migraciones en `supabase/migrations/`, se corren **en orden** en el SQL Editor. `seed.sql` carga el catálogo de insignias.

### Tablas

| Tabla | Contenido |
|-------|-----------|
| `perfiles` | 1:1 con `auth.users`. Rol `dueno` (default) o `admin`, nombre, whatsapp. |
| `viveros` | La ficha completa: identidad, contacto, zona, `lat`/`lng` + columna generada `geo` (PostGIS geography, índice GiST), `horarios` (jsonb), `fotos` (text[]), `estatus`, `owner_id`, campos de destacado, contadores de métricas. Índices por zona y estatus. `updated_at` automático por trigger. |
| `insignias` | Catálogo de especialidades (clave, nombre, icono lucide). |
| `vivero_insignias` | N:M vivero ↔ insignia. |
| `solicitudes` | Cola de moderación: `tipo` (`nuevo`/`reclamo`), `datos` (payload del wizard), evidencia, `estatus`, `nota_admin`. |

### Ciclo de vida de un vivero (`estatus`)

```
pre-cargado ──(reclamo aprobado)──► verificado
pendiente ────(alta aprobada)─────► verificado
     └────────(rechazada)─────────► rechazado (no visible)
```

Público solo ve `verificado` y `pre-cargado`.

### Funciones (RPC)

- `buscar_cerca(lat, lng, radio_km, limite)` — búsqueda geoespacial con `st_dwithin`, ordenada por rango y distancia.
- `rango_vivero(v)` — orden canónico 0/1/2 (destacado/verificado/pre-cargado).
- `incrementar_metrica(vivero_id, metrica)` — SECURITY DEFINER; permite al anónimo subir contadores sin abrir UPDATE. Marca la sesión con `bv.permitir_metrica` para que el trigger protector no revierta el incremento (fix de la migración 0003).
- `es_admin()` — usada por todas las políticas RLS de admin.

### Seguridad (RLS + trigger)

RLS activo en todas las tablas (migración 0002):

- **viveros**: lectura pública solo de publicados; el dueño ve/edita la suya; solo admin inserta y borra.
- **solicitudes**: el solicitante ve las suyas; solo admin las resuelve.
- **Trigger `proteger_columnas_vivero`**: aunque el dueño tenga UPDATE sobre su fila, el trigger revierte cambios a `estatus`, `destacado_*`, `owner_id` y contadores si no es admin. Defensa en profundidad: ni un bug del frontend permite auto-verificarse o auto-destacarse.

### Storage

Bucket `fotos-viveros` (migración 0004): lectura pública, subida solo autenticados, borrado solo el que subió o admin. Las fotos llegan ya comprimidas del navegador (§5).

---

## 8. SEO

- Páginas estáticas por zona: `/viveros/[estado]` y `/viveros/[estado]/[municipio]` — captura búsquedas tipo "viveros en Cuernavaca".
- `app/sitemap.ts` genera sitemap dinámico con fichas y zonas.
- Slugs legibles: `nombre-del-vivero-municipio`.
- 32 estados en el catálogo (`lib/zonas.ts`); el footer y la home destacan los 4 estados piloto.

---

## 9. Monetización

1. **Destacados** ($99/mes por municipio, máx 3 por municipio): venta y cobro por WhatsApp/transferencia fuera del sitio; el admin activa manualmente con fecha de vencimiento. El destacado compra el primer bloque del orden de resultados en su municipio.
2. **AdSense** (post-lanzamiento): slots ya colocados (resultados, lateral de ficha, pie de zonas). Se activan al poner `NEXT_PUBLIC_ADSENSE_CLIENT`; solo cargan con consentimiento de cookies.

---

## 10. Desarrollo, tests y deploy

### Comandos (siempre pnpm)

```bash
pnpm dev          # servidor local (localhost:3000)
pnpm build        # build de producción
pnpm lint         # eslint
pnpm test         # unitarios (vitest): lib/busqueda, lib/csv, lib/registro
pnpm exec playwright test   # E2E: búsqueda, registro, admin (e2e/)
node scripts/lighthouse.mjs # auditoría de performance
```

Los E2E usan `e2e/setup.ts` y `e2e/login.ts` para preparar usuarios/sesión.

### Variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión a Supabase (obligatorias) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server (obligatoria) |
| `NEXT_PUBLIC_SITE_URL` | URL canónica (sitemap, OAuth) |
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | Recibe ventas de destacados (`52XXXXXXXXXX`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Opcional: activa AdSense |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | Opcional: medición |

### Deploy

Push a `main` → deploy automático en Vercel. Proyecto Supabase: `mowlsrmsensfrpbakghy`. Backups diarios (7 días) incluidos en plan free.

### Pendientes de puesta en producción (al 2026-07-22)

- [ ] Correr migraciones 0003 (fix métricas) y 0004 (storage) en Supabase producción.
- [ ] Configurar Google OAuth (Cloud Console + Supabase Auth → redirects del dominio).
- [ ] Conectar proyecto a Vercel con las envs de la tabla anterior.
- [ ] Dominio de producción (ej. `buscaviveros.mx`).

---

## 11. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| `docs/operacion.md` | Runbook del admin: moderar, cobrar destacados, importar, AdSense, campañas |
| `PRODUCT.md` | Usuarios, propósito, posicionamiento, principios de producto |
| `DESIGN.md` | Sistema de diseño: paleta, tipografía, reglas de componentes |
| `docs/superpowers/specs/2026-07-12-buscaviveros-design.md` | Spec original del proyecto |
| `docs/superpowers/plans/2026-07-12-buscaviveros.md` | Plan de implementación ejecutado |
| `AGENTS.md` / `CLAUDE.md` | Instrucciones para agentes de código |
