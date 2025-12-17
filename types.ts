export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface CompanyAccount {
  companyName: string;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  password: string; // In a real app, this would be hashed
}

export interface Product {
  id: string;
  code: string; // Barcode or manual code
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  total: number;
}

export interface CashSession {
  id: string;
  operatorId: string;
  operatorName: string;
  openedAt: string; // ISO Date
  closedAt?: string;
  startValue: number;
  salesTotal: number; // Total bruto vendido
  endValue?: number; // Valor declarado pelo usuário no fechamento (Dinheiro físico)
  difference?: number; // Diferença calculada
  status: 'OPEN' | 'CLOSED';
}

export interface Sale {
  id: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  paymentMethod: string; // Changed from enum to string to support dynamic methods
  timestamp: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
  change: number;
  type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';
  reason?: string;
  operatorName: string;
  timestamp: string;
}

export type PaymentType = 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX' | 'WALLET' | 'VOUCHER' | 'OTHER';

export interface CardDetails {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface PaymentMethodConfig {
  id: string;
  label: string; // Nome exibido (ex: "Pix Principal", "Visa Crédito")
  type: PaymentType;
  active: boolean;
  detail?: string; // Dados extras (Chave Pix, ID da Maquininha, etc) para tipos simples
  cardDetails?: CardDetails; // Dados específicos para cartões/wallets
}

export interface Settings {
  companyName: string;
  nfceEnabled: boolean;
  satEnabled: boolean;
  environment: 'HOMOLOGATION' | 'PRODUCTION';
  printerIp: string;
  allowNegativeStock: boolean;
  securityPolicy: string;
  paymentMethods: PaymentMethodConfig[];
}