
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
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);
  
  const [closeRegisterAmount, setCloseRegisterAmount] = useState('');
  const [closedSessionReport, setClosedSessionReport] = useState<CashSession | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus();
  }, [cart]);

  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    const freshProduct = products.find(p => p.id === product.id) || product;
    const existingItem = cart.find(item => item.id === freshProduct.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + qtyToAdd > freshProduct.stock) {
      showError(`Estoque Insuficiente! Disponível: ${freshProduct.stock}`);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === freshProduct.id 
          ? { ...item, quantity: item.quantity + qtyToAdd, total: (item.quantity + qtyToAdd) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, { ...freshProduct, quantity: qtyToAdd, total: freshProduct.price * qtyToAdd }]);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

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
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty, total: newQty * item.price } : item));
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

  const handleFinalizeClick = () => {
    if (cart.length === 0) return showError("Carrinho vazio!");
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
    if (isNaN(amount)) return showError("Valor Inválido");
    const { closedSession } = closeCashier(amount);
    setClosedSessionReport(closedSession);
    setIsCloseRegisterModalOpen(false);
  };

  if (!currentSession) {
    if (closedSessionReport) {
      const expected = closedSessionReport.startValue + closedSessionReport.salesTotal;
      const diff = closedSessionReport.difference || 0;
      return (
        <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="text-center mb-6">
                <div className="bg-green-100 p-4 rounded-full inline-block mb-3 text-green-600"><FileText size={32} /></div>
                <h2 className="text-2xl font-bold">Relatório do Caixa</h2>
             </div>
             <div className="space-y-3 mb-6 font-medium text-sm">
               <div className="flex justify-between border-b pb-2"><span>Total Vendas</span><span className="text-green-600">R${closedSessionReport.salesTotal.toFixed(2)}</span></div>
               <div className="flex justify-between border-b pb-2"><span>Valor Esperado</span><span className="text-gray-900">R${expected.toFixed(2)}</span></div>
               <div className="flex justify-between border-b pb-2"><span>Valor Contado</span><span className="text-indigo-600">R${(closedSessionReport.endValue || 0).toFixed(2)}</span></div>
               <div className={`p-3 rounded-xl flex justify-between font-black ${diff < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                 <span>Diferença</span><span>{diff >= 0 ? '+' : ''}R${diff.toFixed(2)}</span>
               </div>
             </div>
             <button onClick={() => {logout(); navigate('/');}} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">Finalizar <ArrowRight size={18} /></button>
          </div>
        </div>
      );
    }
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white flex-col gap-4"><AlertTriangle size={48}/><h2 className="text-2xl font-bold">Caixa Fechado</h2><button onClick={() => navigate('/')} className="bg-indigo-600 px-6 py-2 rounded-xl">Voltar</button></div>;
  }

  const activePaymentMethods = settings.paymentMethods?.filter(pm => pm.active) || [];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden font-sans">
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg"><ShoppingBag size={20} className="text-white" /></div>
          <h1 className="font-bold text-xl tracking-tight">UniPOS <span className="text-indigo-400 text-sm font-normal">Universal</span></h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end"><span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Operador</span><span className="font-semibold">{currentUser?.name}</span></div>
          <div className="flex flex-col items-end"><span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Hora</span><span className="font-mono text-indigo-400">{currentTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
          <button onClick={() => setIsCloseRegisterModalOpen(true)} className="p-2 hover:bg-red-900/50 rounded-xl text-red-400 transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-700 bg-gray-900 relative">
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-800/50 text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-700">
            <div className="col-span-1">#</div><div className="col-span-5">Produto</div><div className="col-span-2 text-center">Qtd</div><div className="col-span-2 text-right">Preço</div><div className="col-span-2 text-right">Total</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {cart.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-3 rounded-xl items-center bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/80 transition-all">
                <div className="col-span-1 text-gray-600 font-mono text-xs">{index + 1}</div>
                <div className="col-span-5"><div className="font-bold text-gray-100 truncate text-sm">{item.name}</div><div className="text-[10px] text-gray-500 font-mono">CODE: {item.code}</div></div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-700 rounded"><Minus size={12} /></button>
                  <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-700 rounded"><Plus size={12} /></button>
                </div>
                <div className="col-span-2 text-right font-mono text-xs text-gray-400">R${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right font-mono font-bold text-indigo-400">R${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-96 flex flex-col bg-gray-800 shadow-2xl z-10">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
             <form onSubmit={handleSearchSubmit} className="relative mb-3">
               <Search className="absolute left-3 top-3 text-gray-500" size={18} />
               <input ref={inputRef} type="text" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Busque ou Escaneie..." className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
             </form>
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {products.slice(0, 5).map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className={`flex-shrink-0 p-2 rounded-xl text-[10px] text-left w-20 border transition-all ${p.stock < 10 ? 'border-orange-500/50 bg-orange-900/10' : 'border-gray-700 bg-gray-900/50 hover:bg-indigo-900/20'}`}>
                    <div className="font-bold truncate text-gray-300">{p.name}</div>
                    <div className={`${p.stock < 10 ? 'text-orange-400' : 'text-gray-500'}`}>QTD: {p.stock}</div>
                  </button>
                ))}
             </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
             <div className="space-y-1 text-gray-500 text-xs font-bold uppercase tracking-widest">
               <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-300">R${cartTotal.toFixed(2)}</span></div>
               <div className="flex justify-between"><span>Desconto</span><span className="text-gray-300">R$0.00</span></div>
             </div>
             <div className="pt-4 border-t border-gray-700">
               <div className="flex justify-between items-end">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Valor Total</span>
                 <span className="text-4xl font-black text-green-400 font-mono">R${cartTotal.toFixed(2)}</span>
               </div>
             </div>
          </div>
          <div className="p-4 bg-gray-900 border-t border-gray-700 flex flex-col gap-2">
             <button onClick={handleFinalizeClick} className="w-full flex items-center justify-center gap-2 p-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-black text-lg transition-all shadow-xl shadow-indigo-950">
               <CheckCircle size={24} /> FINALIZAR VENDA
             </button>
          </div>
        </div>
      </div>

      <footer className="h-8 bg-indigo-950 flex items-center px-4 justify-between shrink-0 text-[10px] font-bold tracking-widest">
        <span className={`${errorMsg ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`}>{errorMsg || "SISTEMA PRONTO"}</span>
        <div className="flex gap-4 text-indigo-500"><span>V 1.0.0</span><span>BRAZIL 🇧🇷</span></div>
      </footer>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Pagamento">
         <div className="space-y-4">
            <div className="text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
               <p className="text-indigo-500 text-xs font-bold uppercase tracking-widest">Total</p>
               <p className="text-4xl font-black text-indigo-600 font-mono">R${cartTotal.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {activePaymentMethods.map(method => (
                  <button key={method.id} onClick={() => handlePayment(method.label)} className="p-4 bg-white border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all text-gray-700 font-black text-sm uppercase">
                     {method.label}
                  </button>
               ))}
            </div>
         </div>
      </Modal>

      <Modal isOpen={isCloseRegisterModalOpen} onClose={() => setIsCloseRegisterModalOpen(false)} title="Fechar Caixa">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Informe o valor total em dinheiro na gaveta para auditoria cega.</p>
          <input type="number" className="w-full border p-4 rounded-2xl text-2xl font-black text-center outline-none focus:ring-2 focus:ring-indigo-600" value={closeRegisterAmount} onChange={(e)=>setCloseRegisterAmount(e.target.value)} placeholder="0.00" autoFocus />
          <button onClick={handleCloseRegister} className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">Encerrar Sessão</button>
        </div>
      </Modal>
    </div>
  );
};

export default POS;
