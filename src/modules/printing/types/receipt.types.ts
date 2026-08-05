export interface ReceiptCompany {
  legalName: string;
  commercialName?: string;
  ruc: string;
  address?: string;
  phone?: string;
}

export interface ReceiptBranch {
  name: string;
  address?: string;
}

export interface ReceiptDocument {
  type: string;
  series: string;
  number: string;
  issuedAt: string;
}

export interface ReceiptCustomer {
  documentType?: string;
  documentNumber?: string;
  name?: string;
}

export interface ReceiptCashier {
  name?: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  presentation?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReceiptTotals {
  subtotal?: number;
  discount?: number;
  igv?: number;
  total: number;
}

export interface ReceiptPayment {
  method?: string;
  amountReceived?: number;
  change?: number;
}

export interface ReceiptData {
  company: ReceiptCompany;
  branch: ReceiptBranch;
  document: ReceiptDocument;
  customer?: ReceiptCustomer;
  cashier?: ReceiptCashier;
  items: ReceiptItem[];
  totals: ReceiptTotals;
  payment?: ReceiptPayment;
  qrContent?: string;
  footer?: string;
  isReprint?: boolean;
}
