import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, UserRole, CashSession, Sale, Settings, CartItem, StockMovement, PaymentMethodConfig, CompanyAccount } from '../types';

// Mock Data Translated
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: '1001', name: 'Camiseta Algodão Premium', price: 49.90, stock: 50, category: 'Roupas', image: 'https://picsum.photos/200' },
  { id: '2', code: '1002', name: 'Tênis de Corrida', price: 299.90, stock: 12, category: 'Calçados', image: 'https://picsum.photos/201' },
  { id: '3', code: '1003', name: 'Colar de Prata', price: 150.00, stock: 5, category: 'Joias', image: 'https://picsum.photos/202' },
  { id: '4', code: '1004', name: 'Combo X-Burguer', price: 35.00, stock: 100, category: 'Alimentação', image: 'https://picsum.photos/203' },
  { id: '5', code: '9999', name: 'Produto Teste Sem Categoria', price: 10.00, stock: 10, category: 'Sem Categoria', image: 'https://picsum.photos/204' },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Administrador', username: 'admin', role: UserRole.ADMIN, isActive: true },
  { id: '2', name: 'Operador João', username: 'op1', role: UserRole.OPERATOR, isActive: true },
  { id: '3', name: 'Operadora Maria', username: 'op2', role: UserRole.OPERATOR, isActive: false },
];

// Base categories to start with
const INITIAL_CATEGORIES = ['Roupas', 'Calçados', 'Joias', 'Alimentação', 'Bebidas', 'Eletrônicos', 'Casa', 'Sem Categoria'];

// Texto Padrão LGPD
const DEFAULT_SECURITY_POLICY = `TERMOS DE USO E POLÍTICA DE PROTEÇÃO DE DADOS (LGPD)

1. COMPROMISSO DE SEGURANÇA E CONFIDENCIALIDADE
Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o sistema UniPOS garante a proteção integral dos dados processados. Fica estritamente vedado o vazamento, a comercialização ou o compartilhamento não autorizado de quaisquer dados inseridos nesta plataforma (dados de vendas, estoque, clientes ou financeiros).

2. FINALIDADE E USO DOS DADOS
Os dados coletados destinam-se única e exclusivamente à operacionalização do ponto de venda, emissão de documentos fiscais e controle gerencial. Nenhuma informação será utilizada para fins publicitários de terceiros sem consentimento expresso.

3. DIREITOS DO TITULAR E PROPRIEDADE
A empresa contratante detém a propriedade intelectual e comercial de todos os registros gerados. O sistema assegura o direito de acesso, correção, anonimização ou exclusão dos dados mediante solicitação do titular, garantindo transparência total no tratamento das informações.

4. SEGURANÇA DA INFORMAÇÃO
Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão. O acesso ao sistema é pessoal, intransferível e monitorado via logs de auditoria.`;

interface StoreContextType {
  // Company Auth
  companyAccount: CompanyAccount | null;
  isCompanyAuthenticated: boolean;
  registerCompany: (data: CompanyAccount) => void;
  loginCompany: (identifier: string, password: string) => boolean;
  logoutCompany: () => void;
  recoverCompanyPassword: (email: string) => boolean;
  updateCompanyAccount: (updates: Partial<CompanyAccount>) => void;
  deleteCompanyAccount: () => void;

  // App Data
  products: Product[];
  users: User[];
  currentUser: User | null;
  currentSession: CashSession | null;
  cashSessions: CashSession[]; // History
  sales: Sale[];
  settings: Settings;
  stockMovements: StockMovement[];
  availableCategories: string[];
  
