# BuscaViveros — Diseño validado

Fecha: 2026-07-12 · Estado: aprobado por el usuario (aprobación explícita de secciones 1-5; secciones 6-7 y ajustes bajo aprobación general declarada)

## 1. Qué es

Directorio nacional de viveros en México. Los negocios se registran gratis y administran su propia ficha; monetización por destacado pagado por municipio (cobro manual en v1) y Google AdSense. Diferenciador frente a vdeviveros.com / viveroscerca.com.mx: ellos son directorios curados por terceros; aquí el negocio es dueño de su ficha.

- **Nombre:** BuscaViveros. Dominio objetivo `buscaviveros.mx` (verificar disponibilidad en registrador antes de comprar).
- **Zona piloto:** Morelos + CDMX + Edomex. Arquitectura nacional desde día 1.
- **Arranque de contenido:** pre-carga de 100-300 fichas con datos públicos + flujo "reclama tu ficha".

## 2. Stack y arquitectura

- **Next.js** (App Router) monolito en **Vercel**: páginas públicas SSR/ISR, paneles como rutas protegidas.
- **Supabase**: Postgres + PostGIS, Auth (email + Google), Storage (fotos), RLS.
- **Mapas:** Leaflet + OpenStreetMap (gratis; Google Maps cobra tras 10k cargas/mes).
- Sin backend separado: Supabase es la API. Sin pagos online en v1.

## 3. Modelo de datos (Supabase / Postgres)

### Tablas

**`viveros`**
- `id`, `slug` (URL `/vivero/vivero-la-esperanza-cuautla`)
- `nombre`, `descripcion`, `telefono`, `whatsapp`, `email`, `sitio_web`
- `estado`, `municipio`, `direccion`, `lat`, `lng` (índice PostGIS)
- `horarios` (JSON), `fotos[]` (Supabase Storage)
- `estatus`: `pre-cargado | pendiente | verificado | rechazado`
- `owner_id` → auth.users (null si pre-cargado sin reclamar)
- `destacado_hasta` (date, null = no destacado), `destacado_municipio`
- Contadores: `vistas`, `clics_whatsapp`, `clics_como_llegar`

**`insignias`** — catálogo fijo: Verificado, Mayoreo, Menudeo, Ornamental, Frutales, Suculentas, Forestal, Envíos, Insumos. Puente `vivero_insignias`.

**`solicitudes`** — registro nuevo o reclamo de ficha: solicitante, vivero (o datos de nuevo), evidencia (foto/texto), estatus. Admin aprueba/rechaza; aprobar reclamo asigna `owner_id`.

**Usuarios** — Supabase Auth. Roles: `dueño`, `admin` (tabla de perfiles con rol).

Nota: NO hay tabla de anuncios — la publicidad es Google AdSense (decisión del usuario), no venta directa a proveedores.

### Búsqueda y orden

- Por estado/municipio (páginas SEO) y "cerca de mí" (geolocalización navegador + radio PostGIS).
- Filtros por insignia.
- **Orden:** destacados del municipio (badge "Destacado" siempre visible) → verificados → pre-cargados.
- Reseñas de clientes: **v2**, fuera de este diseño.

### RLS

- Público lee viveros `verificado` y `pre-cargado`.
- Dueño edita solo su ficha (`owner_id`).
- Admin todo.

## 4. Páginas públicas y SEO

| Ruta | Contenido | SEO |
|------|-----------|-----|
| `/` | Hero "B": split buscador (qué + dónde + usar mi ubicación) y mapa Leaflet con pines. Debajo: categorías, destacados de tu zona, franja "¿Tienes un vivero? Regístralo gratis", footer con estados | "Directorio de viveros en México" |
| `/viveros/[estado]` | Lista + mapa estatal | ISR |
| `/viveros/[estado]/[municipio]` | Lista + mapa municipal, destacados arriba | ISR — página que gana Google ("Viveros en Cuautla") |
| `/vivero/[slug]` | Galería, insignias, mapa, horarios, **CTA principal WhatsApp**, teléfono, cómo llegar. Schema.org LocalBusiness/GardenStore | Rich results |
| `/registro` | Wizard (sección 5) | — |
| `/buscar` | Resultados libres + filtros | noindex |
| `/privacidad` | Política de privacidad + aviso cookies (requisito AdSense) | — |

**Identidad visual** (skill ui-ux-pro-max, patrón Marketplace/Directory, estilo Vibrant & Block-based):
- Colores: primario verde `#15803D`, secundario `#059669`, acento CTA ámbar `#D97706`, fondo `#F0FDF4`, texto `#0F172A`, bordes `#E2EFE7`, destructivo `#DC2626`.
- Tipografía: **Poppins** (títulos) + **Open Sans** (texto). (Se descartó Baloo/Comic Neue por infantil — el directorio necesita confianza de negocios.)
- Iconos SVG Lucide, nunca emoji. Contraste AA 4.5:1. Mobile-first (375/768/1024/1440). Touch targets ≥44px. Micro-interacciones 150-300ms, `prefers-reduced-motion` respetado. Modo claro y oscuro con tokens semánticos.

## 5. Registro / reclamo — wizard paso a paso (opción A validada)

