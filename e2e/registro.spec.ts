import { test, expect } from "@playwright/test";
import {
  tieneServiceRole,
  prepararUsuariosPrueba,
  clienteAdmin,
  EMAIL_DUENO,
  PASSWORD_PRUEBA,
} from "./setup";
import { iniciarSesion } from "./login";

// PNG rojo de 1x1 para el paso de fotos
const PNG_MINIMO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("wizard de registro", () => {
  test.skip(!tieneServiceRole(), "Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local");

  test("flujo completo crea solicitud", async ({ context, page }) => {
    const { duenoId } = await prepararUsuariosPrueba();
    const admin = clienteAdmin();
    await admin.from("solicitudes").delete().eq("solicitante_id", duenoId);

    await iniciarSesion(context, EMAIL_DUENO, PASSWORD_PRUEBA);
    await page.goto("/registro");

    await page.getByRole("button", { name: /Registrar mi vivero/ }).click();

    // Paso 1: nombre
    await page.getByLabel("Nombre del vivero").fill("Vivero E2E Playwright");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Paso 2: ubicación
    await page.getByLabel("Estado", { exact: true }).selectOption("Morelos");
    await page.getByLabel("Municipio", { exact: true }).fill("Cuautla");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Paso 3: contacto
    await page.getByLabel("WhatsApp", { exact: false }).first().fill("735 987 6543");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Paso 4: especialidades
    await page.getByRole("button", { name: /Ornamental/ }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Paso 5: fotos
    await page.setInputFiles('input[type="file"]', {
      name: "foto.png",
      mimeType: "image/png",
      buffer: PNG_MINIMO,
    });
    await expect(page.locator('img[alt="Foto 1"]')).toBeVisible({ timeout: 20000 });
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Paso 6: revisión y envío
    await expect(page.getByText("Revisa tu información")).toBeVisible();
    await page.getByRole("button", { name: "Enviar solicitud" }).click();

    await expect(page.getByText("Tu vivero está en revisión")).toBeVisible({ timeout: 15000 });

    const { data: solicitudes } = await admin
      .from("solicitudes")
      .select("*")
      .eq("solicitante_id", duenoId)
      .eq("estatus", "pendiente");
    expect(solicitudes?.length).toBe(1);
    expect((solicitudes![0].datos as { nombre?: string }).nombre).toBe("Vivero E2E Playwright");
  });
});
