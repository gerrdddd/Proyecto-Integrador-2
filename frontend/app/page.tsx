'use client';

import { useState } from 'react';

export default function LoginPage() {
  // Estados para los campos
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Estados para manejar los errores visuales (Tarea 2)
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiamos errores previos
    setErrorMessage('');

    // Validación 1: Campos vacíos (Tarea 2 - Parte 1)
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, rellene todos los campos vacíos.');
      return;
    }

    // Aquí simulación de respuesta del Backend (Tarea 2 - Parte 2)
    // Cuando conectes tu backend real, este mensaje vendrá del servidor si los datos están mal
    if (username !== 'admin' || password !== '123456') {
      setErrorMessage('Usuario o contraseña incorrectos (Error del Servidor).');
      return;
    }

    alert('¡Inicio de sesión exitoso!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Iniciar Sesión
        </h2>

        {/* Mensaje de Error Visual (Tarea 2) */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo: Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-gray-900 focus:outline-none focus:ring-1 ${
                errorMessage && !username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-gray-900 focus:outline-none focus:ring-1 ${
                errorMessage && !password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Botón: Iniciar Sesión */}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors mt-2"
          >
            Iniciar Sesión
          </button>

        </form>
      </div>
    </div>
  );
}