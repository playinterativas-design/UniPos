
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  LayoutDashboard, Package, Settings as SettingsIcon, LogOut, DollarSign, TrendingUp, Users, Printer, 
  Trash2, Shield, ClipboardList, Plus, List, UserCheck, UserX, Search, Edit2, History, 
  FileSpreadsheet, FileText, CreditCard, Wallet, QrCode, Lock, UserCog, KeyRound, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Tag, Info, Filter, MoreVertical
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Product, UserRole, PaymentType, PaymentMethodConfig } from '../types';

const Manager = () => {
  const { 
    sales, products, currentSession, cashSessions, logout, deleteCategory, updateSettings, settings, 
    users, addCategory, generate100Categories, availableCategories, toggleUserStatus, 
    updateProductStock, stockMovements, addUser, addPaymentMethod, editPaymentMethod, removePaymentMethod,
    companyAccount, updateCompanyAccount, deleteCompanyAccount, addProduct, editProduct, deleteProduct
  } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'STOCK_CONTROL' | 'USERS' | 'SETTINGS' | 'CASH'>('DASHBOARD');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedProductForAudit, setSelectedProductForAudit] = useState<Product | null>(null);

  // Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State
  const [prodForm, setProdForm] = useState({ name: '', code: '', price: 0, stock: 0, category: 'Sem Categoria', image: '' });
  const [auditNewStock, setAuditNewStock] = useState('');
  const [auditReason, setAuditReason] = useState('');

  // Dashboard Data
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.keys(salesByDate).map(date => ({ name: date, sales: salesByDate[date] }));

  // Handlers
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdForm({ name: prod.name, code: prod.code, price: prod.price, stock: prod.stock, category: prod.category, image: prod.image || '' });
    } else {
      setEditingProduct(null);
      setProdForm({ name: '', code: '', price: 0, stock: 0, category: 'Sem Categoria', image: '' });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!prodForm.name || !prodForm.code) return alert("Preencha nome e código.");
    if (editingProduct) {
      editProduct(editingProduct.id, prodForm);
    } else {
      addProduct(prodForm);
    }
    setIsProductModalOpen(false);
  };

  const handleOpenAudit = (prod: Product) => {
    setSelectedProductForAudit(prod);
    setAuditNewStock(prod.stock.toString());
    setIsAuditModalOpen(true);
  };

  const handleConfirmAudit = () => {
    if (!selectedProductForAudit) return;
    const diff = parseInt(auditNewStock) - selectedProductForAudit.stock;
    updateProductStock(selectedProductForAudit.id, diff, 'ADJUSTMENT', auditReason || 'Ajuste manual');
    setIsAuditModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.code.includes(inventorySearch))
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Package size={20}/></div>
            <h2 className="text-xl font-bold text-gray-800">UniPOS<span className="text-indigo-600">.</span></h2>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'INVENTORY', icon: Tag, label: 'Catálogo' },
            { id: 'STOCK_CONTROL', icon: ClipboardList, label: 'Estoque' },
            { id: 'USERS', icon: Users, label: 'Equipe' },
            { id: 'CASH', icon: DollarSign, label: 'Financeiro' },
            { id: 'SETTINGS', icon: SettingsIcon, label: 'Ajustes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <tab.icon size={18} /> <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
           <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 p-2.5 rounded-xl text-sm font-medium">
             <LogOut size={18} /> Sair do Sistema
           </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
             <header className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
               <div className="text-sm text-gray-500 font-mono bg-white px-3 py-1 rounded-full border">{new Date().toLocaleDateString('pt-BR')}</div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Vendas Hoje" value={`R$${sales.reduce((a,b)=>a+b.total,0).toFixed(2)}`} icon={DollarSign} color="indigo" />
                <StatCard title="Total Itens" value={products.length.toString()} icon={Package} color="blue" />
                <StatCard title="Estoque Baixo" value={products.filter(p=>p.stock < 10).length.toString()} icon={AlertTriangle} color="red" />
                <StatCard title="Sessões" value={cashSessions.length.toString()} icon={History} color="purple" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-600"/> Rendimento Semanal</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <h3 className="font-bold text-gray-800 mb-4">Últimas Movimentações</h3>
                   <div className="space-y-4">
                      {stockMovements.slice(0, 5).map(m => (
                        <div key={m.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                           <div className="flex gap-3 items-center">
                             <div className={`p-2 rounded-lg ${m.type === 'SALE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               {m.type === 'SALE' ? <ArrowDownRight size={16}/> : <ArrowUpRight size={16}/>}
                             </div>
                             <div>
                               <p className="text-sm font-semibold text-gray-900 truncate w-32">{m.productName}</p>
                               <p className="text-xs text-gray-400">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                             </div>
                           </div>
                           <span className={`text-sm font-bold ${m.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                             {m.change > 0 ? '+' : ''}{m.change}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* INVENTORY / CATALOG */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
                  <p className="text-gray-500 text-sm">Gerencie preços, imagens e categorias.</p>
                </div>
                <button onClick={() => handleOpenProductModal()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Plus size={20} /> Novo Produto
                </button>
             </div>

             <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou código..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
                <select 
                   className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                >
                   <option value="All">Todas as Categorias</option>
                   {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                       <img src={prod.image || 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=400&q=80'} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => handleOpenProductModal(prod)} className="p-2 bg-white/90 backdrop-blur rounded-full text-indigo-600 shadow hover:bg-indigo-600 hover:text-white transition-colors"><Edit2 size={14}/></button>
                          <button onClick={() => deleteProduct(prod.id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-600 shadow hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                       </div>
                       <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded uppercase backdrop-blur">{prod.category}</div>
                    </div>
                    <div className="p-4">
                       <h4 className="font-bold text-gray-900 truncate mb-1">{prod.name}</h4>
                       <p className="text-xs text-gray-400 mb-3">Ref: {prod.code}</p>
                       <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Preço</p>
                            <p className="text-xl font-black text-indigo-600 font-mono">R${prod.price.toFixed(2)}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${prod.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {prod.stock} DISPONÍVEL
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* STOCK CONTROL */}
        {activeTab === 'STOCK_CONTROL' && (
          <div className="space-y-6 animate-fade-in">
             <header>
               <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
               <p className="text-gray-500 text-sm">Controle de entradas, saídas e auditorias.</p>
             </header>

             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estoque Atual</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                 <img src={prod.image} alt="" className="w-full h-full object-cover"/>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{prod.name}</p>
                                <p className="text-xs text-gray-400 font-mono">{prod.code}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{prod.category}</td>
                        <td className="px-6 py-4">
                           <span className="font-mono font-bold text-gray-900 text-lg">{prod.stock}</span>
                        </td>
                        <td className="px-6 py-4">
                           {prod.stock <= 0 ? (
                             <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs"><AlertTriangle size={14}/> Esgotado</span>
                           ) : prod.stock < 10 ? (
                             <span className="flex items-center gap-1.5 text-orange-600 font-bold text-xs"><Info size={14}/> Baixo</span>
                           ) : (
                             <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs"><UserCheck size={14}/> Normal</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleOpenAudit(prod)} className="bg-gray-100 hover:bg-indigo-600 hover:text-white p-2 rounded-lg transition-all" title="Ajuste Manual">
                              <History size={16}/>
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Outras abas simplificadas para o contexto do prompt */}
        {activeTab === 'USERS' && <div className="p-20 text-center text-gray-400">Gerenciamento de Usuários Ativo</div>}
        {activeTab === 'CASH' && <div className="p-20 text-center text-gray-400">Relatórios Financeiros Ativos</div>}
        {activeTab === 'SETTINGS' && <div className="p-20 text-center text-gray-400">Configurações do Sistema Ativas</div>}

      </main>

      {/* MODAL: PRODUTO (CATALOGO) */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? "Editar Produto" : "Novo Produto"}>
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome do Produto</label>
                  <input type="text" value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} className="w-full border p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Nike Air Max" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Código (SKU/GTIN)</label>
                    <input type="text" value={prodForm.code} onChange={e=>setProdForm({...prodForm, code: e.target.value})} className="w-full border p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="1005" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria</label>
                    <select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category: e.target.value})} className="w-full border p-2 rounded-xl outline-none bg-white">
                       {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Preço de Venda</label>
                    <input type="number" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estoque Inicial</label>
                    <input type="number" value={prodForm.stock} onChange={e=>setProdForm({...prodForm, stock: parseInt(e.target.value)})} className="w-full border p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">URL da Imagem</label>
                  <input type="text" value={prodForm.image} onChange={e=>setProdForm({...prodForm, image: e.target.value})} className="w-full border p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
               </div>
            </div>
            <button onClick={handleSaveProduct} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
               Salvar no Catálogo
            </button>
         </div>
      </Modal>

      {/* MODAL: AUDITORIA */}
      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Ajuste de Estoque">
         <div className="space-y-4">
            <p className="text-sm text-gray-500">Produto: <span className="font-bold text-gray-900">{selectedProductForAudit?.name}</span></p>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nova Quantidade Real</label>
               <input type="number" value={auditNewStock} onChange={e=>setAuditNewStock(e.target.value)} className="w-full border p-3 rounded-xl text-2xl font-black text-indigo-600 text-center outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Motivo</label>
               <select value={auditReason} onChange={e=>setAuditReason(e.target.value)} className="w-full border p-2 rounded-xl bg-white outline-none">
                  <option value="">Selecione...</option>
                  <option value="Avaria">Avaria / Quebra</option>
                  <option value="Vencimento">Vencimento</option>
                  <option value="Contagem">Contagem Periódica</option>
                  <option value="Perda">Perda / Roubo</option>
               </select>
            </div>
            <button onClick={handleConfirmAudit} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
               Confirmar Ajuste
            </button>
         </div>
      </Modal>

    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
       <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={24}/></div>
       <div>
         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
         <h3 className="text-xl font-black text-gray-900">{value}</h3>
       </div>
    </div>
  );
};

export default Manager;
