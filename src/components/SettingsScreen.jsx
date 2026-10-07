import React, { useState, useEffect } from 'react';

export default function SettingsScreen({
  user,
  onLogout,
  onBack,
  settings,
  onUpdateSettings,
  onUpdateUser,
  onToast,
}) {
  const [agrandarTexto, setAgrandarTexto] = useState(settings?.agrandarTexto ?? true);
  const [fontSize, setFontSize] = useState(settings?.fontSize ?? 15);
  const [coloresFuertes, setColoresFuertes] = useState(settings?.coloresFuertes ?? true);
  const [contrastLevel, setContrastLevel] = useState(settings?.contrastLevel ?? 70);

  const [name, setName] = useState(user?.nombre_completo || user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('El nombre no puede estar vacío');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('El nombre debe tener al menos 2 letras');
      return;
    }

    setNameError('');
    setIsSavingName(true);

    try {
      const email = user?.correo_electronico || user?.email;
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_electronico: email,
          nombre_completo: trimmed,
        }),
      });
      const data = await res.json();
      setIsSavingName(false);

      if (res.ok && data.user) {
        onUpdateUser?.(data.user);
        onToast?.('¡Nombre actualizado con éxito en MongoDB!');
      } else {
        const fallbackUser = { ...user, nombre_completo: trimmed };
        onUpdateUser?.(fallbackUser);
        onToast?.('¡Nombre actualizado!');
      }
    } catch (err) {
      setIsSavingName(false);
      const fallbackUser = { ...user, nombre_completo: trimmed };
      onUpdateUser?.(fallbackUser);
      onToast?.('Nombre actualizado localmente');
    }
  };

  // Sync with incoming settings prop
  useEffect(() => {
    if (settings) {
      setAgrandarTexto(settings.agrandarTexto ?? true);
      setFontSize(settings.fontSize ?? 15);
      setColoresFuertes(settings.coloresFuertes ?? true);
      setContrastLevel(settings.contrastLevel ?? 70);
    }
  }, [settings]);

  const handleToggleAgrandar = () => {
    const nextVal = !agrandarTexto;
    setAgrandarTexto(nextVal);
    onUpdateSettings?.({
      ...settings,
      agrandarTexto: nextVal,
      fontSize: fontSize || 15,
    });
  };

  const handleFontSizeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setFontSize(val);
    setAgrandarTexto(true);
    onUpdateSettings?.({
      ...settings,
      fontSize: val,
      agrandarTexto: true,
    });
  };

  const handleToggleColores = () => {
    const nextVal = !coloresFuertes;
    setColoresFuertes(nextVal);
    onUpdateSettings?.({
      ...settings,
      coloresFuertes: nextVal,
      contrastLevel: contrastLevel || 70,
    });
  };

  const handleContrastChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setContrastLevel(val);
    setColoresFuertes(true);
    onUpdateSettings?.({
      ...settings,
      contrastLevel: val,
      coloresFuertes: true,
    });
  };

  return (
    <main className="screen-content settings-screen-content" id="settingsScreen">
      {/* Header with back button and green Settings title */}
      <header className="settings-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={onBack}
          aria-label="Volver atrás"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2b7a15" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-cards-list">
        {/* Card 0: Perfil y Cambio de Nombre */}
        <div className="setting-card profile-edit-card">
          <div className="profile-edit-header">
            <div className="profile-edit-avatar">
              {user?.foto_perfil_url ? (
                <img
                  src={user.foto_perfil_url}
                  alt={user?.nombre_completo || 'Usuario'}
                  className="profile-img-circle"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="profile-avatar-emoji">👤</span>
              )}
            </div>
            <div className="profile-edit-info">
              <span className="profile-badge-google">● Cuenta Google</span>
              <p className="profile-email-text">{user?.correo_electronico || user?.email || 'cuenta@gmail.com'}</p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="profile-name-form">
            <label htmlFor="settingsUserNameInput" className="profile-input-label">
              Nombre Visible:
            </label>
            <div className="profile-input-row">
              <input
                id="settingsUserNameInput"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="profile-name-input"
                aria-label="Nombre visible del usuario"
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="profile-save-name-btn"
                aria-label="Guardar nuevo nombre"
              >
                {isSavingName ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {nameError && <p className="profile-name-error">{nameError}</p>}
          </form>
        </div>

        {/* Card 1: Agrandar Texto Header Card */}
        <div className="setting-card setting-card-main">
          <div className="setting-icon-box font-icon-bg">
            <span className="font-tt-icon">TT</span>
          </div>
          <div className="setting-text-info">
            <h2 className="setting-name">Agrandar Texto</h2>
            <p className="setting-desc">Letras más grandes</p>
          </div>
          <div className="setting-switch-wrapper">
            <button
              type="button"
              role="switch"
              aria-checked={agrandarTexto}
              className={`custom-switch ${agrandarTexto ? 'switch-on' : ''}`}
              onClick={handleToggleAgrandar}
              aria-label="Alternar Agrandar Texto"
            >
              <span className="switch-thumb"></span>
            </button>
          </div>
        </div>

        {/* Subcard 1: Font Size Slider Card */}
        <div className="setting-slider-card">
          <div className="font-slider-row">
            {/* Small font indicator */}
            <div className="font-label-left">
              <span className="font-a-letter">A</span>
              <svg className="caret-down-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Slider track with current number indicator */}
            <div className="slider-wrapper">
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="custom-range font-size-range"
                aria-label="Ajustar tamaño de letra"
              />
              <div className="slider-value-badge">{fontSize}</div>
            </div>

            {/* Large font indicator */}
            <div className="font-label-right">
              <svg className="arrow-up-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <span className="font-a-letter-large">A</span>
            </div>
          </div>
        </div>

        {/* Card 2: Colores Más Fuertes Header Card */}
        <div className="setting-card setting-card-main">
          <div className="setting-icon-box contrast-icon-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="contrast-half-svg">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1 0-16z" fill="#4a5568"/>
              <path d="M12 2a10 10 0 0 0 0 20V2z" fill="#2d3748"/>
            </svg>
          </div>
          <div className="setting-text-info">
            <h2 className="setting-name">Colores Más Fuertes</h2>
            <p className="setting-desc">Mejor contraste</p>
          </div>
          <div className="setting-switch-wrapper">
            <button
              type="button"
              role="switch"
              aria-checked={coloresFuertes}
              className={`custom-switch ${coloresFuertes ? 'switch-on' : ''}`}
              onClick={handleToggleColores}
              aria-label="Alternar Colores Más Fuertes"
            >
              <span className="switch-thumb"></span>
            </button>
          </div>
        </div>

        {/* Subcard 2: Contrast / Brightness Slider Card */}
        <div className="setting-slider-card">
          <div className="contrast-slider-row">
            {/* Outline sun icon */}
            <div className="sun-icon-left">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </div>

            {/* Range with green thumb */}
            <div className="slider-wrapper contrast-slider-wrapper">
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={contrastLevel}
                onChange={handleContrastChange}
                className="custom-range contrast-range"
                aria-label="Ajustar contraste y brillo"
              />
            </div>

            {/* Filled solid sun icon */}
            <div className="sun-icon-right">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" fill="#222"></circle>
                <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2.5"></line>
                <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2.5"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2.5"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2.5"></line>
                <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2.5"></line>
                <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2.5"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2.5"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2.5"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Cerrar Sesión Button */}
        <button
          type="button"
          id="settingsLogoutBtn"
          className="logout-action-card"
          onClick={onLogout}
          aria-label="Cerrar Sesión"
        >
          <div className="logout-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span className="logout-card-text">Cerrar Sesión</span>
        </button>
      </div>
    </main>
  );
}
