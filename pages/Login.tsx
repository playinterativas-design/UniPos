import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowRight, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      // If going to POS, redirect to Home first so the "Open Register" modal logic can trigger if needed
      // Otherwise go straight to Manager
      navigate(redirect === 'pos' ? '/' : '/manager'); 
    } else {
      setError('Credenciais inválidas. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Lock size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Login do Operador</h2>
        <p className="text-center text-gray-500 mb-6">Identifique-se para acessar o {redirect === 'pos' ? 'PDV' : 'Gerenciador'}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="ex: admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Senha (padrão: 1234)"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Entrar no Sistema <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-6 text-center">
           <p className="text-xs text-gray-400 mb-2">Dica: admin / 1234 ou op1 / 1234</p>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-indigo-600">Cancelar e Voltar</button>
        </div>
      </div>
    </div>
  );
};

export default Login;