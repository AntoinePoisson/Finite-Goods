import type { ReactNode } from 'react';

import { ArrowIcon, EngineIcon, ObjectsIcon, ShieldIcon, SyncIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ObjectIllustration } from '../components/ObjectIllustration';
import { catalog } from '../domain/catalog';

export function AboutPage() {
  return (
    <section className='about-page'>
      <header className='about-hero'>
        <div>
          <p className='eyebrow'>How it works</p>
          <h1>
            Static site.
            <br />
            Real state transitions.
          </h1>
          <p>
            The shop is small on purpose. What matters is the moment two tabs reach for the same object — or
            the moment a checkout returns without a trusted payment event.
          </p>
          <Link className='button button--primary' to='/objects/ordinary-rock'>
            Try a reservation <ArrowIcon />
          </Link>
        </div>
        <div className='about-objects' aria-label='A sample of the Finite Goods collection'>
          {catalog.slice(0, 3).map((item) => (
            <div key={item.id}>
              <ObjectIllustration compact item={item} />
              <span>
                {item.name}
                <small>{item.sku}</small>
              </span>
            </div>
          ))}
        </div>
      </header>

      <section className='project-purpose'>
        <div>
          <p className='eyebrow'>Why this project exists</p>
          <h2>A small shop, built to make the hard parts visible.</h2>
        </div>
        <div className='project-purpose__copy'>
          <p>
            Finite Goods is an engineering proof of concept, not a marketplace in costume. Each object exists
            once. That single rule makes conflicts, expiry and payment trust hard to hide.
          </p>
          <p>
            GitHub Pages is a hard limit, not a backdrop. There is no API elsewhere. React handles the
            interface; a Go engine compiled to WebAssembly owns the transitions; the browser keeps the state
            durable across tabs.
          </p>
          <ol>
            <li>
              <strong>01</strong>
              <span>Reserve an object and watch the hold appear in the back office.</span>
            </li>
            <li>
              <strong>02</strong>
              <span>Open a competing tab: only one reservation can win.</span>
            </li>
            <li>
              <strong>03</strong>
              <span>Return from checkout and see why a redirect cannot prove payment.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className='technical-flow'>
        <header>
          <p className='eyebrow'>Inside one reservation</p>
          <h2>Four layers, no application server.</h2>
          <p>Unusual setup. The jobs stay separate so the demo stays readable.</p>
        </header>
        <div className='technical-flow__grid'>
          <TechnicalStep icon={<ObjectsIcon />} number='01' title='React sends a command'>
            The interface collects the customer details, then asks to reserve one catalogue ID.
          </TechnicalStep>
          <TechnicalStep icon={<EngineIcon />} number='02' title='Go decides'>
            A deterministic state machine, compiled to WebAssembly, accepts or rejects the transition.
          </TechnicalStep>
          <TechnicalStep icon={<ShieldIcon />} number='03' title='The write is guarded'>
            Web Locks serialise the tabs. IndexedDB then checks the expected version before it commits.
          </TechnicalStep>
          <TechnicalStep icon={<SyncIcon />} number='04' title='Every tab catches up'>
            BroadcastChannel announces the change. Stale screens refresh; nothing polls.
          </TechnicalStep>
        </div>
      </section>

      <section className='trust-boundary'>
        <div>
          <p className='eyebrow'>Stripe trust boundary</p>
          <h2>A redirect is not proof of payment.</h2>
          <p>
            GitHub Pages cannot receive a webhook. Coming back from the Stripe preview therefore leaves the
            order <strong>unverified</strong>. Inventory moves to acquired only when the simulated verified
            event arrives.
          </p>
          <Link className='text-link' to='/back-office'>
            The event log exposes every transition <ArrowIcon />
          </Link>
        </div>
        <aside id='architecture'>
          <span>Runtime</span>
          <dl>
            <div>
              <dt>Interface</dt>
              <dd>React + TypeScript</dd>
            </div>
            <div>
              <dt>Domain engine</dt>
              <dd>Go + WebAssembly</dd>
            </div>
            <div>
              <dt>Concurrency</dt>
              <dd>Web Locks + versions</dd>
            </div>
            <div>
              <dt>Persistence</dt>
              <dd>IndexedDB</dd>
            </div>
            <div>
              <dt>Hosting</dt>
              <dd>GitHub Pages</dd>
            </div>
          </dl>
          <small>No backend. No real payment. No hidden remote state.</small>
        </aside>
      </section>
    </section>
  );
}

function TechnicalStep({ icon, number, title, children }: TechnicalStepProps) {
  return (
    <article>
      <div>
        <span>{number}</span>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

interface TechnicalStepProps {
  icon: ReactNode;
  number: string;
  title: string;
  children: ReactNode;
}
