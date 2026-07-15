export type ViveroEstatus = "pre-cargado" | "pendiente" | "verificado" | "rechazado";

export interface Vivero {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  estado: string;
  municipio: string;
  direccion: string | null;
  lat: number;
  lng: number;
  horarios: Record<string, string>;
  fotos: string[];
  estatus: ViveroEstatus;
  owner_id: string | null;
  destacado_hasta: string | null;
  destacado_municipio: string | null;
  vistas: number;
  clics_whatsapp: number;
  clics_como_llegar: number;
}

export interface Insignia {
  id: number;
  clave: string;
  nombre: string;
  icono: string;
}

export interface Solicitud {
  id: string;
  tipo: "nuevo" | "reclamo";
  solicitante_id: string;
  vivero_id: string | null;
  datos: Record<string, unknown>;
  evidencia_url: string | null;
  evidencia_texto: string | null;
  estatus: "pendiente" | "aprobada" | "rechazada";
  nota_admin: string | null;
  created_at: string;
}

export interface Perfil {
  id: string;
  rol: "dueno" | "admin";
  nombre: string | null;
  whatsapp: string | null;
}

export function esDestacado(
  v: Pick<Vivero, "destacado_hasta" | "destacado_municipio" | "municipio">
): boolean {
  if (!v.destacado_hasta || v.destacado_municipio !== v.municipio) return false;
  // destacado_hasta es fecha YYYY-MM-DD (UTC); comparar como texto evita que
  // "vence hoy" caduque antes de tiempo por el huso horario local.
  const hoy = new Date().toISOString().slice(0, 10);
  return v.destacado_hasta.slice(0, 10) >= hoy;
}
