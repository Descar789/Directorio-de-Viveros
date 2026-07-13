"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/zonas";

export interface CamposEditables {
  nombre: string;
  descripcion: string;
  telefono: string;
  whatsapp: string;
  email: string;
  sitio_web: string;
  direccion: string;
  lat: number;
  lng: number;
  horarios: Record<string, string>;
  fotos: string[];
  especialidades: string[];
}

export async function actualizarVivero(
  campos: CamposEditables
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await crearClienteServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a entrar." };

  const { data: vivero } = await supabase
    .from("viveros")
    .select("id, slug, estado, municipio")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!vivero) return { ok: false, error: "No encontramos tu vivero." };

  if (!campos.nombre.trim()) return { ok: false, error: "El nombre no puede quedar vacío." };
  if (!campos.whatsapp.trim() && !campos.telefono.trim()) {
    return { ok: false, error: "Necesitamos al menos tu WhatsApp o un teléfono." };
  }

  // RLS + trigger protegen estatus, destacado y contadores.
  const { error } = await supabase
    .from("viveros")
    .update({
      nombre: campos.nombre.trim(),
      descripcion: campos.descripcion.trim() || null,
      telefono: campos.telefono.trim() || null,
      whatsapp: campos.whatsapp.trim() || null,
      email: campos.email.trim() || null,
      sitio_web: campos.sitio_web.trim() || null,
      direccion: campos.direccion.trim() || null,
      lat: campos.lat,
      lng: campos.lng,
      horarios: campos.horarios,
      fotos: campos.fotos,
    })
    .eq("id", vivero.id);
  if (error) return { ok: false, error: "No pudimos guardar. Intenta de nuevo." };

  // Insignias: reemplazo completo
  const { data: catalogo } = await supabase
    .from("insignias")
    .select("id, clave")
    .in("clave", campos.especialidades);
  await supabase.from("vivero_insignias").delete().eq("vivero_id", vivero.id);
  if (catalogo && catalogo.length > 0) {
    await supabase
      .from("vivero_insignias")
      .insert(catalogo.map((i) => ({ vivero_id: vivero.id, insignia_id: i.id })));
  }

  revalidatePath(`/vivero/${vivero.slug}`);
  revalidatePath(`/viveros/${slugify(vivero.estado)}`);
  revalidatePath(`/viveros/${slugify(vivero.estado)}/${slugify(vivero.municipio)}`);
  revalidatePath("/");
  return { ok: true };
}
