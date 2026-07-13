"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/zonas";
import type { FilaVivero } from "@/lib/csv";
import type { DatosRegistro } from "@/lib/registro";

type Resultado = { ok: boolean; error?: string };

async function exigirAdmin() {
  const supabase = await crearClienteServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Sesión expirada." };
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.rol !== "admin") return { supabase, error: "No tienes permisos de administrador." };
  return { supabase, error: null };
}

async function generarSlugUnico(
  supabase: Awaited<ReturnType<typeof crearClienteServer>>,
  nombre: string,
  municipio: string
): Promise<string> {
  const base = `${slugify(nombre)}-${slugify(municipio)}`;
  let slug = base;
  for (let sufijo = 2; ; sufijo++) {
    const { data } = await supabase.from("viveros").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${sufijo}`;
  }
}

export async function aprobarSolicitud(solicitudId: string): Promise<Resultado> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };

  const { data: solicitud } = await supabase
    .from("solicitudes")
    .select("*")
    .eq("id", solicitudId)
    .eq("estatus", "pendiente")
    .maybeSingle();
  if (!solicitud) return { ok: false, error: "Solicitud no encontrada o ya resuelta." };

  if (solicitud.tipo === "nuevo") {
    const datos = solicitud.datos as unknown as DatosRegistro;
    const slug = await generarSlugUnico(supabase, datos.nombre, datos.municipio);
    const { data: vivero, error: errVivero } = await supabase
      .from("viveros")
      .insert({
        slug,
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
        whatsapp: datos.whatsapp || null,
        telefono: datos.telefono || null,
        estado: datos.estado,
        municipio: datos.municipio,
        lat: datos.lat,
        lng: datos.lng,
        horarios: datos.horarios ?? {},
        fotos: datos.fotos ?? [],
        estatus: "verificado",
        owner_id: solicitud.solicitante_id,
      })
      .select("id")
      .single();
    if (errVivero) return { ok: false, error: `No se pudo crear el vivero: ${errVivero.message}` };

    if (datos.especialidades?.length) {
      const { data: catalogo } = await supabase
        .from("insignias")
        .select("id")
        .in("clave", datos.especialidades);
      if (catalogo?.length) {
        await supabase
          .from("vivero_insignias")
          .insert(catalogo.map((i) => ({ vivero_id: vivero.id, insignia_id: i.id })));
      }
    }
  } else {
    if (!solicitud.vivero_id) return { ok: false, error: "El reclamo no tiene vivero asociado." };
    const { error: errReclamo } = await supabase
      .from("viveros")
      .update({ owner_id: solicitud.solicitante_id, estatus: "verificado" })
      .eq("id", solicitud.vivero_id);
    if (errReclamo) return { ok: false, error: errReclamo.message };
  }

  await supabase
    .from("solicitudes")
    .update({ estatus: "aprobada", resuelta_at: new Date().toISOString() })
    .eq("id", solicitudId);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/");
  return { ok: true };
}

export async function rechazarSolicitud(solicitudId: string, nota: string): Promise<Resultado> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };
  if (!nota.trim()) return { ok: false, error: "Escribe el motivo del rechazo." };

  const { error } = await supabase
    .from("solicitudes")
    .update({ estatus: "rechazada", nota_admin: nota.trim(), resuelta_at: new Date().toISOString() })
    .eq("id", solicitudId)
    .eq("estatus", "pendiente");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/solicitudes");
  return { ok: true };
}

export async function activarDestacado(
  viveroId: string,
  hasta: string
): Promise<Resultado> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };

  const { data: vivero } = await supabase
    .from("viveros")
    .select("id, municipio")
    .eq("id", viveroId)
    .maybeSingle();
  if (!vivero) return { ok: false, error: "Vivero no encontrado." };

  const hoy = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("viveros")
    .select("id", { count: "exact", head: true })
    .eq("destacado_municipio", vivero.municipio)
    .gte("destacado_hasta", hoy)
    .neq("id", viveroId);
  if ((count ?? 0) >= 3) {
    return { ok: false, error: `Ya hay 3 destacados vigentes en ${vivero.municipio}.` };
  }

  const { error } = await supabase
    .from("viveros")
    .update({ destacado_hasta: hasta, destacado_municipio: vivero.municipio })
    .eq("id", viveroId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/destacados");
  revalidatePath("/");
  return { ok: true };
}

export async function quitarDestacado(viveroId: string): Promise<Resultado> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };
  const { error } = await supabase
    .from("viveros")
    .update({ destacado_hasta: null, destacado_municipio: null })
    .eq("id", viveroId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/destacados");
  return { ok: true };
}

export async function importarViveros(
  filas: FilaVivero[]
): Promise<Resultado & { insertados?: number; erroresFilas?: { linea: number; error: string }[] }> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };

  let insertados = 0;
  const erroresFilas: { linea: number; error: string }[] = [];
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    const slug = await generarSlugUnico(supabase, fila.nombre, fila.municipio);
    const { error } = await supabase.from("viveros").insert({
      slug,
      nombre: fila.nombre,
      estado: fila.estado,
      municipio: fila.municipio,
      lat: fila.lat,
      lng: fila.lng,
      telefono: fila.telefono || null,
      whatsapp: fila.whatsapp || null,
      direccion: fila.direccion || null,
      estatus: "pre-cargado",
    });
    if (error) erroresFilas.push({ linea: i + 2, error: error.message });
    else insertados++;
  }
  revalidatePath("/admin/viveros");
  return { ok: erroresFilas.length === 0, insertados, erroresFilas };
}

export async function borrarVivero(viveroId: string): Promise<Resultado> {
  const { supabase, error: errAuth } = await exigirAdmin();
  if (errAuth) return { ok: false, error: errAuth };
  const { error } = await supabase.from("viveros").delete().eq("id", viveroId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/viveros");
  return { ok: true };
}
