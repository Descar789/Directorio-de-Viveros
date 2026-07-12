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
