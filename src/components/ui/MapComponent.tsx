"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState(-44.2096); // Longitude for UEMA (approx)
  const [lat] = useState(-2.5797); // Latitude for UEMA (approx)
  const [zoom] = useState(15);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json', // Free demo style
        center: [lng, lat],
        zoom: zoom
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      new maplibregl.Marker({ color: "#FF0000" })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setHTML("<h3>LAPS - UEMA</h3><p>Laboratório de Aquisição e Processamento de Sinais</p>"))
        .addTo(map.current);
    }
  }, [lng, lat, zoom]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg border">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}
