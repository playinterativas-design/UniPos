import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, Lock, DollarSign, BookOpen, Headset, Mail, MessageCircle, Phone, ExternalLink, Power } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/ui/Modal';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, currentSession, openCashier, logoutCompany, companyAccount } = useStore();
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');

  const handlePOSClick = () => {
    // If logged in but cash is closed, ask to open
    if (currentUser && !currentSession) {
      setIsCashModalOpen(true);
      return;
    }
    // If logged in and cash open, go to POS
    if (currentUser && currentSession) {
      navigate('/pos');
      return;
    }
    // Else go to Login
    navigate('/login?redirect=pos');
  };

  const handleManagerClick = () => {
    if (currentUser) {
      navigate('/manager');
    } else {
      navigate('/login?redirect=manager');
    }
  };

  const handleOpenRegister = () => {
    const amount = parseFloat(openingAmount);
    if (!isNaN(amount)) {
      openCashier(amount);
      setIsCashModalOpen(false);
      navigate('/pos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-gray-900 flex items-center justify-center p-4 relative">
      
      {/* Top Bar for Company Info */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-white/50 text-sm">
        <div>
           {companyAccount?.companyName && <span className="uppercase tracking-widest">{companyAccount.companyName}</span>}
        </div>
        <button onClick={logoutCompany} className="flex items-center gap-1 hover:text-white transition-colors">
          <Power size={14}/> Sair da Conta
        </button>
      </div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">UniPOS</h1>
          <p className="text-indigo-200 text-xl">Sistema Universal de Ponto de Venda</p>
          
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600/50 hover:bg-indigo-600 text-indigo-100 px-4 py-2 rounded-full text-sm transition-colors border border-indigo-500/30"
            >
              <BookOpen size={16} /> Manual de Uso
            </button>
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600/50 hover:bg-emerald-600 text-emerald-100 px-4 py-2 rounded-full text-sm transition-colors border border-emerald-500/30"
            >
              <Headset size={16} /> Suporte Técnico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* POS Card */}
          <button 
            onClick={handlePOSClick}
            className="group relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 bg-indigo-500 rounded-full p-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Frente de Caixa (PDV)</h2>
            <p className="text-indigo-200 mb-6">Comece a vender. Acesse a interface do caixa, scanner e pagamentos.</p>
            <div className="flex items-center gap-2 text-sm text-indigo-300">
               <div className={`w-2 h-2 rounded-full ${currentSession ? 'bg-green-400' : 'bg-red-400'}`}></div>
               {currentSession ? 'Caixa Aberto' : 'Caixa Fechado'}
            </div>
          </button>

          {/* Manager Card */}
          <button 
            onClick={handleManagerClick}
            className="group relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 bg-purple-500 rounded-full p-2 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Gerente / Config</h2>
            <p className="text-indigo-200 mb-6">Painel administrativo. Estoque, Relatórios, Configurações e Controle de usuários.</p>
            <div className="flex items-center gap-2 text-sm text-indigo-300">
               <Lock size={14} />
               Autenticação Necessária
            </div>
          </button>

        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2024 UniPOS Systems. V 1.0.0</p>
        </div>
      </div>

      {/* Modal Abertura de Caixa */}
      <Modal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Abrir Caixa"
        footer={
          <button onClick={handleOpenRegister} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full">
            Abrir Caixa
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4 text-green-600">
             <DollarSign size={48} />
             <p className="font-medium mt-2">Iniciar Dia</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor Inicial (Fundo de Troco)</label>
            <input 
              type="number" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-lg font-mono"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>
      </Modal>

      {/* Modal Manual de Uso */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Passo a Passo - Como Usar"
        footer={
          <button onClick={() => setIsHelpModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Entendi
          </button>
        }
      >
        <div className="space-y-4 text-gray-700 overflow-y-auto max-h-[60vh] pr-2">
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-indigo-600 mb-1">1. Login e Acesso</h3>
            <p className="text-sm">Use o usuário <strong>admin</strong> para acesso total ou <strong>op1</strong> para acesso apenas de vendas. A senha é livre na versão demo.</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
             <h3 className="font-bold text-indigo-600 mb-1">2. Gerenciador (Admin)</h3>
             <ul className="text-sm list-disc pl-4 space-y-1">
               <li>Acesse a área <strong>Gerente</strong>.</li>
               <li>Na aba <strong>Estoque</strong>, adicione produtos ou delete categorias.</li>
               <li>Na aba <strong>Configuração</strong>, ajuste dados fiscais e a política de segurança da empresa.</li>
             </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
             <h3 className="font-bold text-indigo-600 mb-1">3. Abrindo o Caixa</h3>
             <ul className="text-sm list-disc pl-4 space-y-1">
               <li>Clique em <strong>Frente de Caixa (PDV)</strong>.</li>
               <li>Se o caixa estiver fechado, será solicitado o <strong>Valor Inicial</strong> (Fundo de Troco). Informe e confirme.</li>
             </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
             <h3 className="font-bold text-indigo-600 mb-1">4. Realizando Vendas</h3>
             <ul className="text-sm list-disc pl-4 space-y-1">
               <li>No PDV, digite o nome ou código do produto.</li>
               <li>Use <code>*2 1001</code> para adicionar 2 unidades do item 1001.</li>
               <li>Pressione <strong>F2 (Dinheiro)</strong>, <strong>F3 (Crédito)</strong>, etc., para finalizar.</li>
             </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
             <h3 className="font-bold text-indigo-600 mb-1">5. Fechando o Caixa</h3>
             <ul className="text-sm list-disc pl-4 space-y-1">
               <li>Pressione <strong>F10</strong> ou clique no ícone de sair no topo.</li>
               <li>Conte o dinheiro físico na gaveta e informe o valor (Fechamento Cego).</li>
               <li>Confirme. <strong>Sua sessão será encerrada automaticamente.</strong></li>
             </ul>
          </div>

        </div>
      </Modal>

      {/* Modal Suporte Técnico */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        title="Central de Ajuda e Suporte"
        footer={
          <button onClick={() => setIsSupportModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Fechar
          </button>
        }
      >
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
             <h3 className="text-lg font-bold text-emerald-800 mb-2 flex items-center gap-2">
               <Headset size={20}/> Suporte Especializado
             </h3>
             <p className="text-emerald-700 text-sm mb-4">
               Nossa equipe está disponível para tirar dúvidas e resolver problemas técnicos.
             </p>
          </div>

          <div className="space-y-4">
             {/* Email Section */}
             <div>
               <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Mail size={14} /> E-mail
               </h4>
               <div className="space-y-2">
                  <a href="mailto:unipos.pontodevenda@gmail.com" className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all group">
                     <span className="text-gray-700 font-medium">unipos.pontodevenda@gmail.com</span>
                     <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-500"/>
                  </a>
                  <a href="mailto:unipos.pontodevenda@hotmail.com" className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all group">
                     <span className="text-gray-700 font-medium">unipos.pontodevenda@hotmail.com</span>
                     <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-500"/>
                  </a>
               </div>
             </div>

             {/* Chat & WhatsApp Section */}
             <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle size={14} /> Chat Online
                  </h4>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 animate-pulse">
                    DISPONÍVEL
                  </span>
                </div>
                
                <a 
                  href="https://wa.me/5511915474541" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group cursor-pointer"
                >
                   <div className="bg-green-500 text-white p-3 rounded-full mr-4 shadow-lg group-hover:scale-110 transition-transform">
                     <Phone size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-gray-800">Atendimento via WhatsApp</p>
                     <p className="text-sm text-green-700 font-medium">+55 (11) 91547-4541</p>
                     <p className="text-xs text-gray-500 mt-1">Clique para iniciar uma conversa agora</p>
                   </div>
                   <div className="ml-auto">
                     <ArrowRightIcon />
                   </div>
                </a>
             </div>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Horário de atendimento: Seg a Sex, das 08h às 18h.</p>
          </div>
        </div>
      </Modal>

    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default Home;