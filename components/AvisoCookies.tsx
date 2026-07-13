"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { leerConsentimiento, guardarConsentimiento } from "@/lib/consentimiento";

export default function AvisoCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(leerConsentimiento() === null);
  }, []);

  if (!visible) return null;

  function elegir(valor: "aceptar" | "esenciales") {
    guardarConsentimiento(valor);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          <Cookie className="w-4 h-4 inline text-primary mr-1" aria-hidden />
          Usamos cookies esenciales para que el sitio funcione y, si aceptas, cookies de
          publicidad de Google para mantener el directorio gratuito.{" "}
          <Link href="/privacidad" className="underline hover:text-primary">
            Más información
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => elegir("esenciales")}
            className="min-h-11 px-4 rounded-xl border border-border font-semibold text-sm hover:border-primary"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => elegir("aceptar")}
            className="min-h-11 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-dark"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
