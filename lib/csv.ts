export interface FilaVivero {
  nombre: string;
  estado: string;
  municipio: string;
  lat: number;
  lng: number;
  telefono: string;
  whatsapp: string;
  direccion: string;
}

export interface ErrorFila {
  linea: number;
  error: string;
}

const COLUMNAS = [
  "nombre",
  "estado",
  "municipio",
  "lat",
  "lng",
  "telefono",
  "whatsapp",
  "direccion",
] as const;

export function parsearCsvViveros(texto: string): {
  filas: FilaVivero[];
  errores: ErrorFila[];
} {
  const lineas = texto.split(/\r?\n/);
  const filas: FilaVivero[] = [];
  const errores: ErrorFila[] = [];

  const header = (lineas[0] ?? "").split(",").map((c) => c.trim().toLowerCase());
  const headerValido =
    header.length === COLUMNAS.length && COLUMNAS.every((c, i) => header[i] === c);
  if (!headerValido) {
    return {
      filas: [],
      errores: [
        { linea: 1, error: `El encabezado debe ser exactamente: ${COLUMNAS.join(",")}` },
      ],
    };
  }

  for (let i = 1; i < lineas.length; i++) {
    const cruda = lineas[i];
    if (!cruda.trim()) continue;
    const numeroLinea = i + 1;
    const celdas = cruda.split(",").map((c) => c.trim());
    if (celdas.length < 5) {
      errores.push({ linea: numeroLinea, error: "Faltan columnas en la fila." });
      continue;
    }
    const [nombre, estado, municipio, latCrudo, lngCrudo, telefono = "", whatsapp = "", direccion = ""] = celdas;
    if (!nombre) {
      errores.push({ linea: numeroLinea, error: "El nombre no puede estar vacío." });
      continue;
    }
    if (!estado || !municipio) {
      errores.push({ linea: numeroLinea, error: "Estado y municipio son obligatorios." });
      continue;
    }
    const lat = Number(latCrudo);
    const lng = Number(lngCrudo);
    if (!latCrudo || Number.isNaN(lat) || lat < 14 || lat > 33) {
      errores.push({ linea: numeroLinea, error: "lat debe ser numérica y estar dentro de México." });
      continue;
    }
    if (!lngCrudo || Number.isNaN(lng) || lng < -119 || lng > -86) {
      errores.push({ linea: numeroLinea, error: "lng debe ser numérica y estar dentro de México." });
      continue;
    }
    filas.push({ nombre, estado, municipio, lat, lng, telefono, whatsapp, direccion });
  }

  return { filas, errores };
}
