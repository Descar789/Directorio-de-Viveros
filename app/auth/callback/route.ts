import { crearClienteServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await crearClienteServer();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await supabase.from("perfiles").upsert({ id: data.user.id }, { onConflict: "id" });
    }
  }
  const next = searchParams.get("next") ?? "/mi-vivero";
  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/mi-vivero"}`);
}
