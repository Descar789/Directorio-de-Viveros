# BuscaViveros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Directorio nacional de viveros (Next.js + Supabase) con registro/reclamo de fichas, destacados pagados por municipio y AdSense.

**Architecture:** Monolito Next.js App Router en Vercel. Supabase es la única capa de datos (Postgres + PostGIS, Auth, Storage, RLS). Páginas públicas ISR para SEO por municipio; paneles como rutas protegidas. Mapas Leaflet + OSM.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, @supabase/ssr, react-leaflet, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-12-buscaviveros-design.md`

**Convenciones globales (aplican a TODAS las tareas):**
- Contenido en español. Tokens de color del spec §4 (verde `#15803D`, ámbar `#D97706`, fondo `#F0FDF4`).
- Iconos: solo `lucide-react`, nunca emoji.
- Touch targets ≥44px; contraste AA; `prefers-reduced-motion` respetado.
- Commit al final de cada tarea. Mensajes en convención `feat:/fix:/docs:/test:`.

---

### Task 0: Scaffold del proyecto

**Goal:** App Next.js corriendo con Tailwind, fuentes y tokens de diseño.

**Files:**
- Create: proyecto completo vía `create-next-app` en la raíz del repo
- Modify: `app/globals.css`, `app/layout.tsx`, `package.json`

**Acceptance Criteria:**
- [ ] `npm run dev` levanta la app sin errores
- [ ] Fuentes Poppins (headings) + Open Sans (body) vía `next/font`
- [ ] Variables CSS de la paleta definidas en `globals.css`, modo claro y oscuro

**Verify:** `npm run dev` → http://localhost:3000 renderiza; `npm run build` sin errores.

**Steps:**

- [ ] **Step 1: Scaffold** (el repo ya tiene docs/ y .gitignore — usar `--no-git` no aplica; create-next-app tolera repo existente con carpeta temporal)

```bash
cd "C:\Users\axdel\Documents\GitHub\Directorio de Viveros"
npx create-next-app@latest buscaviveros-tmp --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --yes
# mover contenido a la raíz (PowerShell):
# Get-ChildItem buscaviveros-tmp -Force | Move-Item -Destination . ; Remove-Item buscaviveros-tmp
npm install lucide-react @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @testing-library/react jsdom
```

Fusionar `.gitignore` generado con el existente (conservar `.agents/`, `.superpowers/`; agregar `node_modules/`, `.next/`, `.env*.local`).

- [ ] **Step 2: Fuentes y layout raíz** — `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "BuscaViveros — Directorio de viveros en México", template: "%s | BuscaViveros" },
  description: "Encuentra viveros cerca de ti. El directorio de viveros más completo de México: plantas, árboles, suculentas y más.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="bg-background text-foreground font-body">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Tokens en `app/globals.css`** (Tailwind 4 usa `@theme`):

```css
@import "tailwindcss";

@theme {
  --color-primary: #15803d;
  --color-primary-dark: #166534;
  --color-on-primary: #ffffff;
  --color-secondary: #059669;
  --color-accent: #d97706;
  --color-background: #f0fdf4;
  --color-surface: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #475569;
  --color-border: #e2efe7;
  --color-destructive: #dc2626;
  --font-heading: var(--font-heading), sans-serif;
  --font-body: var(--font-body), sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0c1a10;
    --color-surface: #14261a;
    --color-foreground: #ecfdf5;
    --color-muted: #9ca3af;
    --color-border: #1f3a29;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npm run build` → Expected: build exitoso.

```bash
git add -A && git commit -m "feat: scaffold Next.js con Tailwind, fuentes y tokens de BuscaViveros"
```

---

### Task 1: Esquema Supabase (schema + RLS + búsqueda)

**Goal:** Base de datos completa: tablas, PostGIS, RLS, función de búsqueda por radio, seed de insignias.

**Files:**
- Create: `supabase/migrations/0001_schema.sql`
- Create: `supabase/migrations/0002_rls.sql`
- Create: `supabase/seed.sql`
- Create: `.env.local` (no se commitea), `.env.example`

**Acceptance Criteria:**
- [ ] Migraciones corren limpias en proyecto Supabase nuevo
- [ ] Orden de búsqueda: destacado vigente del municipio → verificado → pre-cargado
- [ ] `buscar_cerca(lat, lng, radio_km)` regresa viveros dentro del radio ordenados
- [ ] RLS: anónimo solo lee `verificado`/`pre-cargado`; dueño edita su ficha; admin todo

**Verify:** correr los queries de prueba del Step 4 en SQL Editor de Supabase → orden y filtros correctos.

**Steps:**

- [ ] **Step 1: Crear proyecto en supabase.com** (región `us-east-1`, plan free). Guardar en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>   # solo server, jamás NEXT_PUBLIC
```

Crear `.env.example` con las mismas claves sin valores. Verificar que `.env*.local` está en `.gitignore`.

- [ ] **Step 2: `supabase/migrations/0001_schema.sql`:**

```sql
create extension if not exists postgis;

create type vivero_estatus as enum ('pre-cargado', 'pendiente', 'verificado', 'rechazado');
create type solicitud_tipo as enum ('nuevo', 'reclamo');
create type solicitud_estatus as enum ('pendiente', 'aprobada', 'rechazada');
create type perfil_rol as enum ('dueno', 'admin');

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol perfil_rol not null default 'dueno',
  nombre text,
  whatsapp text,
  created_at timestamptz not null default now()
);

