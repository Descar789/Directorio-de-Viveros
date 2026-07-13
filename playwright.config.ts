import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Carga .env.local para que los helpers de e2e (setup/login) vean las claves.
try {
  const contenido = readFileSync(join(__dirname, ".env.local"), "utf-8");
  for (const linea of contenido.split(/\r?\n/)) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  // sin .env.local: los specs que lo requieren se saltan solos
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
