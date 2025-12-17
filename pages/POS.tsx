import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { CartItem, Product, CashSession } from '../types';
import { Plus, Minus, Search, ShoppingBag, AlertTriangle, LogOut, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

const POS = () => {
  const { products, currentSession, processSale, logout, currentUser, closeCashier, settings } = useStore();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);
  
  // Close Register & Report States
  const [closeRegisterAmount, setCloseRegisterAmount] = useState('');
  const [closedSessionReport, setClosedSessionReport] = useState<CashSession | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') setIsCloseRegisterModalOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Focus input on load
  useEffect(() => {
    if(inputRef.current) inputRef.current.focus();
  }, [cart]);

  // Logic: Add to Cart with Stock Check
  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + qtyToAdd > product.stock) {
      showError(`Estoque Insuficiente! Disponível: ${product.stock}`);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + qtyToAdd, total: (item.quantity + qtyToAdd) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: qtyToAdd, total: product.price * qtyToAdd }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQty: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (newQty > product.stock) {
      showError(`Estoque Insuficiente! Disponível: ${product.stock}`);
      return;
    }

    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQty, total: newQty * item.price } 
        : item
    ));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let qty = 1;
    let code = searchTerm;

    if (searchTerm.startsWith('*')) {
      const parts = searchTerm.split(' ');
      if (parts.length > 1) {
        qty = parseInt(parts[0].substring(1)) || 1;
        code = parts[1];
      }
    }

    const product = products.find(p => p.code === code || p.name.toLowerCase().includes(code.toLowerCase()));
    
    if (product) {
      addToCart(product, qty);
      setSearchTerm('');
    } else {
      showError("Produto não encontrado");
    }
  };

  const handleAddMoreProducts = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFinalizeClick = () => {
    if (cart.length === 0) {
      showError("Carrinho vazio!");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handlePayment = (methodLabel: string) => {
    if (cart.length === 0) return;
    const success = processSale(cart, methodLabel);
    if (success) {
      setCart([]);
      setIsPaymentModalOpen(false);
      showError("Venda Concluída! 💰"); 
    }
  };

  const handleCloseRegister = () => {
    const amount = parseFloat(closeRegisterAmount);
    if (isNaN(amount)) {
      showError("Valor Inválido");
      return;
    }
    
    // Perform Close and Get Report
    const { closedSession } = closeCashier(amount);
    setClosedSessionReport(closedSession);
    setIsCloseRegisterModalOpen(false);
  };

  const handleFinalExit = () => {
    logout();
    navigate('/');
  };

  if (!currentSession) {
    // If we have a closing report, show it instead of the generic "Closed" message
    if (closedSessionReport) {
      const expected = closedSessionReport.startValue + closedSessionReport.salesTotal;
      const diff = closedSessionReport.difference || 0;
      const isNegative = diff < 0;

      return (
        <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in border border-gray-700">
             <div className="text-center mb-6">
                <div className="bg-green-100 p-4 rounded-full inline-block mb-3">
                  <FileText size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Relatório de Fechamento</h2>
                <p className="text-sm text-gray-500">Sessão encerrada com sucesso.</p>
             </div>

             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                 <span className="text-gray-600">Operador</span>
                 <span className="font-semibold">{closedSessionReport.operatorName}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                 <span className="text-gray-600">Fundo Inicial</span>
                 <span className="font-mono">R${closedSessionReport.startValue.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                 <span className="text-gray-600">Total Vendas</span>
                 <span className="font-mono text-blue-600 font-bold">+ R${closedSessionReport.salesTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center py-2 bg-gray-50 px-2 rounded">
                 <span className="font-bold text-gray-700">Valor Esperado</span>
                 <span className="font-mono font-bold">R${expected.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center py-2 px-2">
                 <span className="text-gray-600">Valor Contado (Gaveta)</span>
                 <span className="font-mono font-bold text-gray-900">R${(closedSessionReport.endValue || 0).toFixed(2)}</span>
               </div>
               
               {/* Difference Highlight */}
               <div className={`flex justify-between items-center p-3 rounded-lg border ${isNegative ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                 <span className={`font-bold ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
                   {isNegative ? 'Quebra (Falta)' : 'Sobra de Caixa'}
                 </span>
                 <span className={`font-mono font-bold text-xl ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
                   {diff > 0 ? '+' : ''}R${diff.toFixed(2)}
                 </span>
               </div>
             </div>

             <button 
               onClick={handleFinalExit}
               className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2"
             >
               Confirmar e Sair <ArrowRight size={18} />
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Caixa Fechado</h2>
          <p className="mb-4">Por favor, abra o caixa via Gerenciador para começar a vender.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  // Active payment methods from settings
  const activePaymentMethods = settings.paymentMethods?.filter(pm => pm.active) || [];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden font-sans">
      
      {/* 1. Header */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-wide">UniPOS <span className="text-indigo-400 text-sm font-normal">Universal</span></h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
             <span className="text-gray-400">Operador</span>
             <span className="font-semibold text-white">{currentUser?.name}</span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex flex-col items-end">
             <span className="text-gray-400">Data/Hora</span>
             <span className="font-mono text-indigo-300">{currentTime.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${currentSession ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{currentSession ? 'ABERTO' : 'FECHADO'}</span>
          </div>
          <button onClick={() => setIsCloseRegisterModalOpen(true)} className="ml-4 p-2 hover:bg-red-900/50 rounded text-red-400" title="Fechar Caixa (F10)">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Product List (Center) - Now Left in Wide Screen */}
        <div className="flex-1 flex flex-col border-r border-gray-700 bg-gray-900 relative">
          {/* List Header */}
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-800 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Produto</div>
            <div className="col-span-2 text-center">Qtd</div>
            <div className="col-span-2 text-right">Preço</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {cart.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 rounded items-center ${index === cart.length - 1 ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800/50 hover:bg-gray-800'} transition-all`}>
                <div className="col-span-1 text-gray-500">{index + 1}</div>
                <div className="col-span-5">
                  <div className="font-medium text-white truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.code}</div>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-700 rounded"><Minus size={12} /></button>
                  <span className="w-8 text-center font-mono">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-700 rounded"><Plus size={12} /></button>
                </div>
                <div className="col-span-2 text-right font-mono text-gray-300">R${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right font-mono font-bold text-indigo-400">R${item.total.toFixed(2)}</div>
              </div>
            ))}
            {cart.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                 <ShoppingBag size={64} className="mb-4" />
                 <p className="text-lg">Carrinho vazio</p>
                 <p className="text-sm">Escaneie o código ou busque para começar</p>
               </div>
            )}
          </div>
        </div>

        {/* 3. Sidebar (Right) - Input & Totals */}
        <div className="w-96 flex flex-col bg-gray-800 shadow-2xl z-10">
          
          {/* Input Area */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
             <form onSubmit={handleSearchSubmit} className="relative">
               <Search className="absolute left-3 top-3 text-gray-400" size={20} />
               <input 
                 ref={inputRef}
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Buscar ou Escanear (ex: *2 1001)"
                 className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
               />
             </form>
             <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {products.slice(0, 3).map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 p-2 rounded text-xs text-left w-24 truncate border border-gray-600">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-gray-400">R${p.price}</div>
                  </button>
                ))}
             </div>
          </div>

          {/* Totals Display */}
          <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
             <div className="space-y-2 text-gray-400 text-sm">
               <div className="flex justify-between">
                 <span>Subtotal</span>
                 <span>R${cartTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Desconto</span>
                 <span>R$0.00</span>
               </div>
               <div className="flex justify-between">
                 <span>Impostos</span>
                 <span>R$0.00</span>
               </div>
             </div>
             
             <div className="pt-4 border-t border-gray-700">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-lg font-medium text-white">Valor Total</span>
                 <span className="text-4xl font-bold text-green-400 font-mono">R${cartTotal.toFixed(2)}</span>
               </div>
             </div>
          </div>

          {/* 5. Action Buttons (Replaced Payment Buttons) */}
          <div className="p-4 grid grid-cols-1 gap-3 bg-gray-900 border-t border-gray-700">
             <button 
                onClick={handleAddMoreProducts} 
                className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
             >
               <Plus size={20} />
               Adicionar Mais Produtos
             </button>
             
             <button 
                onClick={handleFinalizeClick} 
                className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold text-lg transition-colors shadow-lg shadow-green-900/50"
             >
               <CheckCircle size={24} />
               FINALIZAR PEDIDOS
             </button>
          </div>
        </div>
      </div>

      {/* 6. Footer Messages */}
      <footer className="h-10 bg-indigo-900 flex items-center px-4 justify-between shrink-0">
        <span className="text-indigo-200 text-sm font-medium animate-pulse">{errorMsg || "Sistema Pronto - Aguardando entrada..."}</span>
        <div className="flex gap-4 text-xs text-indigo-300">
          <span>F10 Fechar Caixa</span>
        </div>
      </footer>

      {/* Payment Selection Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Forma de Pagamento"
      >
         <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded border border-gray-200 mb-4">
               <p className="text-gray-500 text-sm">Total a Pagar</p>
               <p className="text-3xl font-bold text-green-600 font-mono">R${cartTotal.toFixed(2)}</p>
            </div>
            
            <p className="text-sm font-medium text-gray-700">Selecione o método:</p>
            <div className="grid grid-cols-2 gap-3">
               {activePaymentMethods.length > 0 ? (
                 activePaymentMethods.map(method => (
                    <button 
                      key={method.id}
                      onClick={() => handlePayment(method.label)}
                      className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all text-gray-700 hover:text-indigo-700"
                    >
                       <span className="font-bold">{method.label}</span>
                    </button>
                 ))
               ) : (
                 <div className="col-span-2 text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded">
                    Nenhuma forma de pagamento ativa. Configure no Gerenciador.
                 </div>
               )}
            </div>
         </div>
      </Modal>

      {/* Close Register Modal */}
      <Modal 
        isOpen={isCloseRegisterModalOpen} 
        onClose={() => setIsCloseRegisterModalOpen(false)}
        title="Fechar Caixa (Contagem Cega)"
        footer={
          <>
            <button onClick={() => setIsCloseRegisterModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleCloseRegister} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Calcular e Fechar</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Por favor, conte o dinheiro físico na gaveta e insira o valor total abaixo. O sistema calculará as diferenças automaticamente.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dinheiro Total na Gaveta</label>
            <input 
              type="number" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
              value={closeRegisterAmount}
              onChange={(e) => setCloseRegisterAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-800 text-sm">
            <AlertTriangle size={16} className="inline mr-1" />
            <strong>Atenção:</strong> Ao clicar em Calcular, a sessão será encerrada e o relatório será gerado.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default POS;