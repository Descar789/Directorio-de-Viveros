import { Inbox } from "lucide-react";
import { crearClienteServer } from "@/lib/supabase/server";
import TarjetaSolicitud from "@/components/admin/TarjetaSolicitud";
import type { Solicitud } from "@/lib/tipos";

export default async function AdminSolicitudes() {
  const supabase = await crearClienteServer();
  const { data } = await supabase
    .from("solicitudes")
    .select("*")
    .eq("estatus", "pendiente")
    .order("created_at", { ascending: true });
  const solicitudes = (data ?? []) as Solicitud[];

  const idsReclamo = solicitudes.filter((s) => s.vivero_id).map((s) => s.vivero_id!);
  const nombres: Record<string, string> = {};
  if (idsReclamo.length > 0) {
    const { data: viveros } = await supabase
      .from("viveros")
      .select("id, nombre")
      .in("id", idsReclamo);
    for (const v of viveros ?? []) nombres[v.id] = v.nombre;
  }

  return (
    <main>
      <h1 className="font-heading text-3xl font-bold">Solicitudes pendientes</h1>
      {solicitudes.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted mx-auto" aria-hidden />
          <p className="text-muted mt-3">Sin solicitudes pendientes. Todo al día.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {solicitudes.map((s) => (
            <TarjetaSolicitud
              key={s.id}
              solicitud={s}
              nombreVivero={s.vivero_id ? nombres[s.vivero_id] : undefined}
            />
          ))}
        </div>
      )}
    </main>
  );
}
