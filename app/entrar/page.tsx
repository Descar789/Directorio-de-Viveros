"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Sprout, CheckCircle } from "lucide-react";
import { crearClienteBrowser } from "@/lib/supabase/client";

function FormularioEntrar() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/mi-vivero";
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrarConGoogle() {
    setError(null);
    const supabase = crearClienteBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError("No pudimos conectar con Google. Intenta de nuevo.");
  }

  async function enviarMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const supabase = crearClienteBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setCargando(false);
    if (error) {
      setError("No pudimos enviar el correo. Revisa la dirección e intenta de nuevo.");
    } else {
      setEnviado(true);
    }
  }

  if (enviado) {
    return (
      <div className="text-center" role="status">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" aria-hidden />
        <h2 className="font-heading text-xl font-semibold mt-4">Revisa tu correo</h2>
        <p className="text-muted mt-2">
          Te enviamos un enlace a <strong>{email}</strong> para entrar sin contraseña.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={entrarConGoogle}
        className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface font-semibold hover:bg-surface-soft transition-colors"
      >
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 my-6" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">o con tu correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={enviarMagicLink} className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full min-h-11 rounded-xl border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={cargando}
          className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          <Mail className="w-4 h-4" aria-hidden />
          {cargando ? "Enviando…" : "Enviarme enlace de acceso"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
}

export default function PaginaEntrar() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-surface border border-border rounded-[20px] p-8">
        <div className="text-center mb-8">
          <span className="w-12 h-12 rounded-xl bg-accent-soft inline-flex items-center justify-center">
            <Sprout className="w-6 h-6 text-primary" aria-hidden />
          </span>
          <h1 className="font-heading text-2xl font-medium mt-3">Entrar a BuscaViveros</h1>
          <p className="text-muted text-sm mt-1">
            Para registrar o administrar tu vivero
          </p>
        </div>
        <Suspense>
          <FormularioEntrar />
        </Suspense>
      </div>
    </main>
  );
}