create table viveros (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  descripcion text,
  telefono text,
  whatsapp text,
  email text,
  sitio_web text,
  estado text not null,
  municipio text not null,
  direccion text,
  lat double precision not null,
  lng double precision not null,
  geo geography(point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored,
  horarios jsonb not null default '{}',
  fotos text[] not null default '{}',
  estatus vivero_estatus not null default 'pendiente',
  owner_id uuid references auth.users(id) on delete set null,
  destacado_hasta date,
  destacado_municipio text,
  vistas integer not null default 0,
  clics_whatsapp integer not null default 0,
  clics_como_llegar integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index viveros_geo_idx on viveros using gist (geo);
create index viveros_zona_idx on viveros (estado, municipio);
create index viveros_estatus_idx on viveros (estatus);

create table insignias (
  id serial primary key,
  clave text not null unique,
  nombre text not null,
  icono text not null  -- nombre de icono lucide
);

create table vivero_insignias (
  vivero_id uuid references viveros(id) on delete cascade,
  insignia_id integer references insignias(id) on delete cascade,
  primary key (vivero_id, insignia_id)
);

create table solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo solicitud_tipo not null,
  solicitante_id uuid not null references auth.users(id) on delete cascade,
  vivero_id uuid references viveros(id) on delete cascade,  -- null si tipo=nuevo hasta aprobar
  datos jsonb not null default '{}',   -- payload del wizard para tipo=nuevo
  evidencia_url text,
  evidencia_texto text,
  estatus solicitud_estatus not null default 'pendiente',
  nota_admin text,
  created_at timestamptz not null default now(),
  resuelta_at timestamptz
);

-- Orden canónico de resultados: 0=destacado vigente en su municipio, 1=verificado, 2=pre-cargado
create or replace function rango_vivero(v viveros) returns integer
language sql immutable as $$
  select case
    when v.destacado_hasta is not null and v.destacado_hasta >= current_date
         and v.destacado_municipio = v.municipio then 0
    when v.estatus = 'verificado' then 1
    else 2
  end;
$$;

create or replace function buscar_cerca(p_lat double precision, p_lng double precision, p_radio_km double precision, p_limite integer default 50)
returns setof viveros language sql stable as $$
  select v.* from viveros v
  where v.estatus in ('verificado', 'pre-cargado')
    and st_dwithin(v.geo, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_radio_km * 1000)
  order by rango_vivero(v),
           st_distance(v.geo, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography)
  limit p_limite;
$$;

-- Contadores de métricas (llamables por anónimo vía RPC, sin abrir UPDATE en RLS)
create or replace function incrementar_metrica(p_vivero_id uuid, p_metrica text)
returns void language plpgsql security definer as $$
begin
  if p_metrica = 'vistas' then
    update viveros set vistas = vistas + 1 where id = p_vivero_id;
  elsif p_metrica = 'clics_whatsapp' then
    update viveros set clics_whatsapp = clics_whatsapp + 1 where id = p_vivero_id;
  elsif p_metrica = 'clics_como_llegar' then
    update viveros set clics_como_llegar = clics_como_llegar + 1 where id = p_vivero_id;
  end if;
end;
$$;

create or replace function es_admin() returns boolean language sql stable security definer as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

-- updated_at automático
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger viveros_updated_at before update on viveros for each row execute function set_updated_at();
```

- [ ] **Step 3: `supabase/migrations/0002_rls.sql`:**

```sql
alter table perfiles enable row level security;
alter table viveros enable row level security;
alter table insignias enable row level security;
alter table vivero_insignias enable row level security;
alter table solicitudes enable row level security;

-- perfiles: cada quien el suyo; admin todo
create policy perfiles_own on perfiles for select using (id = auth.uid() or es_admin());
create policy perfiles_insert on perfiles for insert with check (id = auth.uid());
create policy perfiles_update on perfiles for update using (id = auth.uid() or es_admin());

-- viveros: lectura pública de publicados; dueño su ficha; admin todo
create policy viveros_public_read on viveros for select
  using (estatus in ('verificado', 'pre-cargado') or owner_id = auth.uid() or es_admin());
create policy viveros_owner_update on viveros for update
  using (owner_id = auth.uid() or es_admin())
  with check (owner_id = auth.uid() or es_admin());
create policy viveros_admin_insert on viveros for insert with check (es_admin());
create policy viveros_admin_delete on viveros for delete using (es_admin());

-- insignias: catálogo público, solo admin escribe
create policy insignias_read on insignias for select using (true);
create policy insignias_admin on insignias for all using (es_admin());

create policy vi_read on vivero_insignias for select using (true);
create policy vi_owner on vivero_insignias for all
  using (es_admin() or exists (select 1 from viveros v where v.id = vivero_id and v.owner_id = auth.uid()));

-- solicitudes: solicitante ve las suyas, admin todas
create policy sol_own_read on solicitudes for select using (solicitante_id = auth.uid() or es_admin());
create policy sol_insert on solicitudes for insert with check (solicitante_id = auth.uid());
create policy sol_admin_update on solicitudes for update using (es_admin());
```

Columna protegida: el dueño NO debe poder editar `estatus`, `destacado_hasta`, `destacado_municipio`, ni contadores. Agregar al final de `0002_rls.sql`:

```sql
create or replace function proteger_columnas_vivero() returns trigger language plpgsql as $$
begin
  if not es_admin() then
    new.estatus := old.estatus;
    new.destacado_hasta := old.destacado_hasta;
    new.destacado_municipio := old.destacado_municipio;
    new.owner_id := old.owner_id;
    new.vistas := old.vistas;
    new.clics_whatsapp := old.clics_whatsapp;
    new.clics_como_llegar := old.clics_como_llegar;
  end if;
  return new;
end;
$$;
create trigger viveros_proteger before update on viveros for each row execute function proteger_columnas_vivero();
```

- [ ] **Step 4: `supabase/seed.sql`** (insignias + 3 viveros de prueba):

```sql
insert into insignias (clave, nombre, icono) values
  ('verificado', 'Verificado', 'badge-check'),
  ('mayoreo', 'Mayoreo', 'package'),
  ('menudeo', 'Menudeo', 'shopping-bag'),
  ('ornamental', 'Ornamental', 'flower-2'),
  ('frutales', 'Frutales', 'apple'),
  ('suculentas', 'Suculentas', 'sprout'),
  ('forestal', 'Forestal', 'trees'),
  ('envios', 'Envíos', 'truck'),
  ('insumos', 'Insumos', 'shovel');

insert into viveros (slug, nombre, estado, municipio, lat, lng, whatsapp, estatus, destacado_hasta, destacado_municipio) values
  ('vivero-prueba-destacado-cuautla', 'Vivero Destacado', 'Morelos', 'Cuautla', 18.8121, -98.9542, '527351234567', 'verificado', current_date + 30, 'Cuautla'),
  ('vivero-prueba-verificado-cuautla', 'Vivero Verificado', 'Morelos', 'Cuautla', 18.8200, -98.9600, '527351234568', 'verificado', null, null),
  ('vivero-prueba-precargado-cuautla', 'Vivero Precargado', 'Morelos', 'Cuautla', 18.8000, -98.9500, null, 'pre-cargado', null, null);
```

Queries de verificación (SQL Editor):

```sql
-- 1) Orden por municipio: espera Destacado, Verificado, Precargado
select nombre, rango_vivero(v.*) from viveros v where municipio = 'Cuautla' order by rango_vivero(v.*);
-- 2) Radio 10km centro Cuautla: espera 3 filas mismo orden
select nombre from buscar_cerca(18.8121, -98.9542, 10);
-- 3) Métrica: espera vistas = 1
select incrementar_metrica(id, 'vistas') from viveros limit 1;
select nombre, vistas from viveros order by vistas desc limit 1;
```

- [ ] **Step 5: Commit**

```bash
git add supabase .env.example && git commit -m "feat: esquema Supabase con PostGIS, RLS y búsqueda por radio"
```

---

### Task 2: Clientes Supabase, tipos y autenticación

**Goal:** Helpers de Supabase (browser/server), tipos TS del dominio, login/alta con email y Google, middleware de sesión.

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/tipos.ts`, `middleware.ts`, `app/entrar/page.tsx`, `app/auth/callback/route.ts`

