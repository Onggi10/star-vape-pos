export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: string;
}
