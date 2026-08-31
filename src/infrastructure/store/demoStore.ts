import type { Command, CommandType, CustomerDetails, StoreSnapshot } from '../../domain/types';
import { readWorld, resetWorld, VersionConflictError, writeWorld } from '../database/worldDatabase';
import { engine } from '../engine/client';

type Listener = () => void;

const channelName = 'finite-goods:state';
const reservationDuration = 5 * 60 * 1000;

export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

class DemoStore {
  private snapshot: StoreSnapshot = {
    world: { objects: [], orders: [], events: [], version: 0 },
    ready: false,
    busy: false
  };
  private readonly listeners = new Set<Listener>();
  private readonly channel =
    typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(channelName)
      : undefined;

  constructor() {
    if (typeof window === 'undefined') return;

    // BroadcastChannel is immediate; storage events keep older browsers in sync as a fallback.
    this.channel?.addEventListener('message', () => void this.refresh());
    window.addEventListener('storage', (event) => {
      if (event.key === channelName) void this.refresh();
    });
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async initialise() {
    if (this.snapshot.ready) return;
    await this.refresh();
  }

  async reserve(objectId: string, customer: CustomerDetails) {
    const orderId = crypto.randomUUID();
    const now = new Date();
    await this.run({
      type: 'RESERVE_OBJECT',
      objectId,
      orderId,
      eventId: crypto.randomUUID(),
      now: now.toISOString(),
      expiresAt: new Date(now.getTime() + reservationDuration).toISOString(),
      customer
    });
    return orderId;
  }

  beginPayment(orderId: string) {
    return this.command('BEGIN_PAYMENT', orderId);
  }

  returnFromCheckout(orderId: string) {
    return this.command('RETURN_FROM_CHECKOUT', orderId);
  }

  confirmPayment(orderId: string, paymentReference = `demo_${crypto.randomUUID().slice(0, 8)}`) {
    return this.run({
      type: 'CONFIRM_PAYMENT',
      orderId,
      eventId: crypto.randomUUID(),
      now: new Date().toISOString(),
      paymentReference
    });
  }

  expire(orderId: string, force = false) {
    const order = this.snapshot.world.orders.find((candidate) => candidate.id === orderId);
    const now = force && order ? new Date(new Date(order.reservationExpiresAt).getTime() + 1) : new Date();
    return this.run({
      type: 'EXPIRE_RESERVATION',
      orderId,
      eventId: crypto.randomUUID(),
      now: now.toISOString()
    });
  }

  refund(orderId: string) {
    return this.command('REFUND_ORDER', orderId);
  }

  async reset() {
    this.set({ ...this.snapshot, busy: true, error: undefined });
    try {
      const world = await withWorldLock(() => resetWorld());
      this.set({ world, ready: true, busy: false });
      this.broadcast();
    } catch (error) {
      this.fail(error);
    }
  }

  async expireElapsed() {
    const elapsed = this.snapshot.world.orders.filter(
      (order) =>
        ['RESERVED', 'PAYMENT_PENDING', 'UNVERIFIED_RETURN'].includes(order.status) &&
        new Date(order.reservationExpiresAt).getTime() <= Date.now()
    );
    for (const order of elapsed) {
      try {
        await this.expire(order.id);
      } catch {
        await this.refresh();
      }
    }
  }

  private command(type: CommandType, orderId: string) {
    return this.run({ type, orderId, eventId: crypto.randomUUID(), now: new Date().toISOString() });
  }

  private async run(command: Command) {
    this.set({ ...this.snapshot, busy: true, error: undefined });
    try {
      const world = await withWorldLock(async () => {
        const current = await readWorld();
        const result = await engine.apply(current, command);
        if (result.error) throw new DomainError(result.code ?? 'DOMAIN_ERROR', result.error);

        // The Go engine is pure. Persistence happens only after it accepts the transition.
        await writeWorld(result.world, current.version);
        return result.world;
      });
      this.set({ world, ready: true, busy: false });
      this.broadcast();
      return world;
    } catch (error) {
      if (error instanceof VersionConflictError) {
        await this.refresh();
        throw new DomainError('STATE_CHANGED', 'Another tab changed this object first.');
      }
      if (error instanceof DomainError) {
        this.set({ ...this.snapshot, busy: false, error: undefined });
        throw error;
      }
      this.fail(error);
      throw error;
    }
  }

  private async refresh() {
    try {
      const world = await readWorld();
      this.set({ world, ready: true, busy: false });
    } catch (error) {
      this.fail(error);
    }
  }

  private broadcast() {
    this.channel?.postMessage({ changed: true });
    // Writing a changing value is required for a storage event to fire in the other tabs.
    localStorage.setItem(channelName, Date.now().toString());
  }

  private fail(error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    this.set({ ...this.snapshot, ready: true, busy: false, error: message });
  }

  private set(snapshot: StoreSnapshot) {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
}

async function withWorldLock<T>(action: () => Promise<T>) {
  // IndexedDB's version check remains the fallback where Web Locks is unavailable.
  if (!navigator.locks) return action();
  return navigator.locks.request('finite-goods:world', { mode: 'exclusive' }, action);
}

export const demoStore = new DemoStore();