  // Actions
  login: (username: string, password: string) => boolean; // Operator login
  logout: () => void;
  openCashier: (startValue: number) => void;
  closeCashier: (endValue: number) => { difference: number, closedSession: CashSession };
  processSale: (items: CartItem[], paymentMethod: string) => boolean;
  updateProductStock: (id: string, qtyChange: number, type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN', reason?: string) => void;
  deleteCategory: (category: string) => void;
  addCategory: (category: string) => void;
  generate100Categories: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  
  // Payment Method Actions
  addPaymentMethod: (method: Omit<PaymentMethodConfig, 'id'>) => void;
  editPaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => void;
  removePaymentMethod: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Company Auth State ---
  const [companyAccount, setCompanyAccount] = useState<CompanyAccount | null>(null);
  const [isCompanyAuthenticated, setIsCompanyAuthenticated] = useState(false);

  // --- App State ---
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [availableCategories, setAvailableCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [settings, setSettings] = useState<Settings>({
    companyName: 'Loja Universal',
    nfceEnabled: true,
    satEnabled: false,
    environment: 'HOMOLOGATION',
    printerIp: '192.168.1.100',
    allowNegativeStock: false,
    securityPolicy: DEFAULT_SECURITY_POLICY,
    paymentMethods: [
      { id: 'CASH', label: 'Dinheiro', type: 'CASH', active: true, detail: '' },
      { id: 'DEBIT', label: 'Débito', type: 'DEBIT', active: true, detail: '' },
      { id: 'CREDIT', label: 'Crédito', type: 'CREDIT', active: true, detail: '' },
      { id: 'PIX', label: 'Pix', type: 'PIX', active: true, detail: '' },
    ]
  });

  // Load Data
  useEffect(() => {
    // Load Company Data
    const savedCompany = localStorage.getItem('companyAccount');
    if (savedCompany) {
      setCompanyAccount(JSON.parse(savedCompany));
      // Note: We do NOT automatically set isCompanyAuthenticated to true
      // The user must login every time the page refreshes for security in this demo,
      // OR we could check sessionStorage. Let's keep it secure: require login on refresh.
    }

    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) setCurrentSession(JSON.parse(savedSession));

    const savedHistory = localStorage.getItem('cashSessions');
    if (savedHistory) setCashSessions(JSON.parse(savedHistory));
    
    const savedSales = localStorage.getItem('sales');
    if (savedSales) setSales(JSON.parse(savedSales));

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) setAvailableCategories(JSON.parse(savedCategories));
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedMovements = localStorage.getItem('stockMovements');
    if (savedMovements) setStockMovements(JSON.parse(savedMovements));
    
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsedSettings }));
    }
  }, []);

  // Persist Data
  useEffect(() => {
    if (companyAccount) localStorage.setItem('companyAccount', JSON.stringify(companyAccount));
  }, [companyAccount]);

  useEffect(() => {
    if (currentSession) localStorage.setItem('currentSession', JSON.stringify(currentSession));
    else localStorage.removeItem('currentSession');
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem('cashSessions', JSON.stringify(cashSessions));
  }, [cashSessions]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);
  
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(availableCategories));
  }, [availableCategories]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('stockMovements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // --- Company Auth Logic ---

  const registerCompany = (data: CompanyAccount) => {
    setCompanyAccount(data);
    setIsCompanyAuthenticated(true); // Auto login on register
    // Also update settings company name
    setSettings(prev => ({ ...prev, companyName: data.companyName }));
  };

  const loginCompany = (identifier: string, password: string) => {
    if (!companyAccount) return false;
    
    // Check password
    if (password !== companyAccount.password) return false;

    // Check identifier (Email, CPF, or CNPJ)
    const isEmail = companyAccount.email === identifier;
    const isDoc = companyAccount.document.replace(/\D/g, '') === identifier.replace(/\D/g, '');

    if (isEmail || isDoc) {
      setIsCompanyAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutCompany = () => {
    setIsCompanyAuthenticated(false);
    setCurrentUser(null); // Also logout operator
  };

  const recoverCompanyPassword = (email: string) => {
    if (companyAccount && companyAccount.email === email) {
      return true; // Simulate success
    }
    return false;
  };

  const updateCompanyAccount = (updates: Partial<CompanyAccount>) => {
    if (!companyAccount) return;
    const updated = { ...companyAccount, ...updates };
    setCompanyAccount(updated);
    
    // Sync company name with settings if changed
    if (updates.companyName) {
      setSettings(prev => ({ ...prev, companyName: updates.companyName! }));
    }
  };

  const deleteCompanyAccount = () => {
    setCompanyAccount(null);
    setIsCompanyAuthenticated(false);
    localStorage.removeItem('companyAccount');
    // Note: In a real app we might wipe all data, but here we just wipe the account
    // effectively locking the user out until they register new.
  };

  // --- Operator Auth Logic ---
  const login = (username: string, _pass: string) => {
    const user = users.find(u => u.username === username && u.isActive);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- POS Logic ---
  const openCashier = (startValue: number) => {
    if (!currentUser) return;
    const newSession: CashSession = {
      id: Date.now().toString(),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      openedAt: new Date().toISOString(),
      startValue,
      salesTotal: 0,
      status: 'OPEN'
    };
    setCurrentSession(newSession);
  };

  const closeCashier = (endValue: number) => {
    if (!currentSession) throw new Error("No active session");
    const expected = currentSession.startValue + currentSession.salesTotal;
    const difference = endValue - expected;

    const closedSession: CashSession = {
      ...currentSession,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      endValue,
      difference
    };

    setCashSessions(prev => [closedSession, ...prev]);
    setCurrentSession(null);
    return { difference, closedSession };
  };

  const updateProductStock = (id: string, qtyChange: number, type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN', reason?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newMovement: StockMovement = {
          id: Date.now().toString() + Math.random(),
          productId: p.id,
          productName: p.name,
          oldStock: p.stock,
          newStock: p.stock + qtyChange,
          change: qtyChange,
          type,
          reason: reason || type,
          timestamp: new Date().toISOString(),
          operatorName: currentUser?.name || 'Sistema'
        };
        setStockMovements(prevLog => [newMovement, ...prevLog]);
        return { ...p, stock: p.stock + qtyChange };
      }
      return p;
    }));
  };

  const processSale = (items: CartItem[], paymentMethod: string) => {
    if (!currentSession) return false;
    const total = items.reduce((acc, item) => acc + item.total, 0);
    items.forEach(item => updateProductStock(item.id, -item.quantity, 'SALE', `Venda #${Date.now().toString().slice(-4)}`));
    const newSale: Sale = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      items,
      total,
      paymentMethod,
      timestamp: new Date().toISOString()
    };
    setSales(prev => [...prev, newSale]);
    setCurrentSession(prev => prev ? { ...prev, salesTotal: prev.salesTotal + total } : null);
    return true;
  };

  const deleteCategory = (category: string) => {
    setAvailableCategories(prev => prev.filter(c => c !== category));
    setProducts(prev => prev.map(p => p.category === category ? { ...p, category: 'Sem Categoria' } : p));
  };

  const addCategory = (category: string) => {
    if (!availableCategories.includes(category)) {
      setAvailableCategories(prev => [...prev, category]);
    }
  };

  const generate100Categories = () => {
    const sectors = ["Eletrônicos", "Moda", "Casa", "Beleza", "Esportes", "Automotivo", "Brinquedos", "Livros", "Alimentos", "Pet Shop"];
    const subSectors = ["Premium", "Básico", "Acessórios", "Luxo", "Importado", "Nacional", "Promoção", "Outlet", "Novo", "Usado"];
    const newCategories: string[] = [];
    sectors.forEach(sec => {
      subSectors.forEach(sub => {
        newCategories.push(`${sec} - ${sub}`);
      });
    });
    const unique = Array.from(new Set([...availableCategories, ...newCategories]));
    setAvailableCategories(unique);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) return { ...user, isActive: !user.isActive };
      return user;
    }));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
  };

  const addPaymentMethod = (method: Omit<PaymentMethodConfig, 'id'>) => {
    const newMethod = { ...method, id: Date.now().toString() };
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, newMethod]
    }));
  };

  const editPaymentMethod = (id: string, updates: Partial<PaymentMethodConfig>) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? { ...pm, ...updates } : pm)
    }));
  };

  const removePaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }));
  };

  return (
    <StoreContext.Provider value={{
      companyAccount, isCompanyAuthenticated, registerCompany, loginCompany, logoutCompany, recoverCompanyPassword, updateCompanyAccount, deleteCompanyAccount,
      products, users, currentUser, currentSession, cashSessions, sales, settings, availableCategories, stockMovements,
      login, logout, openCashier, closeCashier, processSale,
      updateProductStock, deleteCategory, addCategory, generate100Categories, updateSettings, toggleUserStatus, addUser,
      addPaymentMethod, editPaymentMethod, removePaymentMethod
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};