- Estilo Typeform: una pregunta por pantalla, barra de progreso, botones grandes. 6 pasos: nombre → ubicación → contacto → especialidades (chips) → fotos → revisión.
- **Entrada doble:** "Registrar mi vivero" (nuevo) o "Mi vivero ya aparece — reclamarlo" (busca ficha pre-cargada, adjunta evidencia).
- Ubicación: pin arrastrable en mapa + "usar mi ubicación actual".
- **Solo 5 campos obligatorios:** nombre, municipio, teléfono/WhatsApp, 1 especialidad, 1 foto. Resto opcional desde su panel.
- Auto-guardado de borrador (sobrevive recarga/abandono).
- Al enviar → solicitud `pendiente` + "Te avisamos por WhatsApp en menos de 24h".

## 6. Paneles

**Dueño (`/mi-vivero`):** editar ficha completa y fotos, vista previa pública, métricas (vistas, clics WhatsApp, clics cómo llegar — argumento de venta del destacado), botón "Destacar mi vivero" → WhatsApp del admin con mensaje pre-armado.

**Admin (`/admin`):** cola de solicitudes con evidencia (aprobar/rechazar), CRUD de viveros + import CSV para pre-carga, activación de destacados (vivero + municipio + fecha fin), gestión de usuarios/roles.

## 7. Monetización

**Destacado — precio de lanzamiento $99 MXN/mes por municipio, ajustable hasta $149 según demanda (ingreso principal):**
1. Dueño pide por WhatsApp (botón en su panel) → paga por transferencia → admin activa con fecha fin.
2. Tope de resultados de su municipio con badge "Destacado" visible (transparencia).
3. Vence → baja automático. Recordatorio de renovación 3 días antes (cron/email al admin).
4. **Máximo 3 destacados por municipio** (validación en admin): escasez = valor.

**Google AdSense (ingreso secundario, decisión del usuario — anuncios generales de Google, no venta directa):**
- Alta en AdSense tras lanzamiento con contenido; Google revisa el sitio (~1-2 semanas). Google llena los espacios con sus anunciantes; reparto ~68% para el sitio; pago al acumular $100 USD.
- Slots: resultados (posición 4-5), lateral de ficha, pie de páginas estado/municipio. Espacio reservado (CLS < 0.1), script async.
- Prohibido en: hero, wizard, paneles.
- Requisitos: `/privacidad` + banner de consentimiento de cookies.
- Expectativa realista: ~$20-60 MXN por 1,000 visitas; relevante solo con tráfico grande.

**El plan gratuito nunca se degrada:** ficha completa, fotos, WhatsApp, mapa y búsqueda siempre gratis — sin red gratuita no hay a quién venderle destacado.

## 8. Plan de marketing (presupuesto $1,500-3,000 MXN/mes)

**Fase 0 — Orgánico $0 (semanas 1-4, en paralelo al desarrollo):**
- Pre-carga de fichas de la zona piloto.
- WhatsApp directo a viveros de Cuautla (contactos vía Ornaplant): "ya estás en el directorio, reclama tu ficha gratis".
- Grupos de Facebook de viveristas/jardinería: contenido útil, no spam.
- Meta: 30-50 fichas reclamadas antes de pagar anuncios.

**Fase 1 — Reclutar negocios (mes 1-2, ~$1,500 MXN Meta Ads):**
- Campaña de mensajes/tráfico: dueños de negocio + intereses jardinería/horticultura, geo piloto.
- Creativo: "Tu vivero en internet GRATIS. La gente te busca en Google — que te encuentre" → /registro.
- KPI: costo por registro < $30 MXN.

**Fase 2 — Traer compradores (mes 2+, ~$1,500 MXN divididos Google/Meta):**
- Google Ads Search: "viveros cerca de mí", "vivero en [municipio]" → páginas municipio.
- Meta Ads carrusel de destacados → directorio.
- SEO de páginas municipio trabaja gratis en paralelo.
- KPI: costo por visita < $2 MXN; conversión visita→clic WhatsApp > 8%.

**Medición día 1:** GA4 + Meta Pixel. Eventos: búsqueda, clic WhatsApp, registro iniciado, registro completado.

## 9. Errores y testing

- Estados vacíos con acción ("Aún no hay viveros en X — sé el primero").
- Mapa caído → la lista sigue funcionando; imagen rota → placeholder de hoja.
- Wizard: validación inline al salir del campo; mensajes con causa + corrección; foco al primer error.
- **Testing:** Playwright E2E (buscar→ficha→WhatsApp; registro completo; aprobación en admin), unit tests del orden de resultados, Lighthouse CI (SEO > 90 en páginas municipio).

## 10. Fuera de alcance v1

- Pagos online (Stripe/Conekta) — v2 cuando el cobro manual estorbe.
- Reseñas de clientes — v2.
- Venta directa de banners a proveedores — descartada por decisión del usuario (AdSense en su lugar).
- App móvil — el sitio es mobile-first.

## 11. Riesgos aceptados

- Cobro manual no escala más allá de ~50 destacados/mes — suficiente para validar.
- AdSense rinde poco al inicio — asumido; destacados son el ingreso principal.
- Pre-carga con datos públicos: fichas marcadas "pre-cargado" hasta reclamo; retiro a solicitud del negocio.
