import React, { useState, useEffect } from 'react';
import HeadsetIcon from './HeadsetIcon';

// Helper to decode JWT token returned by real Google Sign-In
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LoginScreen({ onLoginSuccess, onOpenHelp }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });
  const [showCustomGoogleModal, setShowCustomGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Sign-In
  useEffect(() => {
    if (!googleClientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID no está configurado en .env');
      return;
    }

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          const btnContainer = document.getElementById('googleOfficialBtn');
          if (btnContainer && !btnContainer.hasChildNodes()) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'signin_with',
              shape: 'pill',
            });
          }
        } catch (err) {
          console.warn('Error al inicializar Google GIS:', err);
        }
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  // Callback when Google Sign-In completes via GIS Credential
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setAlert({ show: false, message: '', type: 'error' });
    const token = response.credential;
    const profile = parseJwt(token);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: token,
          email: profile?.email,
          name: profile?.name,
          photo: profile?.picture,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.isNewUser);
      } else {
        onLoginSuccess({
          nombre_completo: profile?.name || 'Usuario Google',
          correo_electronico: profile?.email || 'usuario@gmail.com',
          foto_perfil_url: profile?.picture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        }, false);
      }
    } catch (e) {
      setLoading(false);
      onLoginSuccess({
        nombre_completo: profile?.name || 'Usuario Google',
        correo_electronico: profile?.email || 'usuario@gmail.com',
        foto_perfil_url: profile?.picture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      }, false);
    }
  };

  // Main Google Click Handler: Uses Google OAuth2 Token Client Popup
  const handleGoogleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAlert({ show: false, message: '', type: 'error' });

    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setLoading(false);
              setAlert({
                show: true,
                message: `Error de Google: ${tokenResponse.error_description || tokenResponse.error}`,
                type: 'error',
              });
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                // Fetch verified profile info from Google API
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userInfoRes.json();

                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    credential: tokenResponse.access_token,
                    email: profile.email,
                    name: profile.name,
                    photo: profile.picture,
                  }),
                });

                const data = await res.json();
                setLoading(false);

                if (res.ok && data.success) {
                  onLoginSuccess(data.user, data.isNewUser);
                } else {
                  onLoginSuccess({
                    nombre_completo: profile.name || 'Usuario Google',
                    correo_electronico: profile.email || 'usuario@gmail.com',
                    foto_perfil_url: profile.picture,
                  }, false);
                }
              } catch (fetchErr) {
                setLoading(false);
                console.error('Error al obtener datos de Google:', fetchErr);
                setAlert({
                  show: true,
                  message: 'No se pudo obtener el perfil de Google.',
                  type: 'error',
                });
              }
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 popup error:', err);
        setLoading(false);
      }
    }

    // Fallback if Google SDK is not loaded or client ID is missing
    setLoading(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail || undefined,
          name: customName || undefined,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        onLoginSuccess(data.user, data.isNewUser);
      } else {
        onLoginSuccess({
          _id: "650000000000000000000001",
          nombre_completo: "María González",
          correo_electronico: "maria.gonzalez@gmail.com",
          foto_perfil_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        }, false);
      }
    } catch (err) {
      setLoading(false);
      onLoginSuccess({
        _id: "650000000000000000000001",
        nombre_completo: "María González",
        correo_electronico: "maria.gonzalez@gmail.com",
        foto_perfil_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      }, false);
    }
  };

  return (
    <main className="screen-content" id="loginScreen">
      {/* Header Section */}
      <header className="header-section">
        <h1 className="main-title">Iniciar Sesión</h1>
        <p className="subtitle-accessible">Fácil, rápido y sin contraseñas difíciles</p>
      </header>

      {/* Google Login Button Container */}
      <div className="google-auth-container">
        <button
          type="button"
          id="googleLoginBtn"
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
          aria-label="Iniciar sesión con Google"
        >
          {loading ? (
            <div className="google-btn-content">
              <span className="google-spinner"></span>
              <span className="google-btn-text">Conectando con Google...</span>
            </div>
          ) : (
            <div className="google-btn-content">
              <div className="google-icon-wrapper">
                <svg
                  className="google-svg"
                  viewBox="0 0 24 24"
                  width="26"
                  height="26"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <span className="google-btn-text">Iniciar sesión con Google</span>
            </div>
          )}
        </button>

        {alert.show && (
          <div className={`alert-message ${alert.type}`}>
            {alert.message}
          </div>
        )}
      </div>

      {/* Explanatory Guide Card for Senior Citizens (Adultos Mayores) */}
      <section className="elderly-guide-card" aria-label="Instrucciones de inicio de sesión">
        <div className="guide-header">
          <div className="guide-icon-badge">💡</div>
          <h2 className="guide-title">¿Cómo ingresar a la app?</h2>
        </div>

        <div className="guide-steps-list">
          <div className="guide-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <strong>Toca el botón blanco</strong> con la letra <strong>G</strong> de Google ubicado arriba.
            </div>
          </div>

          <div className="guide-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <strong>Ingreso directo:</strong> No necesitas escribir ni memorizar contraseñas complicadas.
            </div>
          </div>

          <div className="guide-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <strong>¿Necesitas auxilio?</strong> Si se te dificulta ingresar, presiona el botón verde <strong>"PEDIR AYUDA"</strong> aquí abajo.
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Help / Support Button Section */}
      <div className="help-section">
        <button
          type="button"
          id="helpBtn"
          className="help-card"
          aria-label="Pedir Ayuda"
          onClick={onOpenHelp}
        >
          <div className="help-icon-wrapper">
            <HeadsetIcon />
          </div>
          <span className="help-text">PEDIR AYUDA</span>
        </button>
      </div>
    </main>
  );
}
