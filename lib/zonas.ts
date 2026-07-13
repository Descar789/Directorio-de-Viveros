export interface Estado {
  slug: string;
  nombre: string;
}

export const ESTADOS: Estado[] = [
  { slug: "aguascalientes", nombre: "Aguascalientes" },
  { slug: "baja-california", nombre: "Baja California" },
  { slug: "baja-california-sur", nombre: "Baja California Sur" },
  { slug: "campeche", nombre: "Campeche" },
  { slug: "chiapas", nombre: "Chiapas" },
  { slug: "chihuahua", nombre: "Chihuahua" },
  { slug: "ciudad-de-mexico", nombre: "Ciudad de México" },
  { slug: "coahuila", nombre: "Coahuila" },
  { slug: "colima", nombre: "Colima" },
  { slug: "durango", nombre: "Durango" },
  { slug: "estado-de-mexico", nombre: "Estado de México" },
  { slug: "guanajuato", nombre: "Guanajuato" },
  { slug: "guerrero", nombre: "Guerrero" },
  { slug: "hidalgo", nombre: "Hidalgo" },
  { slug: "jalisco", nombre: "Jalisco" },
  { slug: "michoacan", nombre: "Michoacán" },
  { slug: "morelos", nombre: "Morelos" },
  { slug: "nayarit", nombre: "Nayarit" },
  { slug: "nuevo-leon", nombre: "Nuevo León" },
  { slug: "oaxaca", nombre: "Oaxaca" },
  { slug: "puebla", nombre: "Puebla" },
  { slug: "queretaro", nombre: "Querétaro" },
  { slug: "quintana-roo", nombre: "Quintana Roo" },
  { slug: "san-luis-potosi", nombre: "San Luis Potosí" },
  { slug: "sinaloa", nombre: "Sinaloa" },
  { slug: "sonora", nombre: "Sonora" },
  { slug: "tabasco", nombre: "Tabasco" },
  { slug: "tamaulipas", nombre: "Tamaulipas" },
  { slug: "tlaxcala", nombre: "Tlaxcala" },
  { slug: "veracruz", nombre: "Veracruz" },
  { slug: "yucatan", nombre: "Yucatán" },
  { slug: "zacatecas", nombre: "Zacatecas" },
];

/** Estados donde arranca la pre-carga piloto (footer, home). */
export const ESTADOS_PILOTO = ["morelos", "estado-de-mexico", "ciudad-de-mexico", "puebla"];

export function slugAEstado(slug: string): Estado | undefined {
  return ESTADOS.find((e) => e.slug === slug);
}

/** minúsculas, sin acentos, espacios → guiones. Para slugs de viveros y municipios. */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** guiones → espacios, capitaliza cada palabra. Para mostrar params de URL. */
export function desSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 2 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}
