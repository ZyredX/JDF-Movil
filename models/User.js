import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    google_id: {
      type: String,
      sparse: true,
      unique: true,
    },
    nombre_completo: {
      type: String,
      required: true,
      trim: true,
    },
    correo_electronico: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    foto_perfil_url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    configuracion_accesibilidad: {
      agrandar_texto: { type: Boolean, default: true },
      tamano_texto: { type: Number, default: 15 },
      colores_fuertes: { type: Boolean, default: true },
      nivel_contraste: { type: Number, default: 70 },
    },
  },
  {
    collection: 'usuarios',
    timestamps: { createdAt: 'fecha_registro', updatedAt: 'fecha_actualizacion' },
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema, 'usuarios');
