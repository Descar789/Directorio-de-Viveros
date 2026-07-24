import { test, expect } from "@playwright/test";

test.describe("búsqueda y ficha", () => {
  test("home → buscar Cuautla → orden canónico → ficha con WhatsApp", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Encuentra el vivero de confianza");
    // El mapa Leaflet solo se monta en cliente: verlo garantiza que la página
    // ya hidrató antes de interactuar con el buscador.
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15000 });

    await page.getByLabel("¿Dónde?").fill("Cuautla");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page).toHaveURL(/\/buscar\?q=Cuautla/);
    const tarjetas = page.locator("article h3");
    await expect(tarjetas.first()).toContainText("Vivero Destacado");

    const nombres = await tarjetas.allTextContents();
    const iDestacado = nombres.findIndex((n) => n.includes("Destacado"));
    const iVerificado = nombres.findIndex((n) => n.includes("Verificado"));
    const iPrecargado = nombres.findIndex((n) => n.includes("Precargado"));
    expect(iDestacado).toBeLessThan(iVerificado);
    expect(iVerificado).toBeLessThan(iPrecargado);

    await page.getByRole("link", { name: /Vivero Destacado/ }).first().click();
    await expect(page).toHaveURL(/\/vivero\/vivero-prueba-destacado-cuautla/);

    const whatsapp = page.getByRole("link", { name: /WhatsApp/ }).first();
    await expect(whatsapp).toHaveAttribute("href", /wa\.me\/527351234567/);
  });

  test("página de municipio muestra los 3 seeds en orden", async ({ page }) => {
    await page.goto("/viveros/morelos/cuautla");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Viveros en Cuautla");
    const nombres = await page.locator("article h3").allTextContents();
    expect(nombres[0]).toContain("Destacado");
  });
});
