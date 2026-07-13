"use client";

import dynamic from "next/dynamic";

// Leaflet toca window al importar: solo cliente. El placeholder reserva
// la altura del contenedor para evitar CLS.
const MapaViveros = dynamic(() => import("@/components/MapaViveros"), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-2xl bg-border animate-pulse" aria-hidden />,
});

export default MapaViveros;
