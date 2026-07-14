import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const EMAIL_DUENO = "test-dueno@buscaviveros.mx";
export const EMAIL_ADMIN = "test-admin@buscaviveros.mx";
export const PASSWORD_PRUEBA = "Prueba-BuscaViveros-2026!";

export function tieneServiceRole(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function clienteAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function asegurarUsuario(
  admin: SupabaseClient,
  email: string,
  rol: "dueno" | "admin"
): Promise<string> {
  const { data: lista } = await admin.auth.admin.listUsers();
  let usuario = lista?.users.find((u) => u.email === email);
  if (!usuario) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD_PRUEBA,
      email_confirm: true,
    });
    if (error) {
      // Carrera entre workers: otro spec lo creó primero — re-buscar.
      const { data: relista } = await admin.auth.admin.listUsers();
      usuario = relista?.users.find((u) => u.email === email);
      if (!usuario) throw error;
    } else {
      usuario = data.user;
    }
  }
  await admin.from("perfiles").upsert({ id: usuario!.id, rol }, { onConflict: "id" });
  return usuario!.id;
}

/** Crea (idempotente) los usuarios de prueba. Requiere SUPABASE_SERVICE_ROLE_KEY. */
export async function prepararUsuariosPrueba(): Promise<{ duenoId: string; adminId: string }> {
  const admin = clienteAdmin();
  const duenoId = await asegurarUsuario(admin, EMAIL_DUENO, "dueno");
  const adminId = await asegurarUsuario(admin, EMAIL_ADMIN, "admin");
  return { duenoId, adminId };
}
