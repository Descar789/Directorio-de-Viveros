export interface DatosRegistro {
  nombre: string;
  estado: string;
  municipio: string;
  lat: number;
  lng: number;
  whatsapp: string;
  telefono: string;
  especialidades: string[];
  fotos: string[];
  descripcion: string;
  horarios: Record<string, string>;
}

export interface ResultadoValidacion {
  ok: boolean;
  error?: string;
  datos?: DatosRegistro;
}

export const DATOS_INICIALES: DatosRegistro = {
  nombre: "",
  estado: "",
  municipio: "",
  lat: 19.0,
  lng: -99.1,
  whatsapp: "",
  telefono: "",
  especialidades: [],
  fotos: [],
  descripcion: "",
  horarios: {},
};

/** Quita todo lo que no sea dígito y antepone 52 a números locales de 10 dígitos. */
export function normalizarTelefono(valor: string): string {
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length === 10) digitos = `52${digitos}`;
  return digitos;
}

export function validarPaso(paso: number, datos: DatosRegistro): ResultadoValidacion {
  switch (paso) {
    case 1: {
      if (!datos.nombre.trim()) {
        return { ok: false, error: "Escribe el nombre de tu vivero." };
      }
      return { ok: true, datos: { ...datos, nombre: datos.nombre.trim() } };
    }
    case 2: {
      if (!datos.estado.trim() || !datos.municipio.trim()) {
        return { ok: false, error: "Elige el estado y el municipio de tu vivero." };
      }
      if (!Number.isFinite(datos.lat) || !Number.isFinite(datos.lng)) {
        return { ok: false, error: "Coloca el pin de tu vivero en el mapa." };
      }
      return { ok: true, datos };
    }
    case 3: {
      const whatsapp = datos.whatsapp.trim() ? normalizarTelefono(datos.whatsapp) : "";
      const telefono = datos.telefono.trim() ? normalizarTelefono(datos.telefono) : "";
      if (!whatsapp && !telefono) {
        return { ok: false, error: "Necesitamos al menos tu WhatsApp o un teléfono." };
      }
      if (whatsapp && whatsapp.length < 12) {
        return { ok: false, error: "El WhatsApp debe tener 10 dígitos (más lada 52)." };
      }
      if (telefono && telefono.length < 12) {
        return { ok: false, error: "El teléfono debe tener 10 dígitos." };
      }
      return { ok: true, datos: { ...datos, whatsapp, telefono } };
    }
    case 4: {
      if (datos.especialidades.length === 0) {
        return { ok: false, error: "Elige al menos una especialidad." };
      }
      return { ok: true, datos };
    }
    case 5: {
      if (datos.fotos.length === 0) {
        return { ok: false, error: "Sube al menos una foto de tu vivero." };
      }
      return { ok: true, datos };
    }
    default:
      return { ok: true, datos };
  }
}

const CLAVE_BORRADOR = "bv-registro-borrador";

export function guardarBorrador(datos: DatosRegistro, paso: number): void {
  try {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ datos, paso }));
  } catch {
    // storage lleno o bloqueado: el borrador es mejora, no requisito
  }
}

export function cargarBorrador(): { datos: DatosRegistro; paso: number } | null {
  try {
    const crudo = localStorage.getItem(CLAVE_BORRADOR);
    if (!crudo) return null;
    const { datos, paso } = JSON.parse(crudo);
    if (!datos || typeof paso !== "number") return null;
    return { datos: { ...DATOS_INICIALES, ...datos }, paso };
  } catch {
    return null;
  }
}

export function limpiarBorrador(): void {
  try {
    localStorage.removeItem(CLAVE_BORRADOR);
  } catch {
    // sin consecuencias
  }
}

/** Redimensiona a máx 1600px por lado y comprime a JPEG 0.8 con canvas. */
export function comprimirImagen(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas no disponible"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("no se pudo comprimir"))),
        "image/jpeg",
        0.8
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen inválida"));
    };
    img.src = url;
  });
}
