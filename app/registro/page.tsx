import type { Metadata } from "next";
import Wizard from "@/components/registro/Wizard";

export const metadata: Metadata = {
  title: "Registra tu vivero gratis",
  description:
    "Aparece en el directorio de viveros más completo de México y recibe clientes por WhatsApp. Registro gratuito en 5 minutos.",
};

type Props = { searchParams: Promise<{ reclamar?: string }> };

export default async function PaginaRegistro({ searchParams }: Props) {
  const { reclamar } = await searchParams;
  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 w-full">
      <Wizard slugReclamo={reclamar} />
    </main>
  );
}
