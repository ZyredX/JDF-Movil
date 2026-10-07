import React, { useState } from 'react';

export default function HelpModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestHelp = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/request-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inicio de sesión' }),
      });
      const data = await response.json();
      setLoading(false);
      onSuccess(data.message || 'Un asesor de soporte te contactará en breve');
      onClose();
    } catch (err) {
      setLoading(false);
      onSuccess('Un asesor de soporte te contactará en breve');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Centro de Ayuda y Soporte</h3>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">
            ¿Necesitas ayuda con el inicio de sesión o con el envío de mensajes? Contáctanos:
          </p>
          <div className="support-channels">
            <div className="support-item">
              <span className="support-icon">📞</span>
              <div>
                <strong>Línea Telefónica Directa</strong>
                <p>0800-800-AYUDA (29832)</p>
              </div>
            </div>
            <div className="support-item">
              <span className="support-icon">✉️</span>
              <div>
                <strong>Correo de Soporte</strong>
                <p>soporte@mensajeria-app.com</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleRequestHelp}
            disabled={loading}
          >
            {loading ? 'Solicitando...' : 'Solicitar contacto inmediato'}
          </button>
        </div>
      </div>
    </div>
  );
}
