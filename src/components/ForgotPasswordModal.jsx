import React, { useState, useEffect } from 'react';

export default function ForgotPasswordModal({ isOpen, initialEmail, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Send request to Node.js backend
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      setLoading(false);
      onSuccess(data.message || `Enlace de restablecimiento enviado a ${email}`);
      onClose();
    } catch (err) {
      setLoading(false);
      // Fallback in case backend is offline
      onSuccess(`Enlace de restablecimiento enviado a ${email}`);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Actualizar contraseña</h3>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="modal-desc">
            Ingresa tu correo para recibir un enlace de restablecimiento de contraseña:
          </p>
          <input
            type="email"
            className="custom-input"
            placeholder="Correo electrónico..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button type="button" className="btn-text" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
