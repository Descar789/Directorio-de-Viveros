import { crearClientePublico } from "@/lib/supabase/publico";
import { NextResponse } from "next/server";

const METRICAS = new Set(["vistas", "clics_whatsapp", "clics_como_llegar"]);

export async function POST(request: Request) {
  let cuerpo: { viveroId?: unknown; metrica?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }
  const { viveroId, metrica } = cuerpo;
  if (typeof metrica !== "string" || !METRICAS.has(metrica) || typeof viveroId !== "string") {
    return NextResponse.json({ error: "métrica inválida" }, { status: 400 });
  }
  const supabase = crearClientePublico();
  await supabase.rpc("incrementar_metrica", { p_vivero_id: viveroId, p_metrica: metrica });
  return NextResponse.json({ ok: true });
}
