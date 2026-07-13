import { test, expect } from "@playwright/test";
import {
  tieneServiceRole,
  prepararUsuariosPrueba,
  clienteAdmin,
  EMAIL_ADMIN,
  PASSWORD_PRUEBA,
} from "./setup";
import { iniciarSesion } from "./login";

test.describe("moderación admin", () => {
  test.skip(!tieneServiceRole(), "Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local");

  test("aprobar solicitud publica la ficha", async ({ context, page }) => {
    const { duenoId } = await prepararUsuariosPrueba();
    const admin = clienteAdmin();

    // Solicitud sintética independiente del spec de registro
    const nombre = `Vivero Admin E2E ${Date.now()}`;
    await admin.from("solicitudes").insert({
      tipo: "nuevo",
      solicitante_id: duenoId,
      datos: {
        nombre,
        estado: "Morelos",
        municipio: "Cuautla",
        lat: 18.81,
        lng: -98.95,
        whatsapp: "527359876543",
        telefono: "",
        especialidades: ["ornamental"],
        fotos: [],
        descripcion: "",
        horarios: {},
      },
    });

    await iniciarSesion(context, EMAIL_ADMIN, PASSWORD_PRUEBA);
    await page.goto("/admin/solicitudes");
    await expect(page.getByText(nombre)).toBeVisible();

    const tarjeta = page.locator("article", { hasText: nombre });
    await tarjeta.getByRole("button", { name: "Aprobar" }).click();
    await expect(page.getByText(nombre)).not.toBeVisible({ timeout: 15000 });

    const { data: vivero } = await admin
      .from("viveros")
      .select("slug, estatus, owner_id")
      .eq("nombre", nombre)
      .single();
    expect(vivero?.estatus).toBe("verificado");
    expect(vivero?.owner_id).toBe(duenoId);

    await page.goto(`/vivero/${vivero!.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(nombre);
  });
});
