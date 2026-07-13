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
  let q = supabase
    .from("viveros")
    .select("*")
    .eq("estado", estado)
    .in("estatus", ["verificado", "pre-cargado"]);
  if (municipio) q = q.eq("municipio", municipio);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return ordenarViveros(data ?? []);
}

export async function viverosCerca(lat: number, lng: number, radioKm = 25): Promise<Vivero[]> {
  const supabase = await crearClienteServer();
  const { data, error } = await supabase.rpc("buscar_cerca", {
    p_lat: lat,
    p_lng: lng,
    p_radio_km: radioKm,
  });
  if (error) throw error;
  return data ?? []; // ya viene ordenado del RPC
}

export async function buscarViveros(q: string, insignia?: string): Promise<Vivero[]> {
  const supabase = await crearClienteServer();
  let query = supabase
    .from("viveros")
    .select(insignia ? "*, vivero_insignias!inner(insignias!inner(clave))" : "*")
    .in("estatus", ["verificado", "pre-cargado"]);
  if (q) {
    const limpio = q.replace(/[%,()]/g, " ").trim();
    query = query.or(
      `nombre.ilike.%${limpio}%,municipio.ilike.%${limpio}%,estado.ilike.%${limpio}%`
    );
  }
  if (insignia) query = query.eq("vivero_insignias.insignias.clave", insignia);
  const { data, error } = await query.limit(100);
  if (error) throw error;
  return ordenarViveros((data ?? []) as unknown as Vivero[]);
}
