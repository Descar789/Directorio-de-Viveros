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

-- El dueño NO puede editar estatus, destacado ni contadores; solo admin.
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
