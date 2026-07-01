export type DeviceModel = "Laptop" | "Desktop" | "Other";
export type RequestStatus = "Pending" | "In-Progress" | "Completed" | "Unsuccessful";

export interface RepairTimelineStep {
  step: string;
  date: string;
  note: string;
  status: string;
}

export interface CustomerConfirmation {
  customer_collected: boolean;
  technician: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  shop_name: string;
  technician_name: string;
  request_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  device_model: DeviceModel;
  device_brand: string;
  serial_number: string;
  operating_system: string;
  accessories_received: string;
  problem_description: string;
  diagnosis_date: string;
  diagnosis_technician: string;
  fault_found: string;
  parts_used: string;
  repair_action: string;
  status: RequestStatus;
  service_charge: number;
  parts_cost: number;
  total_cost: number;
  deposit_paid: number;
  balance: number;
  payment_completed: boolean;
  repair_timeline: RepairTimelineStep[];
  customer_confirmation: CustomerConfirmation;
  created_at: string;
  updated_at: string;
}

export interface Goods {
  id: string;
  user_id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  goods_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  payment_status: string;
  order_date: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  supplier: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  date: string;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  customer_name: string;
  status: string;
  amount: number;
  used_amount: number;
  issued_date: string;
  created_at: string;
  updated_at: string;
}

export interface AcademyCourse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string | null;
  instructor: string;
  duration: string;
  price: number;
  level: string;
  syllabus: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, string | number | boolean>;
}
