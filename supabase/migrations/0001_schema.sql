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
