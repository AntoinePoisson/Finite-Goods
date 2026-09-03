import { useMemo, useState, type FormEvent, type InputHTMLAttributes } from 'react';

import { useDemoSnapshot, useDemoStore } from '../app/StoreProvider';
import { CertificateSeal } from '../components/CertificateSeal';
import { Countdown } from '../components/Countdown';
import { ArrowIcon, CardIcon, ShieldIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ObjectIllustration } from '../components/ObjectIllustration';
import { itemBySlug, price, type CatalogItem } from '../domain/catalog';
import type { Order } from '../domain/types';
import { navigate } from '../infrastructure/routing';
import { DomainError } from '../infrastructure/store/demoStore';
import { NotFoundPage } from './NotFoundPage';

const demoDetails = {
  email: 'demo@finite-goods.dev',
  name: 'Alex Morgan',
  country: 'France',
  card: '4242 4242 4242 4242',
  expiry: '12 / 30',
  cvc: '123'
};

export function AcquirePage({ slug }: { slug: string }) {
  const item = itemBySlug(slug);
  const store = useDemoStore();
  const snapshot = useDemoSnapshot();
  const [orderId, setOrderId] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [details, setDetails] = useState({
    email: '',
    name: '',
    country: '',
    card: '',
    expiry: '',
    cvc: ''
  });
  const object = snapshot.world.objects.find((candidate) => candidate.id === item?.id);
  const order = useMemo(
    () => snapshot.world.orders.find((candidate) => candidate.id === orderId),
    [snapshot.world.orders, orderId]
  );

  if (!item) return <NotFoundPage />;

  async function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(undefined);
    try {
      const id = await store.reserve(item!.id, {
        name: details.name,
        email: details.email,
        country: details.country
      });
      setOrderId(id);
    } catch (error) {
      if (error instanceof DomainError && ['OBJECT_UNAVAILABLE', 'STATE_CHANGED'].includes(error.code)) {
        setNotice('Another tab reserved this object first. The inventory has been refreshed.');
      } else {
        setNotice(
          'The reservation could not be completed. Reset the demo from the back office and try again.'
        );
      }
    }
  }

  async function completeDemo() {
    if (!order) return;
    setNotice(undefined);
    try {
      if (order.status === 'RESERVED') await store.beginPayment(order.id);
      await store.confirmPayment(order.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setNotice('The payment state changed before it could be confirmed.');
    }
  }

  async function startStripePreview() {
    if (!order) return;
    if (order.status === 'RESERVED') await store.beginPayment(order.id);
    sessionStorage.setItem('finite-goods:stripe-order', order.id);
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

    // Without a configured Stripe test link, the local return page demonstrates the same boundary.
    if (paymentLink) window.location.assign(paymentLink);
    else navigate(`/stripe-return?order=${order.id}`);
  }

  if (order?.status === 'PAID') return <Confirmation item={item} order={order} />;

  return (
    <section className='checkout-page'>
      <div className='checkout-page__nav'>
        <Link className='back-link back-link--button' to={`/objects/${item.slug}`}>
          ← Back to the object
        </Link>
        <Progress active={2} objectSlug={item.slug} />
      </div>
      <header className='checkout-page__heading'>
        <h1>Reserve your object</h1>
        <div>
          <span>Demo checkout</span>
          <b>DEMO</b>
        </div>
        <p className='checkout-safety'>
          <ShieldIcon /> No payment will be processed.
        </p>
      </header>

      <div className='checkout-layout'>
        <form className='checkout-form' onSubmit={reserve}>
          <fieldset disabled={snapshot.busy || Boolean(order)}>
            <legend>Contact</legend>
            <label htmlFor='checkout-email'>
              Email address
              <DemoInput
                id='checkout-email'
                required
                type='email'
                autoComplete='email'
                placeholder='Hover or focus for a demo email'
                value={details.email}
                demoValue={demoDetails.email}
                onValue={(email) => setDetails((current) => ({ ...current, email }))}
              />
            </label>
          </fieldset>
          <fieldset disabled={snapshot.busy || Boolean(order)}>
            <legend>Reservation details</legend>
            <label htmlFor='checkout-name'>
              Full name
              <DemoInput
                id='checkout-name'
                required
                autoComplete='name'
                placeholder='Hover or focus for a demo name'
                value={details.name}
                demoValue={demoDetails.name}
                onValue={(name) => setDetails((current) => ({ ...current, name }))}
              />
            </label>
            <label htmlFor='checkout-country'>
              Country
              <select
                id='checkout-country'
                required
                className={details.country === demoDetails.country ? 'is-demo-filled' : undefined}
                value={details.country}
                onChange={(event) => setDetails((current) => ({ ...current, country: event.target.value }))}
                onFocus={() => fillCountry()}
                onPointerEnter={() => fillCountry()}
              >
                <option value='' disabled>
                  Select your country
                </option>
                <option>France</option>
                <option>United Kingdom</option>
                <option>United States</option>
              </select>
            </label>
          </fieldset>
          <fieldset disabled={snapshot.busy || Boolean(order)}>
            <legend>
              Card details <small>test values only</small>
            </legend>
            <label htmlFor='checkout-card'>
              Card number
              <DemoInput
                id='checkout-card'
                required
                inputMode='numeric'
                autoComplete='cc-number'
                placeholder='Hover or focus for a Stripe test card'
                value={details.card}
                demoValue={demoDetails.card}
                onValue={(card) => setDetails((current) => ({ ...current, card }))}
              />
            </label>
            <div className='field-row'>
              <label htmlFor='checkout-expiry'>
                Expiry
                <DemoInput
                  id='checkout-expiry'
                  required
                  inputMode='numeric'
                  autoComplete='cc-exp'
                  placeholder='MM / YY'
                  value={details.expiry}
                  demoValue={demoDetails.expiry}
                  onValue={(expiry) => setDetails((current) => ({ ...current, expiry }))}
                />
              </label>
              <label htmlFor='checkout-cvc'>
                CVC
                <DemoInput
                  id='checkout-cvc'
                  required
                  inputMode='numeric'
                  autoComplete='cc-csc'
                  placeholder='CVC'
                  value={details.cvc}
                  demoValue={demoDetails.cvc}
                  onValue={(cvc) => setDetails((current) => ({ ...current, cvc }))}
                />
              </label>
            </div>
          </fieldset>
          {!order && (
            <button
              className='button button--primary button--wide'
              disabled={snapshot.busy || object?.status !== 'AVAILABLE'}
            >
              {snapshot.busy ? 'Checking inventory…' : 'Create demo reservation'}
            </button>
          )}
          <p className='stripe-note'>
            <CardIcon /> Powered by Stripe <span>test mode</span>
          </p>
        </form>

        <aside className='order-summary' aria-live='polite'>
          <ObjectIllustration compact item={item} priority />
          <div className='order-summary__name'>
            <div>
              <strong>{item.name}</strong>
              <span>{item.sku}</span>
            </div>
            <b>{price(item.price)}</b>
          </div>
          <small>Edition {item.edition}</small>
          <div className='order-summary__total'>
            <span>Total</span>
            <strong>{price(item.price)}</strong>
          </div>
          {order ? (
            <>
              <button
                className='button button--primary button--wide'
                disabled={snapshot.busy}
                onClick={() => void completeDemo()}
              >
                Complete demo reservation
              </button>
              <button
                className='button button--quiet button--wide'
                disabled={snapshot.busy}
                onClick={() => void startStripePreview()}
              >
                Preview Stripe return
              </button>
              <p className='reservation-expiry'>
                ◷ &nbsp; Your reservation expires in{' '}
                <strong>
                  <Countdown
                    expiresAt={order.reservationExpiresAt}
                    onElapsed={() => void store.expire(order.id)}
                  />
                </strong>
              </p>
            </>
          ) : (
            <p className='order-summary__hint'>Complete the form to create a five-minute hold.</p>
          )}
        </aside>
      </div>
      {notice && (
        <div className='notice' role='status'>
          {notice}
        </div>
      )}
      {snapshot.error && (
        <div className='notice notice--error' role='alert'>
          {snapshot.error}
        </div>
      )}
    </section>
  );

  function fillCountry() {
    if (!details.country) setDetails((current) => ({ ...current, country: demoDetails.country }));
  }
}

