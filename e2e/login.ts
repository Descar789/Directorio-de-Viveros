import type { BrowserContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Inicia sesión con email+password vía la API de Supabase y siembra la cookie
 * en el formato de @supabase/ssr (base64-<json>, con chunking si es larga).
 */
export async function iniciarSesion(
  context: BrowserContext,
  email: string,
  password: string
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("sin sesión");

  const ref = new URL(url).hostname.split(".")[0];
  const nombre = `sb-${ref}-auth-token`;
  const valor = `base64-${Buffer.from(JSON.stringify(data.session))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")}`;

  const MAX = 3180;
  const cookies =
    valor.length <= MAX
      ? [{ name: nombre, value: valor }]
      : Array.from({ length: Math.ceil(valor.length / MAX) }, (_, i) => ({
          name: `${nombre}.${i}`,
          value: valor.slice(i * MAX, (i + 1) * MAX),
        }));

  await context.addCookies(
    cookies.map((c) => ({
      ...c,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    }))
  );
}
