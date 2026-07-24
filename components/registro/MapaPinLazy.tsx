"use client";

import dynamic from "next/dynamic";

const MapaPin = dynamic(() => import("@/components/registro/MapaPin"), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-lg bg-border animate-pulse" aria-hidden />,
});

export default MapaPin;
