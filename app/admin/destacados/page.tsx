import { crearClienteServer } from "@/lib/supabase/server";
import PanelDestacados from "@/components/admin/PanelDestacados";
import type { Vivero } from "@/lib/tipos";

export default async function AdminDestacados() {
  const supabase = await crearClienteServer();
  const hoy = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("viveros")
    .select("*")
    .gte("destacado_hasta", hoy)
    .order("destacado_hasta", { ascending: true });

  return (
    <main>
      <h1 className="font-heading text-3xl font-bold">Destacados</h1>
      <p className="text-muted mt-1">Máximo 3 vigentes por municipio. $99/mes cada uno.</p>
      <div className="mt-6">
        <PanelDestacados vigentes={(data ?? []) as Vivero[]} />
      </div>
    </main>
  );
}
