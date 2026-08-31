export type ObjectStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type OrderStatus =
  'RESERVED' | 'PAYMENT_PENDING' | 'UNVERIFIED_RETURN' | 'PAID' | 'EXPIRED' | 'REFUNDED';

export interface InventoryObject {
  id: string;
  status: ObjectStatus;
  version: number;
  reservationId?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  country: string;
}

export interface Order {
  id: string;
  objectId: string;
  status: OrderStatus;
  createdAt: string;
  reservationExpiresAt: string;
  customer: CustomerDetails;
  paymentReference?: string;
  version: number;
}

export interface DomainEvent {
  id: string;
  type: string;
  objectId?: string;
  orderId?: string;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface World {
  objects: InventoryObject[];
  orders: Order[];
  events: DomainEvent[];
  version: number;
}

export type CommandType =
  | 'RESERVE_OBJECT'
  | 'BEGIN_PAYMENT'
  | 'RETURN_FROM_CHECKOUT'
  | 'CONFIRM_PAYMENT'
  | 'EXPIRE_RESERVATION'
  | 'REFUND_ORDER';

export interface Command {
  type: CommandType;
  objectId?: string;
  orderId?: string;
  eventId: string;
  now: string;
  expiresAt?: string;
  paymentReference?: string;
  customer?: CustomerDetails;
}

export interface EngineResult {
  world: World;
  code?: string;
  error?: string;
}

export interface StoreSnapshot {
  world: World;
  ready: boolean;
  busy: boolean;
  error?: string;
}
