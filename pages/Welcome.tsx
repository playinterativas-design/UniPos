import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, Building2, User, Mail, Lock, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

type ViewState = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'SUCCESS';

const Welcome = () => {
  const { registerCompany, loginCompany, recoverCompanyPassword, companyAccount } = useStore();
  
  // View State (Default to Register if no account exists, else Login)
  const [view, setView] = useState<ViewState>(companyAccount ? 'LOGIN' : 'REGISTER');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form
  const [regCompany, setRegCompany] = useState('');
  const [regDoc, setRegDoc] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  // Forgot Form
  const [forgotEmail, setForgotEmail] = useState('');

  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (pwd: string) => {
    // Rule: Uppercase, Lowercase, 6 chars, Symbols
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasLen = pwd.length >= 6;
    return hasUpper && hasLower && hasSymbol && hasLen;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regCompany || !regDoc || !regEmail || !regPhone || !regPass || !regPassConfirm) {
      setError('Preencha todos os campos.');
      return;
    }

    if (regPass !== regPassConfirm) {
      setError('As senhas não conferem.');
      return;
    }

    if (!validatePassword(regPass)) {
      setError('A senha deve ter: 6+ caracteres, 1 maiúscula, 1 minúscula e 1 símbolo.');
      return;
    }

    // Register but do NOT auto-login yet, so we can show success screen
    registerCompany({
      companyName: regCompany,
      document: regDoc,
      email: regEmail,
      phone: regPhone,
      password: regPass
    }, false);

    setView('SUCCESS');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (loginCompany(loginIdentifier, loginPassword)) {
      // Success is handled by context state change triggering app re-render
    } else {
      setError('Credenciais inválidas. Verifique seus dados.');
    }
  };

  const handleSuccessLogin = () => {
    // Use the registered credentials to login immediately
    loginCompany(regEmail, regPass);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (recoverCompanyPassword(forgotEmail)) {
      setSuccess(`Link de alteração de senha enviado para ${forgotEmail}`);
    } else {
      setError('E-mail não encontrado no sistema.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Left Side - Visual */}
        <div className="bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
             <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">UniPOS</h1>
            <p className="text-indigo-200">Sistema Universal de PDV</p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-start gap-4">
               <div className="bg-indigo-500/50 p-3 rounded-lg"><Shield size={24}/></div>
               <div>
                 <h3 className="font-semibold text-lg">Segurança Total</h3>
                 <p className="text-indigo-200 text-sm">Seus dados protegidos com criptografia de ponta.</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="bg-indigo-500/50 p-3 rounded-lg"><Building2 size={24}/></div>
               <div>
                 <h3 className="font-semibold text-lg">Multi-Empresas</h3>
                 <p className="text-indigo-200 text-sm">Gerencie seu negócio de qualquer lugar.</p>
               </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-indigo-300">
            &copy; 2024 UniPOS Systems.
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="p-12 flex flex-col justify-center bg-gray-50">
          
          {/* LOGIN VIEW */}
          {view === 'LOGIN' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Acesse sua Conta</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login (Email, CPF ou CNPJ)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Digite seu acesso..."
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="******"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                <div className="flex justify-between items-center text-sm">
                   <button type="button" onClick={() => setView('REGISTER')} className="text-indigo-600 hover:underline">Criar conta</button>
                   <button type="button" onClick={() => setView('FORGOT')} className="text-gray-500 hover:text-gray-700">Esqueci a senha</button>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Entrar no Sistema
                </button>
              </form>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === 'REGISTER' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Criar Conta da Empresa</h2>
              <form onSubmit={handleRegister} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Nome da Empresa" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={regCompany} onChange={e => setRegCompany(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="CNPJ ou CPF" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={regDoc} onChange={e => setRegDoc(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Telefone" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="E-mail Corporativo" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                   <input 
                    type="password" 
                    placeholder="Senha" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={regPass} onChange={e => setRegPass(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="Confirmar Senha" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={regPassConfirm} onChange={e => setRegPassConfirm(e.target.value)}
                  />
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                   Requisitos: Letra maiúscula, minúscula, símbolo e 6+ caracteres.
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 mt-2">
                  Cadastrar Empresa
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => setView('LOGIN')} className="text-sm text-indigo-600 hover:underline">
                    Já tem conta? Entrar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUCCESS VIEW (Email Confirmation Simulation) */}
          {view === 'SUCCESS' && (
            <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
               <div className="bg-green-100 p-4 rounded-full mb-6">
                 <CheckCircle size={64} className="text-green-600" />
               </div>
               <h2 className="text-3xl font-bold text-gray-800 mb-2">Cadastro Realizado!</h2>
               <p className="text-gray-600 mb-6 max-w-sm">
                 Sua conta empresarial foi criada com sucesso e os dados foram salvos no dispositivo.
               </p>
               
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8 max-w-sm text-left flex items-start gap-3">
                 <Mail className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                 <div>
                    <h4 className="font-bold text-blue-800 text-sm">Verifique seu E-mail</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Enviamos uma notificação de confirmação e boas-vindas para <strong>{regEmail}</strong>.
                    </p>
                 </div>
               </div>

               <button 
                 onClick={handleSuccessLogin}
                 className="w-full max-w-xs bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
               >
                 Acessar Sistema Agora <ArrowRight size={18} />
               </button>
            </div>
          )}

          {/* FORGOT VIEW */}
          {view === 'FORGOT' && (
            <div className="animate-fade-in">
              <button onClick={() => setView('LOGIN')} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
                 &larr; Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
              <p className="text-gray-500 text-sm mb-6">Informe seu e-mail de cadastro para receber o link de redefinição.</p>
              
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Cadastrado</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="email@empresa.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                   </div>
                </div>

                {success && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle size={16}/> {success}
                  </div>
                )}
                
                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                   Enviar Link
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Welcome;