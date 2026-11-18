'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { LngLatBoundsLike, Map as MlMap, Marker } from 'maplibre-gl';
import type { LatLon } from '@/lib/types';

type MapLib = typeof import('maplibre-gl');

/** Estilo vetorial gratuito (OpenStreetMap via OpenFreeMap): mostra estados, cidades e bairros conforme o zoom. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Brasil: [oeste, sul, leste, norte]. */
const BRAZIL_BOUNDS: LngLatBoundsLike = [-74.2, -33.9, -34.3, 5.4];
/** Limite do arrasto: um pouco além do Brasil, para o mapa não "fugir" do país. */
const MAX_BOUNDS: LngLatBoundsLike = [-84, -41, -25, 12];

const PIN_SVG = `<svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true" focusable="false">
  <path d="M14 1C6.8 1 1 6.8 1 13.8 1 23.5 14 35 14 35S27 23.5 27 13.8C27 6.8 21.2 1 14 1Z" fill="#FF7A1F" stroke="#16110D" stroke-width="2"/>
  <circle cx="14" cy="14" r="5" fill="#16110D"/></svg>`;

function pinElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'pin';
  el.innerHTML = PIN_SVG;
  return el;
}

function targetElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'pin-correct';
  return el;
}

interface Props {
  guess: LatLon | null;
  /** Local correto (tela de resultado). Sem `onPick`, o mapa é só de leitura. */
  correct?: LatLon | null;
  onPick?: (loc: LatLon) => void;
  className?: string;
}

export function BrazilMap({ guess, correct = null, onPick, className = '' }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<MapLib | null>(null);
  const guessMarker = useRef<Marker | null>(null);
  const correctMarker = useRef<Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const readOnly = !onPick;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Cria o mapa (só no navegador; a biblioteca é carregada sob demanda).
  useEffect(() => {
    let cancelled = false;
    let map: MlMap | null = null;
    (async () => {
      try {
        const ml = await import('maplibre-gl');
        if (cancelled || !box.current) return;
        libRef.current = ml;
        map = new ml.Map({
          container: box.current,
          style: STYLE_URL,
          bounds: BRAZIL_BOUNDS,
          fitBoundsOptions: { padding: 22 },
          maxBounds: MAX_BOUNDS,
          maxZoom: 13,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
        map.on('error', (e) => {
          // Falha de rede em um tile não derruba o jogo; só avisa se o estilo inteiro não carregar.
          if (!map?.isStyleLoaded() && !map?.loaded()) console.warn('[datado] mapa', e.error?.message);
        });
        map.on('load', () => {
          // Atribuição obrigatória, mas recolhida (botão "i") para não cobrir o mapa.
          box.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
          box.current?.querySelector('.maplibregl-ctrl-attrib')?.removeAttribute('open');
          map!.addSource('link', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map!.addLayer({
            id: 'link-line',
            type: 'line',
            source: 'link',
            paint: { 'line-color': '#16110D', 'line-width': 2.5, 'line-dasharray': [1.5, 1.5] },
          });
          mapRef.current = map;
          setReady(true);
        });
        map.on('click', (e) => {
          const target = e.originalEvent.target as HTMLElement | null;
          if (target?.closest('.pin, .pin-correct')) return; // clique no próprio pino
          onPickRef.current?.({ lat: e.lngLat.lat, lon: e.lngLat.lng });
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      guessMarker.current?.remove();
      correctMarker.current?.remove();
      guessMarker.current = null;
      correctMarker.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  // Pinos, linha e enquadramento.
  useEffect(() => {
    const map = mapRef.current;
    const ml = libRef.current;
    if (!ready || !map || !ml) return;

    if (guess) {
      if (!guessMarker.current) {
        const m = new ml.Marker({ element: pinElement(), anchor: 'bottom', draggable: !readOnly });
        m.on('dragend', () => {
          const ll = m.getLngLat();
          onPickRef.current?.({ lat: ll.lat, lon: ll.lng });
        });
        m.setLngLat([guess.lon, guess.lat]).addTo(map);
        guessMarker.current = m;
      } else {
        guessMarker.current.setLngLat([guess.lon, guess.lat]);
      }
    } else {
      guessMarker.current?.remove();
      guessMarker.current = null;
    }

    if (correct) {
      if (!correctMarker.current) {
        correctMarker.current = new ml.Marker({ element: targetElement(), anchor: 'center' })
          .setLngLat([correct.lon, correct.lat])
          .addTo(map);
      }
    } else {
      correctMarker.current?.remove();
      correctMarker.current = null;
    }

    const src = map.getSource('link') as import('maplibre-gl').GeoJSONSource | undefined;
    src?.setData({
      type: 'FeatureCollection',
      features:
        guess && correct
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [guess.lon, guess.lat],
                    [correct.lon, correct.lat],
                  ],
                },
              },
            ]
          : [],
    });
  }, [ready, guess?.lat, guess?.lon, correct?.lat, correct?.lon, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Na tela de resultado, enquadra o palpite e o local correto.
  useEffect(() => {
    const map = mapRef.current;
    const ml = libRef.current;
    if (!ready || !map || !ml || !guess || !correct) return;
    const b = new ml.LngLatBounds([guess.lon, guess.lat], [guess.lon, guess.lat]).extend([correct.lon, correct.lat]);
    map.fitBounds(b, { padding: { top: 70, bottom: 56, left: 48, right: 48 }, maxZoom: 9, duration: 600 });
  }, [ready, correct?.lat, correct?.lon]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Alternativa de teclado ao toque: marca o centro do mapa (as setas movem o mapa). */
  const markCenter = () => {
    const c = mapRef.current?.getCenter();
    if (c) onPick?.({ lat: c.lat, lon: c.lng });
  };

  return (
    <div className={`map-wrap ${readOnly ? 'static' : ''} ${className}`}>
      <div
        ref={box}
        className="map-canvas"
        role="application"
        aria-label={
          readOnly
            ? 'Mapa do Brasil com o seu palpite e o local correto'
            : 'Mapa do Brasil. Toque para marcar o lugar. Use + e − ou o gesto de pinça para dar zoom.'
        }
      />
      {!ready && !failed && <div className="map-status">Carregando o mapa…</div>}
      {failed && <div className="map-status">Não foi possível carregar o mapa. Confira a conexão e recarregue a página.</div>}
      {!readOnly && ready && (
        <button type="button" className="map-center-btn" onClick={markCenter}>
          Marcar o centro do mapa
        </button>
      )}
    </div>
  );
}
