import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('⚠️ [MongoDB] MONGODB_URI no está definido en el archivo .env. Usando almacenamiento en memoria.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Conectado]: ${conn.connection.host} / Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ [Error de conexión MongoDB]:', error.message);
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
