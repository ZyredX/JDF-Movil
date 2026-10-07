import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './db.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
connectDB();

// In-memory fallback database
const MEMORY_USERS = [
  {
    _id: "650000000000000000000001",
    google_id: "109876543210987654321",
    nombre_completo: "María González",
    correo_electronico: "maria.gonzalez@gmail.com",
    foto_perfil_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    fecha_registro: new Date().toISOString(),
    configuracion_accesibilidad: {
      agrandar_texto: true,
      tamano_texto: 15,
      colores_fuertes: true,
      nivel_contraste: 70
    }
  }
];

// Health check & DB status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected() ? 'MongoDB conectado' : 'Modo memoria (sin MONGODB_URI)',
    timestamp: new Date().toISOString()
  });
});

// Google Authentication Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential, email, name, photo } = req.body || {};
  const userEmail = email || "maria.gonzalez@gmail.com";
  const userName = name || "María González";
  const userPhoto = photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80";

  try {
    if (isDbConnected()) {
      let isNewUser = false;
      // Find or create user in MongoDB
      let user = await User.findOne({ correo_electronico: userEmail });
      if (!user) {
        isNewUser = true;
        user = await User.create({
          google_id: credential ? `google-${Date.now()}` : "109876543210987654321",
          nombre_completo: userName,
          correo_electronico: userEmail,
          foto_perfil_url: userPhoto,
          configuracion_accesibilidad: {
            agrandar_texto: true,
            tamano_texto: 15,
            colores_fuertes: true,
            nivel_contraste: 70
          }
        });
      }
      return res.json({
        success: true,
        isNewUser,
        message: isNewUser ? 'Usuario nuevo registrado exitosamente (MongoDB)' : 'Inicio de sesión con Google exitoso (MongoDB)',
        user,
        token: `jwt-google-token-${Date.now()}`
      });
    }
  } catch (dbErr) {
    console.error('Error al consultar MongoDB en login:', dbErr);
  }

  // Fallback in-memory
  const defaultUser = {
    ...MEMORY_USERS[0],
    nombre_completo: userName,
    correo_electronico: userEmail,
    foto_perfil_url: userPhoto
  };

  return res.json({
    success: true,
    isNewUser: false,
    message: 'Inicio de sesión con Google exitoso (Memoria)',
    user: defaultUser,
    token: `jwt-google-token-${Date.now()}`
  });
});

// Update user profile endpoint (e.g. name or accessibility settings)
app.put('/api/user/profile', async (req, res) => {
  const { correo_electronico, nombre_completo, configuracion_accesibilidad } = req.body || {};

  try {
    if (isDbConnected() && correo_electronico) {
      const updatedUser = await User.findOneAndUpdate(
        { correo_electronico },
        { 
          $set: { 
            ...(nombre_completo ? { nombre_completo } : {}),
            ...(configuracion_accesibilidad ? { configuracion_accesibilidad } : {})
          } 
        },
        { returnDocument: 'after' }
      );
      if (updatedUser) {
        return res.json({
          success: true,
          message: 'Perfil actualizado en MongoDB',
          user: updatedUser
        });
      }
    }
  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
  }

  // Fallback in-memory
  return res.json({
    success: true,
    message: 'Perfil actualizado correctamente',
    user: {
      _id: "650000000000000000000001",
      nombre_completo: nombre_completo || "Usuario",
      configuracion_accesibilidad
    }
  });
});

// Authentication Endpoint (Direct)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'El correo electrónico y la contraseña son obligatorios.' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Por favor, ingresa un correo electrónico válido.' 
    });
  }

  return res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    user: {
      email,
      name: email.split('@')[0],
      loginTime: new Date().toISOString(),
    },
    token: `jwt-mock-token-${Date.now()}`
  });
});

// Password recovery endpoint
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'El correo electrónico es obligatorio.' 
    });
  }
  return res.json({
    success: true,
    message: `Se ha enviado un enlace de recuperación a ${email}`
  });
});

// Support / Help request endpoint
app.post('/api/support/request-help', (req, res) => {
  return res.json({
    success: true,
    message: 'Un asesor de soporte se pondrá en contacto contigo inmediatamente.'
  });
});

app.listen(PORT, () => {
  console.log(`[Node.js Server] Servidor backend ejecutándose en http://localhost:${PORT}`);
});
