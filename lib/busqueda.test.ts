import { describe, it, expect } from "vitest";
import { ordenarViveros } from "./busqueda";
import { esDestacado, type Vivero } from "./tipos";

const base: Partial<Vivero> = { municipio: "Cuautla", estado: "Morelos" };
const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function v(p: Partial<Vivero>): Vivero {
  return { ...base, ...p } as Vivero;
}

describe("ordenarViveros", () => {
  it("destacado vigente primero, luego verificado, luego pre-cargado", () => {
    const lista = [
      v({ nombre: "pre", estatus: "pre-cargado", destacado_hasta: null }),
      v({ nombre: "ver", estatus: "verificado", destacado_hasta: null }),
      v({ nombre: "dest", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista).map((x) => x.nombre)).toEqual(["dest", "ver", "pre"]);
  });

  it("destacado vencido cuenta como su estatus normal", () => {
    const lista = [
      v({ nombre: "vencido", estatus: "verificado", destacado_hasta: ayer, destacado_municipio: "Cuautla" }),
      v({ nombre: "vigente", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista)[0].nombre).toBe("vigente");
  });

  it("destacado de otro municipio no aplica", () => {
    const lista = [
      v({ nombre: "otro", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Yautepec" }),
      v({ nombre: "local", estatus: "verificado", destacado_hasta: manana, destacado_municipio: "Cuautla" }),
    ];
    expect(ordenarViveros(lista)[0].nombre).toBe("local");
  });

  it("orden estable entre iguales", () => {
    const lista = [
      v({ nombre: "a", estatus: "verificado", destacado_hasta: null }),
      v({ nombre: "b", estatus: "verificado", destacado_hasta: null }),
    ];
    expect(ordenarViveros(lista).map((x) => x.nombre)).toEqual(["a", "b"]);
  });
});

describe("esDestacado", () => {
  it("true solo con fecha vigente y mismo municipio", () => {
    expect(esDestacado(v({ destacado_hasta: manana, destacado_municipio: "Cuautla" }))).toBe(true);
    expect(esDestacado(v({ destacado_hasta: ayer, destacado_municipio: "Cuautla" }))).toBe(false);
    expect(esDestacado(v({ destacado_hasta: manana, destacado_municipio: "Yautepec" }))).toBe(false);
    expect(esDestacado(v({ destacado_hasta: null, destacado_municipio: null }))).toBe(false);
  });

  it("vence hoy sigue vigente", () => {
    const hoy = new Date().toISOString().slice(0, 10);
    expect(esDestacado(v({ destacado_hasta: hoy, destacado_municipio: "Cuautla" }))).toBe(true);
  });
});
