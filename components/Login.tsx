import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { UserIcon } from './icons/UserIcon';
import { PowerIcon } from './icons/PowerIcon';

interface LoginProps {
  onLogin: (name: string, password: string) => string | void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const loginError = onLogin(name, password);
    if (loginError) {
      setError(loginError);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Bienvenido a WG MEDICAL</h1>
            <p className="text-slate-500">Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Usuario</label>
                <div className="relative mt-1">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                <div className="relative mt-1">
                    <KeyIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <div>
                <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">
                    Iniciar Sesión
                </button>
            </div>
        </form>

        <div className="mt-6 pt-6 border-t">
          <button 
            onClick={() => window.close()} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 border border-red-200 transition-colors font-semibold"
          >
            <PowerIcon className="w-5 h-5" />
            <span>Salir de la Aplicación</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
