'use client';

import { Modal } from './Modal';

export function HowToSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} variant="sheet" labelledBy="how-title">
      <div className="sheet">
        <div className="sheet-grip" aria-hidden="true" />
        <h2 id="how-title" className="display" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
          Como jogar
        </h2>
        <ol className="stack" style={{ gap: 16 }}>
          <li className="how-step">
            <span className="n">1</span>
            <div>
              <h3>Observe a foto</h3>
              <p>Roupas, carros e prédios são as suas pistas.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="n">2</span>
            <div>
              <h3>Escolha o ano</h3>
              <p>Use a régua de 1880 a 2025.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="n">3</span>
            <div>
              <h3>Marque o lugar</h3>
              <p>Toque no mapa do Brasil.</p>
            </div>
          </li>
        </ol>
        <div className="card" style={{ margin: '20px 0' }}>
          <p style={{ fontSize: 14 }}>Até 5.000 pts por foto: metade pelo ano, metade pelo lugar.</p>
          <div className="chips-inline">
            <span className="chip perto">🟩 Perto</span>
            <span className="chip quase">🟨 Quase</span>
            <span className="chip longe">🟥 Longe</span>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Entendi
        </button>
      </div>
    </Modal>
  );
}
