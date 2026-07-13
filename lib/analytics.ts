declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type EventoAnalytics =
  | "busqueda"
  | "clic_whatsapp"
  | "registro_iniciado"
  | "registro_completado";

/** No-op silencioso si no hay GA/Pixel cargados — la app nunca truena por analytics. */
export function track(evento: EventoAnalytics, props: Record<string, unknown> = {}): void {
  try {
    window.gtag?.("event", evento, props);
    window.fbq?.("trackCustom", evento, props);
  } catch {
    // nunca romper la página por medición
  }
}
