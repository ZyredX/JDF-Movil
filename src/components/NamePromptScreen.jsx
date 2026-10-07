import React, { useState } from 'react';

export default function NamePromptScreen({ initialName, userEmail, userPhoto, onConfirmName, onBackToLogin }) {
  const [name, setName] = useState(initialName || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor, ingresa tu nombre para continuar.');
      return;
    }
    if (trimmed.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmName(trimmed);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <main className="screen-content name-prompt-screen" id="namePromptScreen">
      {/* Top connected Google banner */}
      <div className="google-session-pill">
        <div className="google-pill-avatar">
          {userPhoto ? (
            <img src={userPhoto} alt="Google Avatar" className="pill-img" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span className="pill-avatar-fallback">👤</span>
          )}
        </div>
        <div className="google-pill-text">
          <span className="google-pill-status">● Conectado con Google</span>
          <span className="google-pill-email">{userEmail || 'cuenta@gmail.com'}</span>
        </div>
      </div>

      {/* Main question card */}
      <section className="name-prompt-card">
        <div className="name-prompt-header">
          <div className="name-icon-bubble">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 className="name-prompt-title">¿Cuál es tu nombre?</h1>
          <p className="name-prompt-subtitle">
            Escribe cómo te gustaría que te reconozcan tus familiares y contactos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="name-form">
          <div className="name-input-container">
            <label htmlFor="userNameInput" className="name-input-label">
              Tu Nombre Completo o Apodo
            </label>
            <div className="name-input-wrapper">
              <input
                type="text"
                id="userNameInput"
                className={`name-text-input ${error ? 'input-has-error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej. María González"
                autoFocus
                maxLength={40}
              />
              {name.length > 0 && (
                <button
                  type="button"
                  className="clear-input-btn"
                  onClick={() => setName('')}
                  aria-label="Borrar texto"
                >
                  ✕
                </button>
              )}
            </div>
            {error && <p className="name-error-text" role="alert">{error}</p>}
          </div>

          <div className="name-quick-suggestions">
            <span className="quick-label">Sugerencias rápidas:</span>
            <div className="quick-tags">
              {['María', 'Abuelita María', 'Mamá María'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="quick-tag-btn"
                  onClick={() => {
                    setName(sug);
                    if (error) setError('');
                  }}
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="saveNameBtn"
            className="btn-primary name-submit-btn"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <span>Continuar a Ajustes</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </>
            )}
          </button>
        </form>
      </section>

      <div className="spacer"></div>

      <button
        type="button"
        className="btn-link-subtle"
        onClick={onBackToLogin}
      >
        ← Volver al inicio
      </button>
    </main>
  );
}
