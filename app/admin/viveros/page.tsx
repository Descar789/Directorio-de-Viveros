import { crearClienteServer } from "@/lib/supabase/server";
import TablaViveros from "@/components/admin/TablaViveros";
import type { Vivero } from "@/lib/tipos";

export default async function AdminViveros() {
  const supabase = await crearClienteServer();
  const { data } = await supabase
    .from("viveros")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <main>
      <h1 className="font-heading text-3xl font-bold">Viveros</h1>
      <div className="mt-6">
        <TablaViveros viveros={(data ?? []) as Vivero[]} />
      </div>
    </main>
  );
}
