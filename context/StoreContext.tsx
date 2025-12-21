
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, UserRole, CashSession, Sale, Settings, CartItem, StockMovement, PaymentMethodConfig, CompanyAccount } from '../types';

// Mock Data Translated
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: '1001', name: 'Camiseta Algodão Premium', price: 49.90, stock: 50, category: 'Roupas', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80' },
  { id: '2', code: '1002', name: 'Tênis de Corrida', price: 299.90, stock: 12, category: 'Calçados', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
  { id: '3', code: '1003', name: 'Colar de Prata', price: 150.00, stock: 5, category: 'Joias', image: 'https://images.unsplash.com/photo-1535633302704-b02f4fba71f6?auto=format&fit=crop&w=200&q=80' },
  { id: '4', code: '1004', name: 'Combo X-Burguer', price: 35.00, stock: 100, category: 'Alimentação', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Administrador', username: 'admin', password: '1234', role: UserRole.ADMIN, isActive: true },
  { id: '2', name: 'Operador João', username: 'op1', password: '1234', role: UserRole.OPERATOR, isActive: true },
];

const INITIAL_CATEGORIES = ['Roupas', 'Calçados', 'Joias', 'Alimentação', 'Bebidas', 'Eletrônicos', 'Casa', 'Sem Categoria'];

const DEFAULT_SECURITY_POLICY = `TERMOS DE USO E POLÍTICA DE PROTEÇÃO DE DADOS (LGPD)...`;

interface StoreContextType {
  companyAccount: CompanyAccount | null;
  isCompanyAuthenticated: boolean;
  registerCompany: (data: CompanyAccount, autoLogin?: boolean) => void;
  loginCompany: (identifier: string, password: string) => boolean;
  logoutCompany: () => void;
  recoverCompanyPassword: (email: string) => boolean;
  updateCompanyAccount: (updates: Partial<CompanyAccount>) => void;
  deleteCompanyAccount: () => void;
  products: Product[];
  users: User[];
  currentUser: User | null;
  currentSession: CashSession | null;
  cashSessions: CashSession[];
  sales: Sale[];
  settings: Settings;
  stockMovements: StockMovement[];
  availableCategories: string[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  openCashier: (startValue: number) => void;
  closeCashier: (endValue: number) => { difference: number, closedSession: CashSession };
  processSale: (items: CartItem[], paymentMethod: string) => boolean;
  updateProductStock: (id: string, qtyChange: number, type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN', reason?: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteCategory: (category: string) => void;
  addCategory: (category: string) => void;
  generate100Categories: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addPaymentMethod: (method: Omit<PaymentMethodConfig, 'id'>) => void;
  editPaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => void;
  removePaymentMethod: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companyAccount, setCompanyAccount] = useState<CompanyAccount | null>(() => {
    const saved = localStorage.getItem('companyAccount');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCompanyAuthenticated, setIsCompanyAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(() => {
    const saved = localStorage.getItem('currentSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [cashSessions, setCashSessions] = useState<CashSession[]>(() => {
    const saved = localStorage.getItem('cashSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('stockMovements');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      companyName: 'Loja Universal',
      nfceEnabled: true,
      satEnabled: false,
      environment: 'HOMOLOGATION',
      printerIp: '192.168.1.100',
      allowNegativeStock: false,
      securityPolicy: DEFAULT_SECURITY_POLICY,
      paymentMethods: [
        { id: 'CASH', label: 'Dinheiro', type: 'CASH', active: true },
        { id: 'DEBIT', label: 'Débito', type: 'DEBIT', active: true },
        { id: 'CREDIT', label: 'Crédito', type: 'CREDIT', active: true },
        { id: 'PIX', label: 'Pix', type: 'PIX', active: true },
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('companyAccount', JSON.stringify(companyAccount));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('categories', JSON.stringify(availableCategories));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentSession', JSON.stringify(currentSession));
    localStorage.setItem('cashSessions', JSON.stringify(cashSessions));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('stockMovements', JSON.stringify(stockMovements));
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [companyAccount, products, availableCategories, users, currentSession, cashSessions, sales, stockMovements, settings]);

  const registerCompany = (data: CompanyAccount, autoLogin: boolean = true) => {
    setCompanyAccount(data);
    setSettings(prev => ({ ...prev, companyName: data.companyName }));
    if (autoLogin) setIsCompanyAuthenticated(true);
  };

  const loginCompany = (identifier: string, password: string) => {
    if (!companyAccount) return false;
    if (password !== companyAccount.password) return false;
    if (companyAccount.email === identifier || companyAccount.document.replace(/\D/g, '') === identifier.replace(/\D/g, '')) {
      setIsCompanyAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutCompany = () => {
    setIsCompanyAuthenticated(false);
    setCurrentUser(null);
  };

  const recoverCompanyPassword = (email: string) => companyAccount?.email === email;
  const updateCompanyAccount = (updates: Partial<CompanyAccount>) => {
    if (!companyAccount) return;
    setCompanyAccount({ ...companyAccount, ...updates });
    if (updates.companyName) setSettings(prev => ({ ...prev, companyName: updates.companyName! }));
  };
  const deleteCompanyAccount = () => {
    setCompanyAccount(null);
    setIsCompanyAuthenticated(false);
  };

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.isActive);
    if (user && user.password === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };
  const logout = () => setCurrentUser(null);

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
          id: Math.random().toString(36).substr(2, 9),
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

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
    setStockMovements(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      productId: newProduct.id,
      productName: newProduct.name,
      oldStock: 0,
      newStock: product.stock,
      change: product.stock,
      type: 'RESTOCK',
      reason: 'Cadastro Inicial',
      timestamp: new Date().toISOString(),
      operatorName: currentUser?.name || 'Sistema'
    }, ...prev]);
  };

  const editProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
    if (!availableCategories.includes(category)) setAvailableCategories(prev => [...prev, category]);
  };
  const generate100Categories = () => {
    const sectors = ["Eletrônicos", "Moda", "Casa", "Beleza", "Esportes", "Automotivo", "Brinquedos", "Livros", "Alimentos", "Pet Shop"];
    const subSectors = ["Premium", "Básico", "Acessórios", "Luxo", "Importado", "Nacional", "Promoção", "Outlet", "Novo", "Usado"];
    const newCats: string[] = [];
    sectors.forEach(sec => subSectors.forEach(sub => newCats.push(`${sec} - ${sub}`)));
    setAvailableCategories(prev => Array.from(new Set([...prev, ...newCats])));
  };
  const updateSettings = (newSettings: Partial<Settings>) => setSettings(prev => ({ ...prev, ...newSettings }));
  const toggleUserStatus = (userId: string) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  const addUser = (user: Omit<User, 'id'>) => setUsers(prev => [...prev, { ...user, id: Date.now().toString() }]);
  const addPaymentMethod = (method: Omit<PaymentMethodConfig, 'id'>) => setSettings(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, { ...method, id: Date.now().toString() }] }));
  const editPaymentMethod = (id: string, updates: Partial<PaymentMethodConfig>) => setSettings(prev => ({ ...prev, paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? { ...pm, ...updates } : pm) }));
  const removePaymentMethod = (id: string) => setSettings(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id) }));

  return (
    <StoreContext.Provider value={{
      companyAccount, isCompanyAuthenticated, registerCompany, loginCompany, logoutCompany, recoverCompanyPassword, updateCompanyAccount, deleteCompanyAccount,
      products, users, currentUser, currentSession, cashSessions, sales, settings, availableCategories, stockMovements,
      login, logout, openCashier, closeCashier, processSale,
      updateProductStock, addProduct, editProduct, deleteProduct, deleteCategory, addCategory, generate100Categories, updateSettings, toggleUserStatus, addUser,
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
