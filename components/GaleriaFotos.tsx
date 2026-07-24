"use client";

import { useState } from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";

export default function GaleriaFotos({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="h-64 lg:h-96 rounded-lg bg-surface-soft border border-border flex items-center justify-center">
        <Leaf className="w-16 h-16 text-primary/40" aria-hidden />
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden bg-surface-soft">
        <Image
          src={fotos[activa]}
          alt={`${nombre} — foto ${activa + 1} de ${fotos.length}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>
      {fotos.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1" role="tablist" aria-label="Fotos">
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={i === activa}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setActiva(i)}
              className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border-2 ${
                i === activa ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={f} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
