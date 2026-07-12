# BuscaViveros — Avance de brainstorming (2026-07-11)

Sesión de diseño con skill `superpowers-extended-cc:brainstorming`. Pausada a mitad de la presentación del diseño.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Nombre | **BuscaViveros** (dominio buscaviveros.mx — falta verificar disponibilidad en registrador) |
| Datos iniciales | Pre-cargar 100-300 fichas con datos públicos + gancho "reclama tu ficha" |
| Zona piloto | Morelos + CDMX + Edomex (Cuautla como base, contactos vía Ornaplant) |
| Stack | Next.js (App Router, monolito) + Supabase (Postgres/Auth/Storage/PostGIS) + Vercel |
| Alcance v1 | Directorio + registro/reclamo + panel dueño + panel admin. **Sin pagos online**: destacado se vende por WhatsApp/transferencia y se activa a mano |
| Verificación | Manual: solicitudes entran como "pendiente", admin aprueba con evidencia |
| "Leyenda" | = Insignias visibles: Verificado, Mayoreo, Menudeo, Ornamental, Frutales, Suculentas, Forestal, Envíos, Insumos |
| Precio destacado | $99-149 MXN/mes por municipio, badge "Destacado" visible (transparencia) |
| Publicidad | Banners de proveedores de insumos (fertilizantes, macetas, herramientas), manual en v1. NO AdSense genérico |
| Presupuesto ads | $1,500-3,000 MXN/mes para Facebook/Google Ads, geo-segmentado a zona piloto |

## Sección 1 del diseño — Modelo de datos (PRESENTADA, PENDIENTE DE APROBACIÓN)

Tablas Supabase:
- **`viveros`**: id, slug, nombre, descripcion, telefono, whatsapp, email, sitio_web, estado, municipio, direccion, lat/lng (PostGIS), horarios (JSON), fotos[] (Storage), estatus (`pre-cargado | pendiente | verificado | rechazado`), owner_id (null si sin reclamar), destacado_hasta + destacado_municipio
- **`insignias`**: catálogo fijo + tabla puente `vivero_insignias`
- **`solicitudes`**: registro/reclamo pendiente con evidencia; admin aprueba
- **`anuncios`**: banners proveedores — imagen, link, zonas, vigencia
- **`usuarios`**: Supabase Auth (email + Google), roles `dueño` / `admin`

Búsqueda: estado/municipio (SEO) + "cerca de mí" (geolocalización navegador + radio PostGIS) + filtro por insignia.
Orden: destacados del municipio → verificados → pre-cargados.

**Pregunta abierta al usuario:** ¿aprueba sección 1? ¿Reseñas de clientes van en v2 (propuesta) o v1?

## Secciones de diseño PENDIENTES de presentar

2. **Páginas públicas + SEO** — home, /viveros/[estado]/[municipio] (ISR), ficha /vivero/[slug], buscador con mapa. VISUAL → usar companion en navegador para mockups. Usuario invocó `/ui-ux-pro-max:ui-ux-pro-max` — invocar ese skill al diseñar UI.
3. **Registro/reclamo de ficha** — wizard amigable (prioridad del usuario: interfaz que enganche). VISUAL → mockups.
4. **Panel dueño + panel admin** — editar ficha, subir fotos, solicitudes de verificación, activar destacados/anuncios.
5. **Monetización** — flujo destacado manual (WhatsApp → activación admin), banners proveedores.
6. **Plan de marketing** — Facebook Ads (reclutamiento viveros en grupos/lookalike zona piloto) + Google Ads (intención "viveros cerca de mí") + orgánico (grupos FB viveristas). Presupuesto $1,500-3,000 MXN/mes. Usuario pidió explícitamente este plan dentro del brainstorm.
7. **Manejo de errores + testing**.

## Checklist restante del skill brainstorming

- [ ] Terminar de presentar secciones 1-7 (aprobación sección por sección)
- [ ] Escribir spec en `docs/superpowers/specs/2026-07-11-directorio-viveros-design.md` (ajustar fecha al día real) + commit
- [ ] Self-review del spec (placeholders, contradicciones, ambigüedad, alcance)
- [ ] Usuario revisa spec
- [ ] Invocar skill `writing-plans` → plan de implementación (NO otro skill)

## Notas de sesión

- Companion visual: servidor en `.superpowers/brainstorm/` (gitignored), puerto de la sesión pasada ya muerto — **reiniciar con `start-server.sh --project-dir` al retomar** si hay preguntas visuales.
- Skills activos que el usuario pidió: brainstorming (en curso), ui-ux-pro-max (para fase de UI), caveman (modo de respuesta).
- Repo casi vacío: solo .gitignore/.gitattributes. Todo el código está por crearse.
