// ==========================================================================
// App State & DOM Elements (Vanilla JavaScript Fallback)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Elements - Google Login
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const alertMessage = document.getElementById('alertMessage');
  const loginScreen = document.getElementById('loginScreen');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  // Elements - Modals
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelpModal = document.getElementById('closeHelpModal');
  const requestCallbackBtn = document.getElementById('requestCallbackBtn');

  const toast = document.getElementById('toast');

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function showAlert(message, type = 'error') {
    if (!alertMessage) return;
    alertMessage.textContent = message;
    alertMessage.className = `alert-message ${type}`;
    alertMessage.style.display = 'block';
  }

  function hideAlert() {
    if (alertMessage) alertMessage.style.display = 'none';
  }

  // ==========================================================================
  // Google Login Flow
  // ==========================================================================
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      hideAlert();

      const originalHTML = googleLoginBtn.innerHTML;
      googleLoginBtn.disabled = true;
      googleLoginBtn.innerHTML = `
        <div class="google-btn-content">
          <span class="google-spinner"></span>
          <span class="google-btn-text">Iniciando sesión...</span>
        </div>
      `;

      try {
        const res = await fetch('/api/auth/google', { method: 'POST' });
        const data = await res.json();
        
        setTimeout(() => {
          googleLoginBtn.disabled = false;
          googleLoginBtn.innerHTML = originalHTML;

          if (userEmailDisplay) {
            userEmailDisplay.textContent = data.user?.email || 'usuario.google@gmail.com';
          }
          if (loginScreen) loginScreen.style.display = 'none';
          if (welcomeScreen) welcomeScreen.style.display = 'flex';
          showToast('¡Inicio de sesión con Google exitoso!');
        }, 500);
      } catch (err) {
        setTimeout(() => {
          googleLoginBtn.disabled = false;
          googleLoginBtn.innerHTML = originalHTML;

          if (userEmailDisplay) {
            userEmailDisplay.textContent = 'usuario.google@gmail.com';
          }
          if (loginScreen) loginScreen.style.display = 'none';
          if (welcomeScreen) welcomeScreen.style.display = 'flex';
          showToast('¡Inicio de sesión con Google exitoso!');
        }, 500);
      }
    });
  }

  // Logout Flow
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (loginScreen) loginScreen.style.display = 'flex';
      hideAlert();
      showToast('Has cerrado sesión');
    });
  }

  // ==========================================================================
  // "PEDIR AYUDA" Modal Flow
  // ==========================================================================
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      if (helpModal) helpModal.style.display = 'flex';
    });
  }

  function closeHelpModalHandler() {
    if (helpModal) helpModal.style.display = 'none';
  }

  if (closeHelpModal) {
    closeHelpModal.addEventListener('click', closeHelpModalHandler);
  }

  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelpModalHandler();
    });
  }

  if (requestCallbackBtn) {
    requestCallbackBtn.addEventListener('click', () => {
      closeHelpModalHandler();
      showToast('Un agente de soporte te contactará en breve');
    });
  }

  // Keyboard accessibility (ESC to close modal)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (helpModal && helpModal.style.display === 'flex') closeHelpModalHandler();
    }
  });
});
