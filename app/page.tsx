'use client';

import { useState } from 'react';

export default function LoginPage() {
  // Estados para controlar lo que escribe el usuario (y usarlos en las validaciones de la Tarea 2)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para enviar los datos más adelante
    console.log('Intentando iniciar sesión con:', { username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Contenedor del Login: Responsivo (ancho completo en celular, máximo 400px en pantallas grandes) */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Iniciar Sesión
        </h2>

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
              className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password" // Esto oculta la contraseña mientras se escribe automáticamente
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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