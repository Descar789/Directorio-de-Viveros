"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import type { Vivero } from "@/lib/tipos";

const icono = L.divIcon({
  className: "",
  html: `<div style="background:#15803D;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function MapaViveros({
  viveros,
  centro = [19.0, -99.1],
  zoom = 8,
}: {
  viveros: Vivero[];
  centro?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={centro}
      zoom={zoom}
      className="h-full w-full rounded-2xl"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {viveros.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={icono}>
          <Popup>
            <Link href={`/vivero/${v.slug}`}>{v.nombre}</Link>
            <br />
            {v.municipio}, {v.estado}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
