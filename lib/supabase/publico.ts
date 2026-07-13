import { createClient } from "@supabase/supabase-js";

// Cliente sin cookies para lecturas públicas en páginas ISR/estáticas.
// Usar crearClienteServer cuando la consulta dependa de la sesión.
export function crearClientePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