**Acceptance Criteria:**
- [ ] Login con email (magic link) y Google funciona end-to-end
- [ ] Sesión persiste entre recargas (cookies vía @supabase/ssr)
- [ ] Al primer login se crea fila en `perfiles` (trigger o upsert en callback)

**Verify:** `npm run dev` → /entrar → login → redirige a /mi-vivero (aunque aún 404, la sesión existe en DevTools cookies).

**Steps:**

- [ ] **Step 1: `lib/tipos.ts`:**

```ts
export type ViveroEstatus = "pre-cargado" | "pendiente" | "verificado" | "rechazado";

export interface Vivero {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  estado: string;
  municipio: string;
  direccion: string | null;
  lat: number;
  lng: number;
  horarios: Record<string, string>;
  fotos: string[];
  estatus: ViveroEstatus;
  owner_id: string | null;
  destacado_hasta: string | null;
  destacado_municipio: string | null;
  vistas: number;
  clics_whatsapp: number;
  clics_como_llegar: number;
}

export interface Insignia { id: number; clave: string; nombre: string; icono: string; }

export interface Solicitud {
  id: string;
  tipo: "nuevo" | "reclamo";
  solicitante_id: string;
  vivero_id: string | null;
  datos: Record<string, unknown>;
  evidencia_url: string | null;
  evidencia_texto: string | null;
  estatus: "pendiente" | "aprobada" | "rechazada";
  nota_admin: string | null;
  created_at: string;
}

export function esDestacado(v: Pick<Vivero, "destacado_hasta" | "destacado_municipio" | "municipio">): boolean {
  return !!v.destacado_hasta && new Date(v.destacado_hasta) >= new Date(new Date().toDateString())
    && v.destacado_municipio === v.municipio;
}
```

- [ ] **Step 2: Clientes** — `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function crearClienteBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

`lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function crearClienteServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => all.forEach(({ name, value, options }) => {
          try { cookieStore.set(name, value, options); } catch { /* server component: ignorar */ }
        }),
      },
    }
  );
}
```

- [ ] **Step 3: `middleware.ts`** (refresco de sesión, patrón oficial @supabase/ssr):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          all.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const protegidas = ["/mi-vivero", "/admin"];
  if (!user && protegidas.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }
  return response;
}

export const config = { matcher: ["/mi-vivero/:path*", "/admin/:path*", "/registro/:path*"] };
```

- [ ] **Step 4: Página `/entrar` + callback.** `app/entrar/page.tsx`: client component con dos botones — "Continuar con Google" (`supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } })`) y form de email magic link (`signInWithOtp({ email, options: { emailRedirectTo: ... } })`). Botones ≥44px, colores del tema, mensaje de éxito "Revisa tu correo".

`app/auth/callback/route.ts`:

```ts
import { crearClienteServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await crearClienteServer();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await supabase.from("perfiles").upsert({ id: data.user.id }, { onConflict: "id" });
    }
  }
  return NextResponse.redirect(`${origin}${searchParams.get("next") ?? "/mi-vivero"}`);
}
```

Habilitar Google provider en Supabase Dashboard (Auth → Providers) con OAuth client de Google Cloud Console.

- [ ] **Step 5: Verificar login manual y commit**

```bash
git add -A && git commit -m "feat: auth Supabase con email y Google, middleware de sesión"
```

---

### Task 3: Layout global (header, footer, componentes base)

**Goal:** Header sticky con logo/nav/CTA, footer con estados (SEO), componentes UI reutilizables.

**Files:**
- Create: `components/Header.tsx`, `components/Footer.tsx`, `components/InsigniaBadge.tsx`, `components/ViveroCard.tsx`, `lib/zonas.ts`
- Modify: `app/layout.tsx` (montar Header/Footer)

**Acceptance Criteria:**
- [ ] Header: logo BuscaViveros (icono `Sprout` + wordmark), nav (Inicio, Directorio), CTA ámbar "Registra tu vivero gratis" → /registro, menú hamburguesa en móvil
- [ ] Footer: columnas de estados piloto con links `/viveros/[estado]`, links legales (/privacidad)
- [ ] `ViveroCard`: foto (o placeholder `Leaf`), nombre, municipio, insignias, badge "Destacado" ámbar cuando aplica, botón WhatsApp
- [ ] `lib/zonas.ts`: catálogo de 32 estados con slugs + municipios piloto

**Verify:** `npm run dev` → header/footer en home; card renderiza con y sin foto; responsive 375px sin scroll horizontal.

**Steps:**

- [ ] **Step 1: `lib/zonas.ts`** — exportar `ESTADOS: { slug: string; nombre: string }[]` (los 32, slug kebab-case: `"ciudad-de-mexico"`, `"estado-de-mexico"`, `"morelos"`…) y helpers `slugAEstado()`, `slugify(texto)` (minúsculas, sin acentos, espacios→guiones — usar en slugs de viveros y municipios).

- [ ] **Step 2: `components/InsigniaBadge.tsx`** — recibe `Insignia`, mapea `icono` a componente Lucide vía objeto `{ "badge-check": BadgeCheck, ... }`, chip con borde `border-border`, texto 12px, icono 14px.

- [ ] **Step 3: `components/ViveroCard.tsx`:**

```tsx
import Link from "next/link";
import Image from "next/image";
import { Leaf, MapPin, MessageCircle, Star } from "lucide-react";
import type { Vivero, Insignia } from "@/lib/tipos";
import { esDestacado } from "@/lib/tipos";
import InsigniaBadge from "./InsigniaBadge";

export default function ViveroCard({ vivero, insignias }: { vivero: Vivero; insignias: Insignia[] }) {
  const destacado = esDestacado(vivero);
  return (
    <article className={`bg-surface rounded-2xl border ${destacado ? "border-accent shadow-lg" : "border-border"} overflow-hidden`}>
      <Link href={`/vivero/${vivero.slug}`} className="block">
        <div className="relative h-40 bg-background flex items-center justify-center">
          {vivero.fotos[0]
            ? <Image src={vivero.fotos[0]} alt={vivero.nombre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            : <Leaf className="w-10 h-10 text-primary/40" aria-hidden />}
          {destacado && (
            <span className="absolute top-2 left-2 bg-accent text-on-primary text-xs font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1">
              <Star className="w-3 h-3" aria-hidden /> Destacado
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold">{vivero.nombre}</h3>
          <p className="text-sm text-muted inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" aria-hidden /> {vivero.municipio}, {vivero.estado}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">{insignias.map((i) => <InsigniaBadge key={i.id} insignia={i} />)}</div>
        </div>
      </Link>
      {vivero.whatsapp && (
        <a href={`https://wa.me/${vivero.whatsapp}`} target="_blank" rel="noopener noreferrer"
           className="m-4 mt-0 min-h-11 inline-flex items-center justify-center gap-2 w-[calc(100%-2rem)] bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
          <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp
        </a>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Header y Footer** siguiendo los criterios; montar en `app/layout.tsx`. Header client component solo para hamburguesa (estado `open`), resto server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: layout global con header, footer y componentes base"