interface DemoInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  demoValue: string;
  onValue: (value: string) => void;
}

function DemoInput({ value, demoValue, onValue, ...props }: DemoInputProps) {
  const useDemoValue = () => {
    if (!value) onValue(demoValue);
  };

  return (
    <input
      {...props}
      className={value === demoValue ? 'is-demo-filled' : undefined}
      value={value}
      onChange={(event) => onValue(event.target.value)}
      onFocus={useDemoValue}
      onPointerEnter={useDemoValue}
    />
  );
}

function Progress({ active, objectSlug }: { active: number; objectSlug?: string }) {
  return (
    <ol className='checkout-progress' aria-label='Reservation progress'>
      {['Object', 'Reservation', 'Confirmation'].map((label, index) => {
        const step = index + 1;
        const marker = (
          <>
            <span>{step}</span>
            <small>{label}</small>
          </>
        );

        return (
          <li key={label} className={step <= active ? 'is-active' : ''}>
            {/* The object is the only earlier step that is still a page to walk back to: the
                confirmation never offers the way back to a reservation it has already taken. */}
            {step === 1 && objectSlug ? <Link to={`/objects/${objectSlug}`}>{marker}</Link> : marker}
          </li>
        );
      })}
    </ol>
  );
}

function Confirmation({ item, order }: { item: CatalogItem; order: Order }) {
  return (
    <section className='confirmation-page'>
      <Progress active={3} />
      <div className='confirmation-layout'>
        <div className='confirmation-copy'>
          <h1>The {item.kind === 'rock' ? 'rock' : 'object'} is yours.</h1>
          <h2>Reservation confirmed</h2>
          <p>No real payment was processed — this is a product demo.</p>
          <div className='confirmation-object'>
            <ObjectIllustration compact item={item} />
            <div>
              <strong>{item.name}</strong>
              <span>{item.sku}</span>
              <b>{item.serial}</b>
              <small>Edition {item.edition}</small>
            </div>
          </div>
          <div className='event-summary'>
            <strong>Reservation FG-{order.id.slice(0, 6).toUpperCase()}</strong>
            <ol>
              <li>Reservation created</li>
              <li>Stripe test checkout completed</li>
              <li>Inventory updated</li>
            </ol>
          </div>
          <div className='button-row'>
            <Link className='button button--primary' to='/back-office'>
              View back office <ArrowIcon />
            </Link>
            <Link className='button button--quiet' to='/'>
              Back to collection
            </Link>
          </div>
        </div>
        <div className='certificate'>
          <span>Certificate of</span>
          <h2>Ordinariness</h2>
          <i />
          <p>This certifies that one perfectly ordinary object has found its only owner.</p>
          <div>
            <span>
              {item.name}
              <small>{item.sku}</small>
            </span>
            <b>{item.serial}</b>
          </div>
          <div className='barcode barcode--wide' aria-hidden='true' />
          <CertificateSeal />
        </div>
      </div>
    </section>
  );
}
