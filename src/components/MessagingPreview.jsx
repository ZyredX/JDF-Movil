import React from 'react';

export default function MessagingPreview({ user, onLogout }) {
  const userName = user?.nombre_completo || user?.name || 'María González';
  const userEmail = user?.correo_electronico || user?.email || 'maria.gonzalez@gmail.com';
  const userPhoto = user?.foto_perfil_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
  const accesibilidad = user?.configuracion_accesibilidad || { tamano_texto: 'grande', nivel_saturacion: 'alta' };

  return (
    <section className="screen-content logged-in-screen" id="welcomeScreen">
      <div className="success-header">
        <span className="tech-badge">⚡ Sesión Relacional + MongoDB</span>
        <div className="status-badge">● En línea con Google</div>
        
        {/* User Profile Card */}
        <div className="profile-badge-card">
          <img
            src={userPhoto}
            alt={`Foto de ${userName}`}
            className="user-avatar-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h2 className="welcome-title">{userName}</h2>
            <p className="user-email-subtitle">{userEmail}</p>
          </div>
        </div>

        <div className="accessibility-pill-group">
          <span className="pill-item">👁️ Texto: {accesibilidad.tamano_texto}</span>
          <span className="pill-item">🎨 Contraste: {accesibilidad.nivel_saturacion}</span>
        </div>
      </div>

      <div className="mock-messages-card">
        <div className="mock-header">
          <span className="chat-icon">💬</span>
          <h3>Mensajería para Adultos Mayores</h3>
        </div>
        <p className="mock-info">
          Sesión iniciada con éxito. Ya puedes comunicarte por notas de voz o mensajes con tus contactos familiares.
        </p>
        <div className="mock-chat-bubble">
          <div className="bubble-sender">Carlos (Hijo)</div>
          <div className="bubble-text">
            ¡Hola mamá! ¿Cómo estás? Te dejé un mensaje de voz si prefieres escucharme.
          </div>
          <div className="bubble-time">10:15 AM</div>
        </div>
      </div>

      <button type="button" id="logoutBtn" className="btn-secondary" onClick={onLogout}>
        Cerrar sesión
      </button>
    </section>
  );
}
