-- Fix: el trigger proteger_columnas_vivero revertía los contadores que
-- incrementar_metrica (security definer) intentaba subir. Se marca la sesión
-- con un flag local que el trigger respeta solo para los contadores.

create or replace function incrementar_metrica(p_vivero_id uuid, p_metrica text)
returns void language plpgsql security definer as $$
begin
  perform set_config('bv.permitir_metrica', '1', true);
  if p_metrica = 'vistas' then
    update viveros set vistas = vistas + 1 where id = p_vivero_id;
  elsif p_metrica = 'clics_whatsapp' then
    update viveros set clics_whatsapp = clics_whatsapp + 1 where id = p_vivero_id;
  elsif p_metrica = 'clics_como_llegar' then
    update viveros set clics_como_llegar = clics_como_llegar + 1 where id = p_vivero_id;
  end if;
end;
$$;

create or replace function proteger_columnas_vivero() returns trigger language plpgsql as $$
begin
  if not es_admin() then
    new.estatus := old.estatus;
    new.destacado_hasta := old.destacado_hasta;
    new.destacado_municipio := old.destacado_municipio;
    new.owner_id := old.owner_id;
    if current_setting('bv.permitir_metrica', true) is distinct from '1' then
      new.vistas := old.vistas;
      new.clics_whatsapp := old.clics_whatsapp;
      new.clics_como_llegar := old.clics_como_llegar;
    end if;
  end if;
  return new;
end;
$$;
