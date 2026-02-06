export interface Customer {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

export interface Session {
  id: number;
  date: string; // 'YYYY-MM-DD'
  price_per_kg: number;
  status: 'active' | 'completed';
  created_at: string;
}

export interface Order {
  id: number;
  session_id: number;
  customer_id: number;
  target_weight: number; // kg
  status: 'pending' | 'matched' | 'invoiced';
  turkey_id: number | null;
  created_at: string;
}

export interface Turkey {
  id: number;
  session_id: number;
  actual_weight: number; // kg
  order_id: number | null;
  created_at: string;
}

// Extended types for UI display
export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_phone: string;
}

export interface SessionWithCount extends Session {
  order_count: number;
}

export interface OrderWithCustomerAndTurkey extends OrderWithCustomer {
  actual_weight: number | null;
}
