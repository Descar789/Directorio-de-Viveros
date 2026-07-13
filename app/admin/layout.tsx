import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Inbox, Store, Star, Upload, LayoutDashboard } from "lucide-react";
import { crearClienteServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const SECCIONES = [
  { href: "/admin", etiqueta: "Resumen", Icono: LayoutDashboard },
  { href: "/admin/solicitudes", etiqueta: "Solicitudes", Icono: Inbox },
  { href: "/admin/viveros", etiqueta: "Viveros", Icono: Store },
  { href: "/admin/destacados", etiqueta: "Destacados", Icono: Star },
  { href: "/admin/importar", etiqueta: "Importar CSV", Icono: Upload },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/admin");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.rol !== "admin") redirect("/");

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <nav className="flex flex-wrap gap-2" aria-label="Secciones de administración">
        {SECCIONES.map(({ href, etiqueta, Icono }) => (
          <Link
            key={href}
            href={href}
            className="min-h-11 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
          >
            <Icono className="w-4 h-4" aria-hidden /> {etiqueta}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
