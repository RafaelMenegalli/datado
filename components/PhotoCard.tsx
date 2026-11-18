'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PhotoPublic } from '@/lib/types';
import { IconX, IconZoom } from './Icons';
import { Modal } from './Modal';

export const NOTICE = 'Ilustração do protótipo · no jogo: foto histórica real com fonte';

interface Props {
  photo: Pick<PhotoPublic, 'imageUrl' | 'isPrototype'>;
  /** Text printed on the date stamp, e.g. "1950" or "?? ?? ????". */
  stamp?: string;
  /** Announce stamp changes to screen readers (interactive screens only). */
  live?: boolean;
  caption?: string;
  /** Rótulo genérico ("Foto 2"). Antes do palpite nunca pode ser o nome do lugar. */
  label?: string;
  size?: 'normal' | 'compact' | 'small';
  showNotice?: boolean;
  /** Clicar na foto abre a imagem ampliada. */
  zoomable?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Proporção usada para o quadro: a foto inteira, sem cortes e sem ficar alta demais. */
const clampRatio = (r: number) => Math.min(1.9, Math.max(0.7, r));

export function PhotoCard({
  photo,
  stamp,
  live,
  caption,
  label = 'Foto histórica',
  size = 'normal',
  showNotice = true,
  zoomable = false,
  className = '',
  style,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const measure = () => {
    const el = imgRef.current;
    if (el && el.naturalWidth && el.naturalHeight) setRatio(clampRatio(el.naturalWidth / el.naturalHeight));
  };
  // Imagens que já estavam no cache podem carregar antes de o React anexar o onLoad.
  useEffect(measure, [photo.imageUrl]);

  const content = photo.isPrototype ? (
    <div className="ph" role="img" aria-label={`Foto do protótipo: ${label}`}>
      {label}
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imgRef} src={photo.imageUrl} alt={label} onLoad={measure} draggable={false} />
  );

  const frameStyle =
    size === 'normal' && ratio ? ({ '--ratio': String(ratio) } as CSSProperties) : undefined;

  return (
    <div className={`photo-card ${size} ${className}`} style={style}>
      <div className="photo-img" style={frameStyle}>
        {zoomable ? (
          <button type="button" className="photo-zoom" onClick={() => setOpen(true)} aria-label={`Ampliar ${label}`}>
            {content}
            <span className="zoom-badge" aria-hidden="true">
              <IconZoom />
            </span>
          </button>
        ) : (
          content
        )}
        {photo.isPrototype && showNotice && size !== 'small' && <span className="ph-notice">{NOTICE}</span>}
        {stamp !== undefined && (
          <div className="stamp" aria-live={live ? 'polite' : undefined} aria-atomic={live ? true : undefined}>
            {stamp}
          </div>
        )}
      </div>
      {caption && <div className="frame-caption">{caption}</div>}
      {zoomable && (
        <Modal open={open} onClose={() => setOpen(false)} variant="lightbox" labelledBy="lightbox-title">
          <LightboxBody photo={photo} label={label} onClose={() => setOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

function LightboxBody({
  photo,
  label,
  onClose,
}: {
  photo: Pick<PhotoPublic, 'imageUrl' | 'isPrototype'>;
  label: string;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="lightbox">
      <h2 id="lightbox-title" className="sr-only">
        {label} ampliada
      </h2>
      <button type="button" className="icon-btn lb-close" aria-label="Fechar imagem" onClick={onClose}>
        <IconX />
      </button>
      <div
        className={`lb-stage ${zoomed ? 'zoomed' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !zoomed) onClose();
        }}
      >
        {photo.isPrototype ? (
          <div className="ph lb-ph" role="img" aria-label={`Foto do protótipo: ${label}`}>
            {label}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="lb-img" src={photo.imageUrl} alt={label} draggable={false} onClick={() => !zoomed && setZoomed(true)} />
        )}
      </div>
      {!photo.isPrototype && (
        <button type="button" className="btn btn-secondary lb-zoom" onClick={() => setZoomed((z) => !z)}>
          <IconZoom /> {zoomed ? 'Ver a foto inteira' : 'Ampliar mais'}
        </button>
      )}
    </div>
  );
}
