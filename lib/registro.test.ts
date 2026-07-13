import { describe, it, expect } from "vitest";
import { validarPaso, type DatosRegistro } from "./registro";

const datosOk: DatosRegistro = {
  nombre: "Vivero Test",
  estado: "Morelos",
  municipio: "Cuautla",
  lat: 18.8,
  lng: -98.95,
  whatsapp: "7351234567",
  telefono: "",
  especialidades: ["ornamental"],
  fotos: ["url"],
  descripcion: "",
  horarios: {},
};

describe("validarPaso", () => {
  it("nombre vacío falla con mensaje claro", () => {
    expect(validarPaso(1, { ...datosOk, nombre: " " })).toMatchObject({ ok: false });
    expect(validarPaso(1, { ...datosOk, nombre: " " }).error).toBeTruthy();
  });

  it("ubicación requiere estado y municipio", () => {
    expect(validarPaso(2, { ...datosOk, municipio: "" }).ok).toBe(false);
    expect(validarPaso(2, { ...datosOk, estado: "" }).ok).toBe(false);
    expect(validarPaso(2, datosOk).ok).toBe(true);
  });

  it("requiere whatsapp O teléfono, no ambos", () => {
    expect(validarPaso(3, { ...datosOk, whatsapp: "", telefono: "" }).ok).toBe(false);
    expect(validarPaso(3, { ...datosOk, whatsapp: "", telefono: "7351111111" }).ok).toBe(true);
  });

  it("normaliza whatsapp a formato 52XXXXXXXXXX", () => {
    expect(validarPaso(3, { ...datosOk, whatsapp: "735 123 4567" }).datos?.whatsapp).toBe(
      "527351234567"
    );
    expect(validarPaso(3, { ...datosOk, whatsapp: "52 735 123 4567" }).datos?.whatsapp).toBe(
      "527351234567"
    );
    expect(validarPaso(3, { ...datosOk, whatsapp: "+52 735-123-4567" }).datos?.whatsapp).toBe(
      "527351234567"
    );
  });

  it("whatsapp con menos de 10 dígitos falla", () => {
    expect(validarPaso(3, { ...datosOk, whatsapp: "12345" }).ok).toBe(false);
  });

  it("al menos una especialidad y una foto", () => {
    expect(validarPaso(4, { ...datosOk, especialidades: [] }).ok).toBe(false);
    expect(validarPaso(5, { ...datosOk, fotos: [] }).ok).toBe(false);
    expect(validarPaso(4, datosOk).ok).toBe(true);
    expect(validarPaso(5, datosOk).ok).toBe(true);
  });
});
