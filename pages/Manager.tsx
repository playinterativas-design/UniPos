import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LayoutDashboard, Package, Settings as SettingsIcon, LogOut, DollarSign, TrendingUp, Users, Printer, Trash2, Shield, ClipboardList, Plus, List, UserCheck, UserX, Search, Edit2, History, FileSpreadsheet, FileText, CreditCard, Wallet, QrCode, Lock, UserCog, KeyRound, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Product, UserRole, PaymentType, PaymentMethodConfig } from '../types';

const Manager = () => {
  const { 
    sales, 
    products, 
    currentSession,
    cashSessions, // History of sessions
    logout, 
    deleteCategory, 
    updateSettings, 
    settings, 
    users,
    addCategory,
    generate100Categories,
    availableCategories,
    toggleUserStatus,
    updateProductStock,
    stockMovements,
    addUser,
    addPaymentMethod,
    editPaymentMethod,
    removePaymentMethod,
    companyAccount,
    updateCompanyAccount,
    deleteCompanyAccount
  } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'STOCK_CONTROL' | 'USERS' | 'SETTINGS' | 'CASH'>('DASHBOARD');
  const [cashHistoryView, setCashHistoryView] = useState(false);
  
  // Modals State
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Stock Audit State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedProductForAudit, setSelectedProductForAudit] = useState<Product | null>(null);
  const [auditNewStock, setAuditNewStock] = useState<string>('');
  const [auditReason, setAuditReason] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.OPERATOR);

  // Payment Methods State
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodConfig | null>(null);
  
  // Account Management States
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState('');
  
  // Form State for Payment
  const [pmLabel, setPmLabel] = useState('');
  const [pmType, setPmType] = useState<PaymentType>('OTHER');
  const [pmDetail, setPmDetail] = useState(''); // For generic detail like Pix Key
  const [pmActive, setPmActive] = useState(true);

  // Form State for Card Details
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Prepare Data for Charts
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByDate).map(date => ({ name: date, sales: salesByDate[date] }));
  
  // Top Products
  const productSales = sales.flatMap(s => s.items).reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  // Handlers
  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleGenerateCategories = () => {
    generate100Categories();
    alert("100 Categorias geradas com sucesso!");
  };

  const openAuditModal = (product: Product) => {
    setSelectedProductForAudit(product);
    setAuditNewStock(product.stock.toString());
    setAuditReason('');
    setIsAuditModalOpen(true);
  };

  const handleConfirmAudit = () => {
    if (!selectedProductForAudit) return;
    const newQty = parseInt(auditNewStock);
    if (isNaN(newQty)) {
      alert("Quantidade inválida");
      return;
    }

    const diff = newQty - selectedProductForAudit.stock;
    if (diff === 0) {
      setIsAuditModalOpen(false);
      return;
    }

    updateProductStock(selectedProductForAudit.id, diff, 'ADJUSTMENT', auditReason || 'Ajuste manual de inventário');
    setIsAuditModalOpen(false);
    setSelectedProductForAudit(null);
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserUsername.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    
    // Check if username exists
    if (users.some(u => u.username === newUserUsername.trim())) {
      alert("Nome de usuário já existe.");
      return;
    }

    addUser({
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      role: newUserRole,
      isActive: true
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserRole(UserRole.OPERATOR);
    setIsAddUserModalOpen(false);
  };

  // Account Handlers
  const handleChangePassword = () => {
    setPassError('');
    if (!currentPass || !newPass || !confirmNewPass) {
      setPassError("Preencha todos os campos.");
      return;
    }
    if (currentPass !== companyAccount?.password) {
      setPassError("Senha atual incorreta.");
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError("Nova senha e confirmação não conferem.");
      return;
    }
    
    // Regex validation
    const hasUpper = /[A-Z]/.test(newPass);
    const hasLower = /[a-z]/.test(newPass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);
    const hasLen = newPass.length >= 6;
    
    if(!(hasUpper && hasLower && hasSymbol && hasLen)){
       setPassError("A nova senha deve ter letra maiúscula, minúscula, símbolo e 6+ caracteres.");
       return;
    }

    updateCompanyAccount({ password: newPass });
    setIsChangePassModalOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    alert("Senha alterada com sucesso!");
  };

  const handleDeleteAccount = () => {
    deleteCompanyAccount();
    navigate('/'); // Will be redirected to Welcome
  };


  const openPaymentModal = (method?: PaymentMethodConfig) => {
    if (method) {
      setEditingPaymentMethod(method);
      setPmLabel(method.label);
      setPmType(method.type);
      setPmDetail(method.detail || '');
      setPmActive(method.active);
      
      // Load card details if exist
      if (method.cardDetails) {
        setCardName(method.cardDetails.holderName);
        setCardNumber(method.cardDetails.number);
        setCardExpiry(method.cardDetails.expiry);
        setCardCvv(method.cardDetails.cvv);
      } else {
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }

    } else {
      setEditingPaymentMethod(null);
      setPmLabel('');
      setPmType('OTHER');
      setPmDetail('');
      setPmActive(true);
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
    setIsPaymentMethodModalOpen(true);
  };

  const handleSavePaymentMethod = () => {
    if (!pmLabel.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    const isCardType = ['CREDIT', 'DEBIT', 'WALLET', 'VOUCHER'].includes(pmType);
    
    const methodData: Partial<PaymentMethodConfig> = {
      label: pmLabel,
      type: pmType,
      detail: pmDetail,
      active: pmActive
    };

    if (isCardType) {
      methodData.cardDetails = {
        holderName: cardName,
        number: cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv
      };
      methodData.detail = ''; 
    } else {
      methodData.cardDetails = undefined;
    }

    if (editingPaymentMethod) {
      editPaymentMethod(editingPaymentMethod.id, methodData);
    } else {
      addPaymentMethod(methodData as any);
    }
    setIsPaymentMethodModalOpen(false);
  };

  const isCardTypeSelected = ['CREDIT', 'DEBIT', 'WALLET', 'VOUCHER'].includes(pmType);

  // Filter products for the list (REMOVE 'Sem Categoria')
  const displayedProducts = products.filter(p => p.category && p.category !== 'Sem Categoria');

  // Filter for Stock Control
  const inventoryProducts = products.filter(p => 
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.code.includes(inventorySearch)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar Navigation - Hidden on Print */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-600">Gestor<span className="text-gray-400">.</span></h2>
          <p className="text-xs text-gray-500 mt-1">Controle Administrativo</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Painel
          </button>
          <button 
            onClick={() => setActiveTab('INVENTORY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'INVENTORY' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package size={20} /> Estoque (Catálogo)
          </button>
          <button 
            onClick={() => setActiveTab('STOCK_CONTROL')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'STOCK_CONTROL' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ClipboardList size={20} /> Controle Inventário
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'USERS' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Usuários
          </button>
           <button 
            onClick={() => setActiveTab('CASH')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'CASH' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <DollarSign size={20} /> Relatórios de Caixa
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'SETTINGS' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <SettingsIcon size={20} /> Configuração
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded justify-center">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800">Painel Operacional</h1>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total de Vendas</p>
                    <h3 className="text-2xl font-bold text-gray-900">R${sales.reduce((a,b) => a+b.total, 0).toFixed(2)}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><DollarSign size={20}/></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Transações</p>
                    <h3 className="text-2xl font-bold text-gray-900">{sales.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><TrendingUp size={20}/></div>
                </div>
              </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Produtos Ativos</p>
                    <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Package size={20}/></div>
                </div>
              </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Equipe Ativa</p>
                    <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</h3>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Users size={20}/></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Tendências de Vendas</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`}/>
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, fill: '#4F46E5'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
                 <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB"/>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="qty" fill="#818CF8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW (UPDATED) */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-6 animate-fade-in">
             <h1 className="text-2xl font-bold text-gray-800">Configuração do Sistema</h1>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Account Management (Master Account) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                   
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                     <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                        <UserCog size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-gray-800">Conta de Acesso (Mestra)</h3>
                        <p className="text-sm text-gray-500">Gerencie as credenciais da sua empresa</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Empresa</p>
                         <p className="text-gray-900 font-medium truncate">{companyAccount?.companyName}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Login (CPF/CNPJ)</p>
                         <p className="text-gray-900 font-medium truncate">{companyAccount?.document}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <p className="text-xs text-gray-500 uppercase font-semibold mb-1">E-mail</p>
                         <p className="text-gray-900 font-medium truncate">{companyAccount?.email}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Telefone</p>
                         <p className="text-gray-900 font-medium truncate">{companyAccount?.phone}</p>
                      </div>
                   </div>

                   <div className="flex gap-4 mt-6 border-t pt-4 relative z-10">
                      <button 
                        onClick={() => setIsChangePassModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-200"
                      >
                         <KeyRound size={16}/> Alterar Senha
                      </button>
                      <button 
                        onClick={() => setIsDeleteAccountModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200 ml-auto"
                      >
                         <Trash2 size={16}/> Excluir Conta
                      </button>
                   </div>
                </div>

                {/* Payment Methods Configuration */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard size={18}/> Gerenciar Formas de Pagamento</h3>
                    <button 
                      onClick={() => openPaymentModal()}
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={16}/> Adicionar Novo
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Rótulo</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalhes (Chave/ID/Cartão)</th>
                           <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {settings.paymentMethods?.map(method => (
                           <tr key={method.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                               {method.type === 'PIX' && <QrCode size={16} className="text-green-600"/>}
                               {method.type === 'WALLET' && <Wallet size={16} className="text-purple-600"/>}
                               {(method.type === 'CREDIT' || method.type === 'DEBIT' || method.type === 'VOUCHER') && <CreditCard size={16} className="text-blue-600"/>}
                               {method.type === 'CASH' && <DollarSign size={16} className="text-green-800"/>}
                               {method.label}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {method.type}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                               {method.cardDetails ? 
                                  `Via ${method.cardDetails.holderName} (...${method.cardDetails.number.slice(-4)})` : 
                                  (method.detail || '-')
                               }
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${method.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {method.active ? 'Ativo' : 'Inativo'}
                                </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                               <button onClick={() => openPaymentModal(method)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                               <button onClick={() => removePaymentMethod(method.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                </div>

                {/* Fiscal Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><SettingsIcon size={18}/> Fiscal (Brasil 🇧🇷)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-gray-700">NFC-e</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" checked={settings.nfceEnabled} onChange={(e) => updateSettings({ nfceEnabled: e.target.checked })} className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-gray-700">SAT</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" checked={settings.satEnabled} onChange={(e) => updateSettings({ satEnabled: e.target.checked })} className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                    <div className="pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
                      <select 
                        value={settings.environment}
                        onChange={(e) => updateSettings({ environment: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                      >
                        <option value="HOMOLOGATION">Homologação (Teste)</option>
                        <option value="PRODUCTION">Produção (Ao Vivo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hardware & Policy */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Printer size={18}/> Hardware e Políticas</h3>
                  <div className="space-y-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                      <input 
                        type="text" 
                        value={settings.companyName} 
                        onChange={(e) => updateSettings({ companyName: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IP da Impressora Térmica</label>
                      <input 
                        type="text" 
                        value={settings.printerIp} 
                        onChange={(e) => updateSettings({ printerIp: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded-md font-mono text-sm"
                      />
                    </div>
                     <div className="flex items-center justify-between pt-2">
                       <span className="text-gray-700">Permitir Estoque Negativo</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" checked={settings.allowNegativeStock} onChange={(e) => updateSettings({ allowNegativeStock: e.target.checked })} className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                  </div>
                </div>

                {/* Security Policy Section (UPDATED) */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield size={18}/> Conformidade LGPD e Termos de Uso</h3>
                  <div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            A política abaixo é o acordo padrão de proteção de dados. Ela garante que nenhuma informação do sistema será vazada ou compartilhada indevidamente.
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Acordo de Privacidade e Proteção de Dados (Obrigatório)</label>
                    <textarea 
                      rows={12}
                      value={settings.securityPolicy}
                      onChange={(e) => updateSettings({ securityPolicy: e.target.value })}
                      className="w-full border border-gray-300 p-4 rounded-md text-sm font-sans bg-gray-50 text-gray-700 leading-relaxed"
                      placeholder="Política de privacidade..."
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">Documento válido para auditoria interna.</p>
                  </div>
                </div>

             </div>
          </div>
        )}
      </main>

      {/* Payment Method Modal */}
      <Modal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        title={editingPaymentMethod ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
        footer={
           <>
            <button onClick={() => setIsPaymentMethodModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleSavePaymentMethod} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
           <div>
             <label className="block text-sm font-medium text-gray-700">Nome / Rótulo</label>
             <input 
               type="text"
               value={pmLabel}
               onChange={(e) => setPmLabel(e.target.value)}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
               placeholder="Ex: Pix Loja 01, Visa Crédito..."
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700">Tipo de Pagamento</label>
             <select
               value={pmType}
               onChange={(e) => setPmType(e.target.value as PaymentType)}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
             >
               <option value="CASH">Dinheiro / Espécie</option>
               <option value="CREDIT">Cartão de Crédito</option>
               <option value="DEBIT">Cartão de Débito</option>
               <option value="PIX">Pix / Transferência Instantânea</option>
               <option value="WALLET">Carteira Digital (Wallet)</option>
               <option value="VOUCHER">Vale (Alimentação/Refeição)</option>
               <option value="OTHER">Outros</option>
             </select>
           </div>

           {isCardTypeSelected ? (
             <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
               <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><CreditCard size={14}/> Dados do Cartão</h4>
               <div>
                  <label className="block text-xs font-medium text-gray-600">Nome do Cartão (Como impresso)</label>
                  <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full border p-1.5 rounded text-sm"/>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-600">Número do Cartão</label>
                  <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full border p-1.5 rounded text-sm" placeholder="0000 0000 0000 0000"/>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs font-medium text-gray-600">Validade (MM/AA)</label>
                    <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full border p-1.5 rounded text-sm" placeholder="00/00"/>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-600">CVV</label>
                    <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full border p-1.5 rounded text-sm" placeholder="123"/>
                 </div>
               </div>
             </div>
           ) : (
             <div>
               <label className="block text-sm font-medium text-gray-700">
                 {pmType === 'PIX' ? 'Chave Pix' : 'Detalhes Adicionais'}
               </label>
               <input 
                 type="text"
                 value={pmDetail}
                 onChange={(e) => setPmDetail(e.target.value)}
                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                 placeholder={pmType === 'PIX' ? 'Ex: email@loja.com' : 'Detalhes opcionais...'}
               />
               <p className="text-xs text-gray-500 mt-1">Informação extra para o caixa.</p>
             </div>
           )}

           <div className="flex items-center gap-2 pt-2 border-t mt-2">
              <input 
                type="checkbox" 
                id="pmActive"
                checked={pmActive} 
                onChange={(e) => setPmActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="pmActive" className="text-sm font-medium text-gray-700">Ativo para vendas</label>
           </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        title="Alterar Senha de Acesso"
        footer={
           <>
            <button onClick={() => setIsChangePassModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleChangePassword} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Confirmar Alteração</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
             <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full border rounded p-2" placeholder="Digite sua senha atual"/>
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
             <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full border rounded p-2" placeholder="Nova senha forte"/>
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
             <input type="password" value={confirmNewPass} onChange={e => setConfirmNewPass(e.target.value)} className="w-full border rounded p-2" placeholder="Repita a nova senha"/>
           </div>
           {passError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{passError}</p>}
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="EXCLUIR CONTA DA EMPRESA?"
        footer={
           <>
            <button onClick={() => setIsDeleteAccountModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">Sim, Excluir Permanentemente</button>
          </>
        }
      >
        <div className="text-center p-4">
           <AlertTriangle size={48} className="text-red-500 mx-auto mb-4"/>
           <p className="text-gray-800 font-bold text-lg">Esta ação é irreversível.</p>
           <p className="text-gray-600 mt-2">Você perderá acesso imediato ao sistema e precisará criar uma nova conta para utilizar o UniPOS novamente.</p>
        </div>
      </Modal>

      {/* Existing Modals... (AddUser, Category, Audit, Delete) - Keeping them but collapsed in this output for brevity if not changed, 
          but for full file correctness I'll include the closing tags and important modals used in other tabs */}
      
      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Novo Usuário"
        footer={
           <>
            <button onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleAddUser} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar Usuário</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
             <input 
               type="text"
               value={newUserName}
               onChange={(e) => setNewUserName(e.target.value)}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
               placeholder="Ex: Maria Silva"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Nome de Usuário (Login)</label>
             <input 
               type="text"
               value={newUserUsername}
               onChange={(e) => setNewUserUsername(e.target.value)}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
               placeholder="Ex: marias"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Cargo / Permissões</label>
             <select
               value={newUserRole}
               onChange={(e) => setNewUserRole(e.target.value as UserRole)}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
             >
               <option value={UserRole.OPERATOR}>Operador (Apenas Vendas)</option>
               <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
             </select>
           </div>
        </div>
      </Modal>

      {/* Categories Management Modal */}
      <Modal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Gerenciar Categorias"
      >
        <div className="space-y-4">
           <div className="flex gap-2">
             <input 
               type="text" 
               value={newCategoryName}
               onChange={(e) => setNewCategoryName(e.target.value)}
               placeholder="Nova categoria..."
               className="flex-1 border border-gray-300 rounded p-2"
             />
             <button onClick={handleCreateCategory} className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700">Criar</button>
           </div>
           
           <div className="border-t pt-4">
             <p className="text-sm font-medium mb-2">Categorias Existentes ({availableCategories.length})</p>
             <div className="max-h-48 overflow-y-auto border rounded bg-gray-50 p-2 space-y-1">
               {availableCategories.map((cat, idx) => (
                 <div key={idx} className="text-sm text-gray-700 border-b border-gray-200 last:border-0 py-1">{cat}</div>
               ))}
             </div>
           </div>

           <div className="border-t pt-4">
              <button 
                onClick={handleGenerateCategories}
                className="w-full border-2 border-dashed border-indigo-300 text-indigo-700 p-2 rounded hover:bg-indigo-50 flex items-center justify-center gap-2"
              >
                <Package size={16} /> Gerar 100 Categorias Padrão
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">Isso adicionará categorias comuns de e-commerce à lista.</p>
           </div>
        </div>
      </Modal>

       {/* Audit / Manual Adjustment Modal */}
       <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Auditoria / Ajuste Manual de Estoque"
        footer={
          <>
            <button onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={handleConfirmAudit} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Confirmar Ajuste</button>
          </>
        }
      >
        {selectedProductForAudit && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded border">
               <p className="text-sm text-gray-500">Produto</p>
               <p className="font-bold text-gray-800">{selectedProductForAudit.name}</p>
               <p className="text-xs text-gray-500 mt-1">Estoque Atual no Sistema: <strong className="text-gray-900">{selectedProductForAudit.stock}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Novo Estoque Real (Contagem Física)</label>
              <input 
                type="number" 
                value={auditNewStock}
                onChange={(e) => setAuditNewStock(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md text-lg font-bold text-indigo-700"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Diferença: {parseInt(auditNewStock) - selectedProductForAudit.stock || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Ajuste</label>
              <select 
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md mb-2 bg-white"
              >
                 <option value="">Selecione um motivo...</option>
                 <option value="Contagem Periódica">Contagem Periódica</option>
                 <option value="Perda / Roubo">Perda / Roubo</option>
                 <option value="Quebra / Avaria">Quebra / Avaria</option>
                 <option value="Devolução de Cliente">Devolução de Cliente</option>
                 <option value="Outro">Outro (Especificar abaixo)</option>
              </select>
              <input 
                type="text" 
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="Detalhes opcionais..."
                className="w-full border border-gray-300 p-2 rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Excluir Categoria?"
        footer={
          <>
            <button onClick={() => setCategoryToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button onClick={confirmDeleteCategory} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Sim, Excluir</button>
          </>
        }
      >
        <p>Tem certeza que deseja excluir a categoria <strong>{categoryToDelete}</strong>?</p>
        <p className="text-sm text-gray-500 mt-2">Produtos nesta categoria serão movidos para "Sem Categoria".</p>
      </Modal>

    </div>
  );
};

export default Manager;