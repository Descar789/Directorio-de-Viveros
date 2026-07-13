import { describe, it, expect } from "vitest";
import { parsearCsvViveros } from "./csv";

const CSV_OK = `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion
Vivero Uno,Morelos,Cuautla,18.81,-98.95,7351234567,7351234567,Calle 1
Vivero Dos,Morelos,Yautepec,18.88,-99.06,,,`;

describe("parsearCsvViveros", () => {
  it("parsea CSV válido a filas tipadas", () => {
    const { filas, errores } = parsearCsvViveros(CSV_OK);
    expect(errores).toEqual([]);
    expect(filas).toHaveLength(2);
    expect(filas[0]).toMatchObject({
      nombre: "Vivero Uno",
      estado: "Morelos",
      municipio: "Cuautla",
      lat: 18.81,
      lng: -98.95,
      telefono: "7351234567",
    });
    expect(filas[1].whatsapp).toBe("");
  });

  it("fila sin nombre reporta error con número de línea", () => {
    const csv = `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion
,Morelos,Cuautla,18.81,-98.95,,,`;
    const { filas, errores } = parsearCsvViveros(csv);
    expect(filas).toHaveLength(0);
    expect(errores).toHaveLength(1);
    expect(errores[0].linea).toBe(2);
    expect(errores[0].error).toMatch(/nombre/i);
  });

  it("lat no numérica reporta error", () => {
    const csv = `nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion
Vivero X,Morelos,Cuautla,abc,-98.95,,,`;
    const { errores } = parsearCsvViveros(csv);
    expect(errores).toHaveLength(1);
    expect(errores[0].error).toMatch(/lat/i);
  });

  it("header inválido regresa error global en línea 1", () => {
    const { errores } = parsearCsvViveros("foo,bar\n1,2");
    expect(errores[0].linea).toBe(1);
  });

  it("líneas vacías se ignoran", () => {
    const { filas, errores } = parsearCsvViveros(CSV_OK + "\n\n\n");
    expect(errores).toEqual([]);
    expect(filas).toHaveLength(2);
  });
});
