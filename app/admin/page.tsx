import Link from "next/link";
import { crearClienteServer } from "@/lib/supabase/server";

export default async function AdminResumen() {
  const supabase = await crearClienteServer();
  const hoy = new Date().toISOString().slice(0, 10);
  const [pendientes, publicados, destacados] = await Promise.all([
    supabase
      .from("solicitudes")
      .select("id", { count: "exact", head: true })
      .eq("estatus", "pendiente"),
    supabase
      .from("viveros")
      .select("id", { count: "exact", head: true })
      .in("estatus", ["verificado", "pre-cargado"]),
    supabase
      .from("viveros")
      .select("id", { count: "exact", head: true })
      .gte("destacado_hasta", hoy),
  ]);

  const tarjetas = [
    { etiqueta: "Solicitudes pendientes", valor: pendientes.count ?? 0, href: "/admin/solicitudes" },
    { etiqueta: "Viveros publicados", valor: publicados.count ?? 0, href: "/admin/viveros" },
    { etiqueta: "Destacados vigentes", valor: destacados.count ?? 0, href: "/admin/destacados" },
  ];

  return (
    <main>
      <h1 className="font-heading text-3xl font-bold">Resumen</h1>
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {tarjetas.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-colors"
          >
            <p className="font-heading text-4xl font-bold">{t.valor}</p>
            <p className="text-muted mt-1">{t.etiqueta}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
