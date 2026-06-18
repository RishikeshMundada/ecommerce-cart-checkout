export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  customerId: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  createdAt: string;
}

export interface CheckoutResult {
  order: Order;
  newDiscountCode?: string;
}

export interface DiscountCodeEntry {
  code: string;
  percent: number;
  used: boolean;
}

export interface StoreStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  discountCodes: DiscountCodeEntry[];
}

export interface GenerateDiscountResult {
  conditionMet: boolean;
  code?: string;
  percent?: number;
  currentOrderCount?: number;
  nextDiscountAt?: number;
}
