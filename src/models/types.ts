export type PortionType = 'whole' | 'half';
export type SizePreference = 'light' | 'medium' | 'heavy';

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
  target_weight: number | null; // null = category mode
  portion_type: PortionType;
  size_preference: SizePreference | null; // null = weight mode
  status: 'pending' | 'matched' | 'invoiced';
  turkey_id: number | null;
  created_at: string;
}

export interface Turkey {
  id: number;
  session_id: number;
  actual_weight: number; // kg
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
