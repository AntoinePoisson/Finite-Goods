import { useMemo, useState, type ReactNode } from 'react';

import { useDemoSnapshot, useDemoStore } from '../app/StoreProvider';
import { AcquiredIcon, AvailableIcon, HeldIcon, ObjectsIcon, ResetIcon } from '../components/Icons';
import { ObjectIllustration } from '../components/ObjectIllustration';
import { StatusPill } from '../components/StatusPill';
import { catalog, itemById, price } from '../domain/catalog';
import type { DomainEvent, Order } from '../domain/types';

export function OperationsPage() {
  const store = useDemoStore();
  const { world, busy } = useDemoSnapshot();
  const [selectedId, setSelectedId] = useState('rock-001');
  const counts = useMemo(
    () => ({
      available: world.objects.filter((object) => object.status === 'AVAILABLE').length,
      held: world.objects.filter((object) => object.status === 'RESERVED').length,
      acquired: world.objects.filter((object) => object.status === 'SOLD').length
    }),
    [world.objects]
  );
  const selectedEvents = [...world.events]
    .filter((event) => !event.objectId || event.objectId === selectedId)
    .reverse();
  const selectedOrder = [...world.orders].reverse().find((order) => order.objectId === selectedId);

  return (
    <section className='operations-page'>
      <header className='operations-heading'>
        <div>
          <p className='eyebrow'>Admin workspace</p>
          <h1>Back office</h1>
          <p>Inventory, reservations and payment events. All of it stays in this browser.</p>
        </div>
        <button className='button button--quiet' disabled={busy} onClick={() => void store.reset()}>
          <ResetIcon /> Reset demo
        </button>
      </header>

      <div className='metrics' aria-label='Inventory summary'>
        <Metric icon={<ObjectsIcon />} label='Objects' value={world.objects.length} />
        <Metric icon={<AvailableIcon />} label='Available' value={counts.available} tone='green' />
        <Metric icon={<HeldIcon />} label='Held' value={counts.held} tone='blue' />
        <Metric icon={<AcquiredIcon />} label='Acquired' value={counts.acquired} tone='terracotta' />
      </div>

      <div className='operations-grid'>
        <section className='inventory-panel'>
          <header>
            <h2>Inventory</h2>
            <span>Version {world.version}</span>
          </header>
          <div className='inventory-list'>
            {catalog.map((item) => {
              const object = world.objects.find((candidate) => candidate.id === item.id);
              return (
                <button
                  type='button'
                  key={item.id}
                  className={selectedId === item.id ? 'inventory-row is-selected' : 'inventory-row'}
                  onClick={() => setSelectedId(item.id)}
                >
                  <ObjectIllustration compact item={item} />
                  <span className='inventory-row__name'>
                    <strong>{item.name}</strong>
                    <small>{item.sku}</small>
                  </span>
                  <b>{item.serial}</b>
                  <small>Edition {item.edition}</small>
                  <strong>{price(item.price)}</strong>
                  <StatusPill status={object?.status ?? 'AVAILABLE'} />
                  <i aria-hidden='true'>›</i>
                </button>
              );
            })}
          </div>
          <footer>
            <span>● &nbsp; Local demo engine</span>
            <span>No backend required</span>
          </footer>
        </section>

        <section className='events-panel'>
          <header>
            <div>
              <h2>Events</h2>
              <span>Event log</span>
            </div>
            <b>{selectedEvents.length}</b>
          </header>
          {selectedEvents.length === 0 ? (
            <div className='empty-state'>
              <span>—</span>
              <p>Reserve this object to create its first event.</p>
            </div>
          ) : (
            <ol className='event-log'>
              {selectedEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  order={world.orders.find((order) => order.id === event.orderId)}
                />
              ))}
            </ol>
          )}
          {selectedOrder && <OrderActions order={selectedOrder} busy={busy} />}
        </section>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = ''
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className={`metric ${tone ? `metric--${tone}` : ''}`}>
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function EventRow({ event, order }: { event: DomainEvent; order?: Order }) {
  const item = itemById(event.objectId ?? '');
  return (
    <li>
      <i aria-hidden='true' />
      <div className='event-log__heading'>
        <strong>{eventName(event.type)}</strong>
        <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
      </div>
      <p>
        {item?.name ?? 'Order update'} {item ? `(${item.sku})` : ''}
      </p>
      {order?.customer && (
        <p className='event-log__customer'>
          {order.customer.name} · {order.customer.email}
        </p>
      )}
      <dl>
        <div>
          <dt>event_id</dt>
          <dd>{event.id.slice(0, 18)}</dd>
        </div>
        {event.orderId && (
          <div>
            <dt>reservation_id</dt>
            <dd>{event.orderId.slice(0, 18)}</dd>
          </div>
        )}
        {order?.customer && (
          <div>
            <dt>customer</dt>
            <dd>{order.customer.country}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function OrderActions({ order, busy }: { order: Order; busy: boolean }) {
  const store = useDemoStore();
  return (
    <div className='ops-actions'>
      <span>Reservation controls</span>
      {['RESERVED', 'PAYMENT_PENDING', 'UNVERIFIED_RETURN'].includes(order.status) && (
        <button disabled={busy} onClick={() => void store.expire(order.id, true)}>
          Expire hold
        </button>
      )}
      {order.status === 'UNVERIFIED_RETURN' && (
        <button
          disabled={busy}
          onClick={() => void store.confirmPayment(order.id, `evt_demo_${crypto.randomUUID().slice(0, 8)}`)}
        >
          Confirm event
        </button>
      )}
      {order.status === 'PAID' && (
        <button className='ops-actions__refund' disabled={busy} onClick={() => void store.refund(order.id)}>
          Refund &amp; return to inventory
        </button>
      )}
    </div>
  );
}

function eventName(type: string) {
  const names: Record<string, string> = {
    OBJECT_RESERVED: 'reservation.created',
    PAYMENT_STARTED: 'checkout.started',
    CHECKOUT_RETURNED: 'checkout.returned',
    PAYMENT_CONFIRMED: 'inventory.acquired',
    RESERVATION_EXPIRED: 'reservation.expired',
    ORDER_REFUNDED: 'inventory.released'
  };
  return names[type] ?? type.toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(
    new Date(value)
  );
}