```

---

### Task 4: Módulo de búsqueda con tests

**Goal:** Funciones de datos (server-only) para listar/buscar viveros con el orden canónico, y utilidades puras testeadas.

**Files:**
- Create: `lib/busqueda.ts`, `lib/busqueda.test.ts`, `vitest.config.ts`

**Acceptance Criteria:**
- [ ] `ordenarViveros()` (pura): destacados del municipio → verificados → pre-cargados, estable
- [ ] `viverosPorZona(estado, municipio?)`, `viverosCerca(lat, lng, radioKm)`, `buscarViveros(q, filtros)` consultan Supabase
- [ ] Tests unitarios de `ordenarViveros` y `esDestacado` pasan

**Verify:** `npx vitest run` → verde.

**Steps:**

- [ ] **Step 1: Test primero** — `lib/busqueda.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ordenarViveros } from "./busqueda";
import type { Vivero } from "./tipos";

const base: Partial<Vivero> = { municipio: "Cuautla", estado: "Morelos" };
const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function v(p: Partial<Vivero>): Vivero { return { ...base, ...p } as Vivero; }

describe("ordenarViveros", () => {
  it("destacado vigente primero, luego verificado, luego pre-cargado", () => {
    const lista = [
      v({ nombre: "pre", estatus: "pre-cargado", destacado_hasta: null }),
      v({ nombre: "ver", estatus: "verificado", destacado_hasta: null }),
      v({ nombre: "dest", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista).map((x) => x.nombre)).toEqual(["dest", "ver", "pre"]);
  });

  it("destacado vencido cuenta como su estatus normal", () => {
    const lista = [
      v({ nombre: "vencido", estatus: "verificado", destacado_hasta: ayer, destacado_municipio: "Cuautla" }),
      v({ nombre: "vigente", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista)[0].nombre).toBe("vigente");
  });

  it("destacado de otro municipio no aplica", () => {
    const lista = [
      v({ nombre: "otro", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Yautepec" }),
      v({ nombre: "local", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista)[0].nombre).toBe("local");
  });
});
```

Run: `npx vitest run` → Expected: FAIL (`ordenarViveros` no existe).

- [ ] **Step 2: Implementar `lib/busqueda.ts`:**

```ts
import { crearClienteServer } from "./supabase/server";
import { esDestacado, type Vivero } from "./tipos";

export function rangoVivero(v: Vivero): number {
  if (esDestacado(v)) return 0;
  if (v.estatus === "verificado") return 1;
  return 2;
}

export function ordenarViveros(lista: Vivero[]): Vivero[] {
  return [...lista].sort((a, b) => rangoVivero(a) - rangoVivero(b));
}

export async function viverosPorZona(estado: string, municipio?: string): Promise<Vivero[]> {
  const supabase = await crearClienteServer();
  let q = supabase.from("viveros").select("*").eq("estado", estado).in("estatus", ["verificado", "pre-cargado"]);
  if (municipio) q = q.eq("municipio", municipio);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return ordenarViveros(data ?? []);
}

export async function viverosCerca(lat: number, lng: number, radioKm = 25): Promise<Vivero[]> {
  const supabase = await crearClienteServer();
  const { data, error } = await supabase.rpc("buscar_cerca", { p_lat: lat, p_lng: lng, p_radio_km: radioKm });
  if (error) throw error;
  return data ?? []; // ya viene ordenado del RPC
}

export async function buscarViveros(q: string, insignia?: string): Promise<Vivero[]> {
  const supabase = await crearClienteServer();
  let query = supabase.from("viveros").select("*, vivero_insignias!inner(insignias!inner(clave))")
    .in("estatus", ["verificado", "pre-cargado"])
    .or(`nombre.ilike.%${q}%,municipio.ilike.%${q}%,estado.ilike.%${q}%`);
  if (insignia) query = query.eq("vivero_insignias.insignias.clave", insignia);
  const { data, error } = await query.limit(100);
  if (error) throw error;
  return ordenarViveros((data ?? []) as unknown as Vivero[]);
}
```

`vitest.config.ts`: entorno `jsdom`, include `lib/**/*.test.ts`.

- [ ] **Step 3: Verificar y commit**

Run: `npx vitest run` → Expected: PASS (3 tests).

```bash
git add -A && git commit -m "feat: módulo de búsqueda con orden canónico y tests"
```

---

### Task 5: Home (hero B: buscador + mapa)

**Goal:** Portada con buscador doble (qué + dónde), "cerca de mí", mapa con pines, categorías, destacados, franja de registro.

**Files:**
- Create: `app/page.tsx`, `components/MapaViveros.tsx`, `components/Buscador.tsx`
- Modify: `package.json` (`npm install leaflet react-leaflet @types/leaflet`)

**Acceptance Criteria:**
- [ ] Hero split: izquierda título + buscador + "Ver viveros cerca de mí"; derecha mapa Leaflet con pines de viveros publicados
- [ ] Mapa carga solo en cliente (`dynamic(() => import(...), { ssr: false })`) con placeholder que reserva altura (sin CLS)
- [ ] Buscador manda a `/buscar?q=...`; "cerca de mí" usa `navigator.geolocation` → `/buscar?lat=&lng=`
- [ ] Sección de categorías (chips con iconos de insignias) → `/buscar?insignia=`
- [ ] Sección destacados + franja CTA "¿Tienes un vivero? Regístralo gratis"

**Verify:** `npm run dev` → home renderiza mapa con los 3 viveros seed; búsqueda navega; Lighthouse CLS < 0.1.

**Steps:**

- [ ] **Step 1: `components/MapaViveros.tsx`** (client):

```tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import type { Vivero } from "@/lib/tipos";

const icono = L.divIcon({
  className: "",
  html: `<div style="background:#15803D;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function MapaViveros({ viveros, centro = [19.0, -99.1], zoom = 8 }:
  { viveros: Vivero[]; centro?: [number, number]; zoom?: number }) {
  return (
    <MapContainer center={centro} zoom={zoom} className="h-full w-full rounded-2xl" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {viveros.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={icono}>
          <Popup><Link href={`/vivero/${v.slug}`}>{v.nombre}</Link><br />{v.municipio}, {v.estado}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 2: `components/Buscador.tsx`** (client): dos inputs (`q` texto "¿Qué buscas?", `donde` texto "¿Dónde?"), botón Buscar (submit → `router.push("/buscar?q=" + ...)`; concatenar `donde` a `q` si viene), y botón secundario "Ver viveros cerca de mí" con `navigator.geolocation.getCurrentPosition` → `/buscar?lat=&lng=`; si el permiso falla, mostrar aviso inline "No pudimos obtener tu ubicación — busca por municipio".

- [ ] **Step 3: Wrapper cliente + `app/page.tsx`.** OJO: Next 15 prohíbe `ssr: false` en server components — el import dinámico vive en un wrapper cliente. Crear `components/MapaViverosLazy.tsx`:

```tsx
"use client";
import dynamic from "next/dynamic";

const MapaViveros = dynamic(() => import("@/components/MapaViveros"), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-2xl bg-border animate-pulse" aria-hidden />,
});

export default MapaViveros;
```

`app/page.tsx` (server): consulta `viverosPorZona` de estados piloto (o todos con límite), importa `MapaViverosLazy` normal (sin dynamic) y lo usa en el hero.

Estructura: hero (grid 2 cols desktop, apilado móvil, mapa `h-[420px]`), fila de confianza ("✓ 300+ viveros ✓ Gratis ✓ Verificados" con iconos `Check`), categorías (chips desde tabla `insignias`), grid de destacados (`ViveroCard`), franja CTA registro (fondo `primary`, botón `accent`), todo con `max-w-6xl mx-auto`.

- [ ] **Step 4: Verificar y commit**

```bash
git add -A && git commit -m "feat: home con buscador, mapa Leaflet y destacados"
```

---

### Task 6: Páginas de directorio SEO (/viveros/...) y /buscar

**Goal:** Páginas estado y municipio con ISR + resultados de búsqueda libre.

**Files:**
- Create: `app/viveros/[estado]/page.tsx`, `app/viveros/[estado]/[municipio]/page.tsx`, `app/buscar/page.tsx`, `app/sitemap.ts`

**Acceptance Criteria:**
- [ ] `/viveros/morelos` y `/viveros/morelos/cuautla` renderizan lista ordenada + mapa, `revalidate = 3600`
- [ ] Metadata dinámica: title "Viveros en Cuautla, Morelos", description con conteo
- [ ] Estado vacío: "Aún no hay viveros en X — sé el primero" + CTA /registro
- [ ] `/buscar` lee `q`/`insignia`/`lat`+`lng`, server component, `robots: { index: false }`
- [ ] `sitemap.ts` genera URLs de estados, municipios con viveros y fichas

**Verify:** `npm run build` → páginas ISR generadas; `/viveros/morelos/cuautla` muestra seed en orden destacado→verificado→pre-cargado.

**Steps:**

- [ ] **Step 1: Página municipio** — `app/viveros/[estado]/[municipio]/page.tsx`:

```tsx
import { viverosPorZona } from "@/lib/busqueda";
import { slugAEstado, desSlug } from "@/lib/zonas";
import ViveroCard from "@/components/ViveroCard";
import MapaViveros from "@/components/MapaViverosLazy";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ estado: string; municipio: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estado, municipio } = await params;
  const e = slugAEstado(estado)?.nombre ?? desSlug(estado);
  const m = desSlug(municipio);
  return {
    title: `Viveros en ${m}, ${e}`,
    description: `Directorio de viveros en ${m}, ${e}: plantas, árboles, suculentas. Teléfono, WhatsApp, horarios y ubicación.`,
  };
}

export default async function PaginaMunicipio({ params }: Props) {
  const { estado, municipio } = await params;
  const e = slugAEstado(estado)?.nombre ?? desSlug(estado);
  const m = desSlug(municipio);
  const viveros = await viverosPorZona(e, m);

  if (viveros.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Aún no hay viveros en {m}</h1>
        <p className="text-muted mt-2">Sé el primero en aparecer aquí.</p>
        <Link href="/registro" className="inline-flex mt-6 min-h-11 items-center bg-accent text-on-primary font-semibold px-6 rounded-xl">
          Registra tu vivero gratis
        </Link>
      </main>
    );
  }

  const centro: [number, number] = [viveros[0].lat, viveros[0].lng];
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Viveros en {m}, {e}</h1>
      <p className="text-muted mt-1">{viveros.length} viveros encontrados</p>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {viveros.map((v) => <ViveroCard key={v.id} vivero={v} insignias={[]} />)}
        </div>
        <div className="h-[420px] lg:sticky lg:top-20"><MapaViveros viveros={viveros} centro={centro} zoom={12} /></div>
      </div>
    </main>
  );
}
```

(`desSlug` en `lib/zonas.ts`: guiones→espacios + capitalizar. Nota: municipios se guardan con nombre legible; el slug se deriva con `slugify`. Para el lookup, comparar `slugify(municipio) === param`.) Cargar también insignias reales por vivero con un `select` adicional agrupado (`vivero_insignias` con `insignias(*)`) y pasarlas a la card.

- [ ] **Step 2: Página estado** — igual pero sin filtro municipio, con índice de municipios (links a sus páginas, derivados con `select distinct municipio`).

- [ ] **Step 3: `/buscar`** — server component: si `lat`+`lng` → `viverosCerca`; si `q`/`insignia` → `buscarViveros`. Filtros de insignia como chips-link arriba. Slot AdSense reservado entre resultados 4 y 5 (placeholder `div` con `min-h-[100px]` — se llena en Task 11). `export const metadata = { robots: { index: false } }`.

- [ ] **Step 4: `app/sitemap.ts`** — consulta estados/municipios distintos + slugs publicados; base URL de `process.env.NEXT_PUBLIC_SITE_URL`.

- [ ] **Step 5: Verificar y commit**

```bash
git add -A && git commit -m "feat: páginas SEO de estado/municipio, búsqueda y sitemap"
```

---

### Task 7: Ficha de vivero (/vivero/[slug])

**Goal:** Página de detalle con galería, insignias, mapa, horarios, CTA WhatsApp, Schema.org y métricas.

**Files:**
- Create: `app/vivero/[slug]/page.tsx`, `components/GaleriaFotos.tsx`, `components/BotonContacto.tsx`, `app/api/metrica/route.ts`

**Acceptance Criteria:**
- [ ] Galería (foto principal + thumbnails), insignias, descripción, horarios (tabla por día), mapa con pin
- [ ] CTA principal: botón WhatsApp grande fijo en móvil (barra inferior); secundarios: llamar, cómo llegar (link Google Maps `https://maps.google.com/?q=lat,lng`)
- [ ] JSON-LD Schema.org `GardenStore` (name, address, geo, telephone, openingHours, image)
- [ ] Al cargar la página se incrementa `vistas`; clic WhatsApp/cómo llegar incrementan su contador (vía `/api/metrica`, `navigator.sendBeacon`)
- [ ] `generateStaticParams` + `revalidate = 3600`; 404 si slug no existe o estatus no publicado

**Verify:** ficha del seed renderiza; validador https://validator.schema.org pasa; contadores suben en DB tras visitar/clicar.

**Steps:**

- [ ] **Step 1: `app/api/metrica/route.ts`:**

```ts
import { crearClienteServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const METRICAS = new Set(["vistas", "clics_whatsapp", "clics_como_llegar"]);

export async function POST(request: Request) {
  const { viveroId, metrica } = await request.json();
  if (!METRICAS.has(metrica) || typeof viveroId !== "string") {
    return NextResponse.json({ error: "métrica inválida" }, { status: 400 });
  }
  const supabase = await crearClienteServer();
  await supabase.rpc("incrementar_metrica", { p_vivero_id: viveroId, p_metrica: metrica });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: `components/BotonContacto.tsx`** (client) — recibe `vivero`; al montar dispara `sendBeacon("/api/metrica", JSON.stringify({ viveroId, metrica: "vistas" }))` una vez (useEffect). Renderiza barra: WhatsApp (primario, `bg-primary`), Llamar (`tel:`), Cómo llegar (link maps) — cada clic manda su beacon. En móvil `fixed bottom-0 inset-x-0` con `safe-area-inset-bottom`; en desktop, columna lateral.

- [ ] **Step 3: Página** — server component: fetch por slug (`.eq("slug", slug).in("estatus", ["verificado","pre-cargado"]).single()`, si error → `notFound()`), insignias, JSON-LD:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GardenStore",
  name: vivero.nombre,
  description: vivero.descripcion ?? undefined,
  telephone: vivero.telefono ?? undefined,
  image: vivero.fotos,
  address: { "@type": "PostalAddress", addressLocality: vivero.municipio, addressRegion: vivero.estado, streetAddress: vivero.direccion ?? undefined, addressCountry: "MX" },
  geo: { "@type": "GeoCoordinates", latitude: vivero.lat, longitude: vivero.lng },
};
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

Layout: galería arriba (grid), título + insignias + badge Destacado, descripción, horarios, mapa `h-64`, slot AdSense lateral (placeholder). Si `estatus === "pre-cargado"`: franja "¿Este vivero es tuyo? Reclámalo gratis" → `/registro?reclamar=<slug>`.

- [ ] **Step 4: Verificar y commit**

```bash
git add -A && git commit -m "feat: ficha de vivero con Schema.org, métricas y CTA WhatsApp"
```

---

### Task 8: Wizard de registro/reclamo

**Goal:** Wizard paso a paso (opción A validada): 6 pasos, auto-guardado, entrada doble nuevo/reclamo.

**Files:**
- Create: `app/registro/page.tsx`, `components/registro/Wizard.tsx`, `components/registro/pasos/*.tsx` (PasoNombre, PasoUbicacion, PasoContacto, PasoEspecialidades, PasoFotos, PasoRevision), `components/registro/MapaPin.tsx`, `lib/registro.ts`, `lib/registro.test.ts`

**Acceptance Criteria:**
- [ ] Pantalla inicial: "Registrar mi vivero" vs "Mi vivero ya aparece — reclamarlo" (buscador de fichas pre-cargadas por nombre/municipio; al elegir, pide evidencia foto/texto y salta a revisión)
- [ ] 6 pasos, barra de progreso, botones ≥44px, una pregunta por pantalla, validación al continuar (no por tecla)
- [ ] Ubicación: `MapaPin` con marker arrastrable + botón "usar mi ubicación actual"
- [ ] Obligatorios solo: nombre, municipio+estado, WhatsApp o teléfono, ≥1 especialidad, ≥1 foto
- [ ] Borrador en `localStorage` (clave `bv-registro-borrador`), se restaura al volver
- [ ] Fotos → Supabase Storage bucket `fotos-viveros` (público-lectura); comprimir client-side a máx 1600px con canvas
- [ ] Enviar: inserta `solicitudes` (`tipo`, `datos` = payload completo, `evidencia_*` si reclamo) y muestra "Tu vivero está en revisión — te avisamos por WhatsApp en menos de 24h"
- [ ] Requiere sesión: si no hay, manda a /entrar con `?next=/registro`

**Verify:** `npx vitest run` (validadores) verde; flujo completo en móvil 375px crea solicitud visible en tabla; recargar a medio wizard restaura borrador.

**Steps:**

- [ ] **Step 1: Test primero** — `lib/registro.test.ts` para `validarPaso(paso, datos)`:

```ts
import { describe, it, expect } from "vitest";
import { validarPaso, type DatosRegistro } from "./registro";

const datosOk: DatosRegistro = {
  nombre: "Vivero Test", estado: "Morelos", municipio: "Cuautla",
  lat: 18.8, lng: -98.95, whatsapp: "7351234567", telefono: "",
  especialidades: ["ornamental"], fotos: ["url"], descripcion: "", horarios: {},
};

describe("validarPaso", () => {
  it("nombre vacío falla con mensaje claro", () => {
    expect(validarPaso(1, { ...datosOk, nombre: " " })).toMatchObject({ ok: false });
  });
  it("requiere whatsapp O teléfono, no ambos", () => {
    expect(validarPaso(3, { ...datosOk, whatsapp: "", telefono: "" }).ok).toBe(false);
    expect(validarPaso(3, { ...datosOk, whatsapp: "", telefono: "7351111111" }).ok).toBe(true);
  });
  it("normaliza whatsapp a formato 52XXXXXXXXXX", () => {
    expect(validarPaso(3, { ...datosOk, whatsapp: "735 123 4567" }).datos?.whatsapp).toBe("527351234567");
  });
  it("al menos una especialidad y una foto", () => {
    expect(validarPaso(4, { ...datosOk, especialidades: [] }).ok).toBe(false);
    expect(validarPaso(5, { ...datosOk, fotos: [] }).ok).toBe(false);
  });
});
```

Run: `npx vitest run` → FAIL.

- [ ] **Step 2: `lib/registro.ts`** — tipos `DatosRegistro`, `validarPaso(paso, datos): { ok: boolean; error?: string; datos?: DatosRegistro }` (normaliza WhatsApp: quitar no-dígitos, anteponer `52` si son 10 dígitos), `guardarBorrador`/`cargarBorrador` (localStorage con try/catch), `comprimirImagen(file): Promise<Blob>` (canvas, máx 1600px, JPEG 0.8).

Run: `npx vitest run` → PASS.

- [ ] **Step 3: `Wizard.tsx`** (client) — estado `{ paso, datos, modo: "nuevo" | "reclamo", viveroReclamado?, evidencia? }`; renderiza paso actual; `Continuar` valida con `validarPaso` y muestra error inline (`role="alert"`, foco al error); barra de progreso `aria-valuenow`; auto-guardado en cada cambio (debounce 500ms). Envío:

```ts
const { error } = await supabase.from("solicitudes").insert({
  tipo: modo, solicitante_id: user.id,
  vivero_id: modo === "reclamo" ? viveroReclamado!.id : null,
  datos, evidencia_url: evidencia?.url ?? null, evidencia_texto: evidencia?.texto ?? null,
});
```

Al éxito: `localStorage.removeItem`, pantalla de confirmación con icono `CheckCircle` y el mensaje de 24h.

- [ ] **Step 4: Pasos** — cada uno componente enfocado: PasoUbicacion usa `MapaPin` (react-leaflet `Marker draggable eventHandlers={{ dragend }}` + selects estado/municipio + geolocalización); PasoEspecialidades chips multiselect desde tabla `insignias` (excluir `verificado`); PasoFotos input file múltiple → comprimir → subir a Storage → previews con quitar; PasoRevision muestra resumen editable (link a cada paso).

Reclamo: buscador consulta `viveros` con `estatus = 'pre-cargado'` e `ilike` nombre/municipio; al seleccionar pide evidencia (foto del local a Storage o texto) y va a revisión.

- [ ] **Step 5: Verificar flujo completo y commit**

```bash
git add -A && git commit -m "feat: wizard de registro y reclamo con auto-guardado"
```

---

### Task 9: Panel de dueño (/mi-vivero)

**Goal:** El dueño edita su ficha, ve métricas y pide destacado.

**Files:**
- Create: `app/mi-vivero/page.tsx`, `app/mi-vivero/editar/page.tsx`, `components/panel/FormFicha.tsx`, `components/panel/Metricas.tsx`

**Acceptance Criteria:**
- [ ] Sin vivero propio: estado con link a /registro; con solicitud pendiente: "en revisión"
- [ ] Editar: mismos campos del wizard en formulario por secciones (aquí sí, ya conoce sus datos) + gestión de fotos (agregar/quitar/reordenar) + horarios por día
- [ ] Métricas: vistas, clics WhatsApp, clics cómo llegar (números grandes + texto "este total ayuda a vender el destacado")
- [ ] Botón "Destacar mi vivero — $99/mes": abre `https://wa.me/<ADMIN_WHATSAPP>?text=Quiero destacar {nombre} en {municipio}` (env `NEXT_PUBLIC_ADMIN_WHATSAPP`)
- [ ] Si ya destacado: "Destacado hasta {fecha}" con badge
- [ ] Vista previa: link a su ficha pública

**Verify:** editar nombre → se refleja en ficha pública tras revalidar; usuario sin ficha no puede editar la de otro (URL directa → redirect).

**Steps:**

- [ ] **Step 1: Página principal** — server: `supabase.from("viveros").select("*").eq("owner_id", user.id).maybeSingle()`; sin ficha → buscar solicitud pendiente y mostrar estado correspondiente.
- [ ] **Step 2: `FormFicha`** (client) — server action `actualizarVivero` en `app/mi-vivero/editar/actions.ts` con `revalidatePath("/vivero/[slug]", "page")` y de las páginas de zona. RLS + trigger ya impiden campos protegidos.
- [ ] **Step 3: Métricas + CTA destacado** según criterios.
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: panel de dueño con edición, métricas y CTA de destacado"
```

---

### Task 10: Panel admin (/admin)

**Goal:** Moderación de solicitudes, CRUD de viveros, import CSV, gestión de destacados.

**Files:**
- Create: `app/admin/page.tsx`, `app/admin/solicitudes/page.tsx`, `app/admin/viveros/page.tsx`, `app/admin/destacados/page.tsx`, `app/admin/importar/page.tsx`, `app/admin/actions.ts`, `lib/csv.ts`, `lib/csv.test.ts`

**Acceptance Criteria:**
- [ ] Guard adicional: layout de /admin verifica `perfiles.rol === 'admin'`, si no → redirect a /
- [ ] Solicitudes: lista pendientes con datos/evidencia; Aprobar nuevo → crea vivero (`estatus: 'verificado'`, `owner_id: solicitante`, slug con `slugify(nombre)-slugify(municipio)`, sufijo `-2` si colisiona); Aprobar reclamo → asigna `owner_id` y `estatus: 'verificado'`; Rechazar pide `nota_admin`
- [ ] Destacados: buscar vivero, fijar `destacado_hasta` + `destacado_municipio`; **bloquea si ya hay 3 vigentes en ese municipio** (mensaje claro); lista de vigentes con días restantes, los que vencen en ≤3 días resaltados en ámbar
- [ ] Import CSV: columnas `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion`; previsualiza, valida filas (lat/lng numéricos, nombre no vacío), inserta como `pre-cargado`, reporta errores por fila
- [ ] CRUD viveros: tabla con búsqueda, editar cualquier campo, borrar con confirmación
- [ ] Acciones de admin usan server actions con verificación de rol server-side (no confiar solo en el layout)

**Verify:** `npx vitest run` (parser CSV) verde; aprobar solicitud del seed publica ficha; 4º destacado en Cuautla rechazado con mensaje.

**Steps:**

- [ ] **Step 1: Test primero** — `lib/csv.test.ts`: parsear CSV válido → filas tipadas; fila sin nombre → error con número de línea; lat no numérica → error. Run: FAIL.
- [ ] **Step 2: `lib/csv.ts`** — `parsearCsvViveros(texto): { filas: FilaVivero[]; errores: { linea: number; error: string }[] }` (split líneas, header obligatorio, sin dependencias). Run: PASS.
- [ ] **Step 3: `app/admin/actions.ts`** — server actions: `aprobarSolicitud(id)`, `rechazarSolicitud(id, nota)`, `activarDestacado(viveroId, municipio, hasta)` (cuenta vigentes: `select count(*) from viveros where destacado_municipio = X and destacado_hasta >= current_date` → si ≥3, `throw new Error("Ya hay 3 destacados en " + municipio)`), `importarViveros(filas)`. Todas empiezan con verificación `es_admin` vía query a `perfiles`.
- [ ] **Step 4: Páginas** — tablas server components + formularios client mínimos. Confirmación antes de borrar (`confirm dialog` accesible). Toast de éxito/error.
- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: panel admin con moderación, destacados e import CSV"
```

---

### Task 11: AdSense + privacidad + cookies

**Goal:** Slots de anuncios listos, política de privacidad y consentimiento.

**Files:**
- Create: `components/AdSlot.tsx`, `components/AvisoCookies.tsx`, `app/privacidad/page.tsx`
- Modify: `app/layout.tsx`, `app/buscar/page.tsx`, `app/vivero/[slug]/page.tsx`, páginas de zona

**Acceptance Criteria:**
- [ ] `AdSlot`: reserva espacio fijo (`min-h`), renderiza `<ins class="adsbygoogle">` solo si `NEXT_PUBLIC_ADSENSE_CLIENT` definido; si no, placeholder "Publicidad" discreto
- [ ] Script AdSense en layout con `strategy="lazyOnload"` solo con env presente
- [ ] Slots colocados: /buscar (posición 4-5), lateral ficha, pie de estado/municipio. Cero slots en hero, wizard, paneles
- [ ] `/privacidad`: política en español (datos que se recopilan: cuenta, ficha de negocio, cookies de publicidad de Google; derechos ARCO; contacto)
- [ ] `AvisoCookies`: banner inferior, "Aceptar" / "Solo esenciales", guarda elección en localStorage; AdSense solo carga tras aceptar

**Verify:** con env vacía no hay scripts de Google en el HTML; con env y consentimiento aceptado el script carga; CLS < 0.1 en /buscar.

**Steps:**

- [ ] **Step 1: `AdSlot` + integración de consentimiento** (contexto simple con localStorage `bv-cookies`).
- [ ] **Step 2: Colocar slots + página privacidad** (redactar política completa — sin lorem).
- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: slots AdSense con consentimiento y política de privacidad"
```

---

### Task 12: Analytics (GA4 + Meta Pixel)

**Goal:** Medición de eventos clave desde día 1, condicionada a consentimiento.

**Files:**
- Create: `lib/analytics.ts`, `components/Analytics.tsx`
- Modify: `app/layout.tsx`, `components/Buscador.tsx`, `components/BotonContacto.tsx`, `components/registro/Wizard.tsx`

**Acceptance Criteria:**
- [ ] GA4 (`NEXT_PUBLIC_GA_ID`) y Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) cargan solo con env presente + cookies aceptadas
- [ ] `track(evento, props)` unificado: `busqueda`, `clic_whatsapp`, `registro_iniciado`, `registro_completado`
- [ ] Sin envs: `track` es no-op silencioso (la app nunca truena por analytics)

**Verify:** con envs de prueba, eventos visibles en GA4 DebugView; sin envs, cero requests a Google/Meta.

**Steps:**

- [ ] **Step 1: `lib/analytics.ts`** — `track` que empuja a `window.gtag` y `window.fbq` si existen, envuelto en try/catch.
- [ ] **Step 2: Instrumentar** los 4 eventos en los componentes listados.
- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: GA4 y Meta Pixel con eventos de conversión"
```

---

### Task 13: E2E y calidad

**Goal:** Playwright E2E de flujos críticos + Lighthouse.

**Files:**
- Create: `playwright.config.ts`, `e2e/busqueda.spec.ts`, `e2e/registro.spec.ts`, `e2e/admin.spec.ts`

**Acceptance Criteria:**
- [ ] E2E: home → buscar "Cuautla" → resultados en orden (Destacado primero) → ficha → botón WhatsApp presente con href correcto
- [ ] E2E: wizard completo con usuario de prueba crea solicitud (Supabase local o proyecto de test; seeds del Task 1)
- [ ] E2E: admin aprueba solicitud → ficha pública visible
- [ ] Lighthouse en `/viveros/morelos/cuautla`: SEO ≥ 90, CLS < 0.1

**Verify:** `npx playwright test` verde; `npx lighthouse http://localhost:3000/viveros/morelos/cuautla --only-categories=seo --quiet` ≥ 90.

**Steps:**

- [ ] **Step 1:** `npm install -D @playwright/test && npx playwright install chromium`. Config con `baseURL: http://localhost:3000`, `webServer: { command: "npm run dev" }`.
- [ ] **Step 2:** Escribir los 3 specs (usuarios de prueba: crear vía script `e2e/setup.ts` con service role — email `test-dueno@buscaviveros.mx`, `test-admin@buscaviveros.mx` con rol admin en perfiles).
- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: E2E de búsqueda, registro y moderación"
```

---

### Task 14: Deploy y pre-carga

**Goal:** Sitio en producción con datos piloto.

**Files:**
- Create: `docs/operacion.md` (runbook), `data/precarga-piloto.csv` (plantilla con columnas + 5 filas de ejemplo)

**Acceptance Criteria:**
- [ ] Deploy en Vercel conectado al repo GitHub, envs configuradas (Supabase, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_WHATSAPP`)
- [ ] Dominio: comprar `buscaviveros.mx` (verificar disponibilidad; plan B: `buscaviveros.com.mx`) y conectar en Vercel
- [ ] Import CSV de pre-carga piloto vía /admin/importar
- [ ] `docs/operacion.md`: cómo aprobar solicitudes, activar destacados, cobrar renovaciones (revisar vencimientos ≤3 días en /admin/destacados), alta en AdSense post-lanzamiento, checklist de campaña Fase 0/1/2 del spec §8
- [ ] Supabase: backup automático habilitado (incluido en free tier: 7 días)

**Verify:** URL de producción responde; ficha real con Schema.org válido; registro de prueba end-to-end en producción.

**Steps:**

- [ ] **Step 1:** Vercel: `vercel link` + envs + deploy. Google OAuth: agregar dominio de producción a redirects autorizados (Supabase + Google Console).
- [ ] **Step 2:** Dominio + DNS.
- [ ] **Step 3:** Redactar runbook y plantilla CSV; recolectar datos públicos de viveros piloto (Google Maps, directorios existentes solo como referencia de existencia — datos de contacto verificados llamando) e importar.
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: runbook de operación y plantilla de pre-carga"
```

---

## Dependencias

```
Task 0 → Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10 → Task 11 → Task 12 → Task 13 → Task 14
```

(Lineal: cada tarea usa artefactos de la anterior. 5-7 podrían paralelizarse tras 4, pero el orden lineal evita conflictos.)

## Fuera del plan (operación, no código)

- Campañas Meta/Google Ads (spec §8) — se ejecutan tras Task 14 siguiendo el runbook.
- Venta de destacados por WhatsApp — proceso manual documentado en runbook.
