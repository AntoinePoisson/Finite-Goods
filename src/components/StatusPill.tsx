import type { ObjectStatus, OrderStatus } from '../domain/types';

type Status = ObjectStatus | OrderStatus;

const labels: Record<Status, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
  PAYMENT_PENDING: 'Payment pending',
  UNVERIFIED_RETURN: 'Unverified return',
  PAID: 'Paid',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded'
};

export function StatusPill({ status }: { status: Status }) {
  return <span className={`status status--${status.toLowerCase()}`}>{labels[status]}</span>;
}
