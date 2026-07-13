import type { MetadataRoute } from "next";
import { crearClientePublico } from "@/lib/supabase/publico";
import { ESTADOS, slugify } from "@/lib/zonas";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = crearClientePublico();
  const { data } = await supabase
    .from("viveros")
    .select("slug, estado, municipio, updated_at")
    .in("estatus", ["verificado", "pre-cargado"]);
  const viveros = data ?? [];

  const estaticas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/registro`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const estadosConViveros = new Set(viveros.map((v) => slugify(v.estado)));
  const estados: MetadataRoute.Sitemap = ESTADOS.filter((e) =>
    estadosConViveros.has(e.slug)
  ).map((e) => ({
    url: `${base}/viveros/${e.slug}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const municipios: MetadataRoute.Sitemap = [
    ...new Set(viveros.map((v) => `${slugify(v.estado)}/${slugify(v.municipio)}`)),
  ].map((ruta) => ({
    url: `${base}/viveros/${ruta}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const fichas: MetadataRoute.Sitemap = viveros.map((v) => ({
    url: `${base}/vivero/${v.slug}`,
    lastModified: v.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...estaticas, ...estados, ...municipios, ...fichas];
}
