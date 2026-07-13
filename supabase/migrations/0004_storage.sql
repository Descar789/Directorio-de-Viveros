-- Bucket público-lectura para fotos de viveros
insert into storage.buckets (id, name, public)
values ('fotos-viveros', 'fotos-viveros', true)
on conflict (id) do nothing;

create policy fotos_lectura_publica on storage.objects
  for select using (bucket_id = 'fotos-viveros');

create policy fotos_subida_autenticados on storage.objects
  for insert with check (bucket_id = 'fotos-viveros' and auth.role() = 'authenticated');

create policy fotos_borrado_dueno on storage.objects
  for delete using (bucket_id = 'fotos-viveros' and (owner = auth.uid() or es_admin()));
