// Corre Lighthouse (SEO + performance) contra una URL usando el Chromium de
// Playwright. userDataDir propio para evitar el EPERM de chrome-launcher en
// Windows al borrar su perfil temporal.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const url = process.argv[2] ?? "http://localhost:3000";
const dirPerfil = fs.mkdtempSync(path.join(os.tmpdir(), "lh-perfil-"));

const chrome = await launch({
  chromePath: process.env.CHROME_PATH,
  userDataDir: dirPerfil,
  chromeFlags: ["--headless=new"],
});

try {
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    onlyCategories: ["seo", "performance"],
    output: "json",
  });
  console.log("SEO:", Math.round(lhr.categories.seo.score * 100));
  console.log("Perf:", Math.round(lhr.categories.performance.score * 100));
  console.log("CLS:", lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3));
  process.exitCode = lhr.categories.seo.score * 100 >= 90 ? 0 : 1;
} finally {
  chrome.kill();
}
