import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { crearClienteServer } from "@/lib/supabase/server";
import FormFicha from "@/components/panel/FormFicha";
import type { Vivero } from "@/lib/tipos";

export const metadata: Metadata = { title: "Editar mi vivero", robots: { index: false } };

export default async function PaginaEditar() {
  const supabase = await crearClienteServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/mi-vivero/editar");

  const { data: viveroData } = await supabase
    .from("viveros")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!viveroData) redirect("/mi-vivero");
  const vivero = viveroData as Vivero;

  const { data: insigniasData } = await supabase
    .from("vivero_insignias")
    .select("insignias(clave)")
    .eq("vivero_id", vivero.id);
  const especialidades = (insigniasData ?? [])
    .map((f) => (f.insignias as unknown as { clave: string } | null)?.clave)
    .filter((c): c is string => !!c);

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
      <Link href="/mi-vivero" className="min-h-11 inline-flex items-center gap-1 text-muted hover:text-primary">
        <ArrowLeft className="w-4 h-4" aria-hidden /> Mi vivero
      </Link>
      <h1 className="font-heading text-3xl font-bold mt-2">Editar mi ficha</h1>
      <div className="mt-6">
        <FormFicha vivero={vivero} especialidadesIniciales={especialidades} />
      </div>
    </main>
  );
}
