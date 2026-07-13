# Runbook de operación — BuscaViveros

Guía del día a día para operar el directorio. Público: el administrador (no técnico).

## 1. Moderar solicitudes

1. Entra a `/admin/solicitudes` (necesitas rol `admin` en la tabla `perfiles`).
2. Cada tarjeta muestra el tipo:
   - **Vivero nuevo**: revisa nombre, zona, fotos y que el WhatsApp se vea real.
   - **Reclamo de ficha**: revisa la evidencia (foto del local o texto). En duda, manda WhatsApp al número de la ficha y pregunta.
3. **Aprobar**: la ficha se publica como `verificado` y el solicitante queda como dueño.
4. **Rechazar**: escribe el motivo (el solicitante lo puede ver). Sé específico: "la foto no corresponde al local", "datos incompletos".
5. Meta de servicio: resolver en <24 h — es la promesa que hace el wizard.

## 2. Vender y activar destacados ($99/mes por municipio)

1. El dueño manda WhatsApp desde el botón "Destacar mi vivero" de su panel.
2. Cobra por transferencia/efectivo (proceso manual, fuera del sitio).
3. En `/admin/destacados`: busca el vivero, elige fecha "hasta" (hoy + 30 días por pago mensual) y presiona **Destacar**.
4. Límite duro: **3 destacados vigentes por municipio**. El sistema bloquea el 4º — si hay lista de espera, apúntala aparte.

### Renovaciones

- En `/admin/destacados`, los que vencen en ≤3 días aparecen **en ámbar** con la nota "cobrar renovación".
- Revisa esa pantalla **cada lunes y jueves**. Manda WhatsApp de cobro con 3 días de anticipación.
- Si no paga: el destacado expira solo (no hay que hacer nada; la fecha lo apaga).

## 3. Pre-carga de viveros

1. Junta datos públicos (Google Maps para existencia y ubicación) y **verifica el contacto llamando** — no copies teléfonos de directorios de terceros sin confirmar.
2. Llena el CSV con el formato de `data/precarga-piloto.csv` (cabecera exacta):
   `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion`
3. Súbelo en `/admin/importar`. El sistema valida fila por fila y reporta errores con número de línea.
4. Los importados quedan `pre-cargados`: visibles en el directorio con franja "¿Este vivero es tuyo?".

## 4. Alta en AdSense (post-lanzamiento)

1. Espera a tener ~50+ fichas y tráfico orgánico inicial (2–4 semanas tras lanzar).
2. Crea cuenta en [adsense.google.com](https://adsense.google.com) con el dominio del sitio.
3. Al aprobar, agrega en Vercel la env `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXX` y redeploy.
4. Los slots ya están colocados (resultados de búsqueda, lateral de ficha, pie de páginas de zona). Solo cargan si el visitante aceptó cookies.

## 5. Campañas (spec §8)

- **Fase 0 (pre-lanzamiento):** pre-cargar 100–300 viveros del corredor piloto (Morelos, Edomex, CDMX, Puebla). Sin gasto en ads.
- **Fase 1 (lanzamiento):** Meta Ads geolocalizadas a dueños de viveros: objetivo = registros/reclamos. Presupuesto chico ($100–150 MXN/día), creativo = "Tu vivero gratis en el mapa".
- **Fase 2 (tracción):** Google Ads a compradores ("vivero cerca de mí", "plantas por mayoreo") apuntando a las páginas de municipio. Medir con los eventos GA4 `busqueda` y `clic_whatsapp`.

## 6. Infraestructura

- **Hosting:** Vercel (deploy automático al hacer push a `main`).
- **Datos:** Supabase — proyecto `mowlsrmsensfrpbakghy`. Migraciones en `supabase/migrations/` (correr en orden en SQL Editor).
- **Backups:** el plan free de Supabase incluye 7 días de backups diarios automáticos — verifica en Dashboard → Database → Backups que estén activos.
- **Envs requeridas en Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `NEXT_PUBLIC_SITE_URL` (ej. `https://buscaviveros.mx`)
  - `NEXT_PUBLIC_ADMIN_WHATSAPP` (número que recibe ventas de destacados, formato `52XXXXXXXXXX`)
  - Opcionales: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
- **Google OAuth:** en Google Cloud Console y Supabase → Auth → Providers, agregar el dominio de producción a los redirects autorizados.

## 7. Hacer admin a un usuario

En Supabase SQL Editor:

```sql
update perfiles set rol = 'admin' where id = (
  select id from auth.users where email = 'CORREO_DEL_ADMIN'
);
```

(El usuario debe haber iniciado sesión al menos una vez.)
