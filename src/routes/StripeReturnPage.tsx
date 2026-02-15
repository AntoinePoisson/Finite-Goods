import { useEffect, useState } from 'react';

import { useDemoSnapshot, useDemoStore } from '../app/StoreProvider';
import { Link } from '../components/Link';

export function StripeReturnPage() {
  const store = useDemoStore();
  const { world, ready, busy } = useDemoSnapshot();
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order') ?? sessionStorage.getItem('finite-goods:stripe-order') ?? '';
  const order = world.orders.find((candidate) => candidate.id === orderId);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!ready || !order || order.status !== 'PAYMENT_PENDING') return;

    // they came back from stripe, that still isnt a payment
    void store
      .returnFromCheckout(order.id)
      .catch(() => setMessage('The checkout return could not be recorded.'));
  }, [order, ready, store]);

  async function confirm() {
    if (!order) return;
    try {
      await store.confirmPayment(order.id, `evt_demo_${crypto.randomUUID().slice(0, 8)}`);
      setMessage('Simulated webhook accepted. The order is now paid.');
    } catch {
      setMessage('The event could not be applied to the current order state.');
    }
  }

  if (!ready)
    return (
      <section className='return-page'>
        <p>Reading the local order…</p>
      </section>
    );
  if (!order)
    return (
      <section className='return-page'>
        <p className='eyebrow'>Stripe test return</p>
        <h1>No local order found</h1>
        <p>This browser has no matching checkout state.</p>
        <Link className='button button--quiet' to='/'>
          Return to the collection
        </Link>
      </section>
    );

  return (
    <section className='return-page'>
      <div className='return-page__icon'>!</div>
      <p className='eyebrow'>Stripe test return</p>
      <h1>A return is not a confirmation.</h1>
      <p>
        The browser came back from checkout. This static site cannot receive a Stripe webhook, so it cannot
        verify one either. The order stays unverified.
      </p>
      <div className='return-proof'>
        <span>Browser signal</span>
        <strong>Checkout returned</strong>
        <span>Server signal</span>
        <strong>Not received</strong>
      </div>
      {order.status === 'UNVERIFIED_RETURN' && (
        <button className='button button--primary' disabled={busy} onClick={() => void confirm()}>
          Simulate verified webhook
        </button>
      )}
      {order.status === 'PAID' && (
        <Link className='button button--primary' to='/back-office'>
          Inspect the confirmed event
        </Link>
      )}
      <Link className='button button--quiet' to='/back-office'>
        Open back office
      </Link>
      {message && (
        <div className='notice' role='status'>
          {message}
        </div>
      )}
    </section>
  );
}
