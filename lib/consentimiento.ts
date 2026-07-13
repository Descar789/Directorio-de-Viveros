export type Consentimiento = "aceptar" | "esenciales" | null;

const CLAVE = "bv-cookies";
const EVENTO = "bv-consentimiento";

export function leerConsentimiento(): Consentimiento {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "aceptar" || v === "esenciales" ? v : null;
  } catch {
    return null;
  }
}

export function guardarConsentimiento(valor: Exclude<Consentimiento, null>): void {
  try {
    localStorage.setItem(CLAVE, valor);
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: valor }));
  } catch {
    // storage bloqueado: se volverá a preguntar
  }
}

export function alCambiarConsentimiento(cb: (v: Consentimiento) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail as Consentimiento);
  window.addEventListener(EVENTO, handler);
  return () => window.removeEventListener(EVENTO, handler);
}
