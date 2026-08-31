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
            The shop is intentionally small. The interesting part is what happens when two tabs want the same
            unique object, or when a checkout redirects without a trusted payment event.
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
          <h2>A small shop built to expose difficult decisions.</h2>
        </div>
        <div className='project-purpose__copy'>
          <p>
            Finite Goods is a focused engineering proof of concept, not an attempt to imitate a production
            marketplace. The deliberately simple rule — every object exists exactly once — makes state
            conflicts, expiry and payment trust impossible to hide behind catalogue complexity.
          </p>
          <p>
            GitHub Pages is a hard constraint. There is no API pretending to run elsewhere: React owns the
            user experience, a Go WebAssembly engine owns the domain transitions, and browser primitives
            provide local durability and cross-tab coordination.
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
          <p>Each layer has one job, which keeps the demo understandable despite its unusual constraints.</p>
        </header>
        <div className='technical-flow__grid'>
          <TechnicalStep icon={<ObjectsIcon />} number='01' title='React sends a command'>
            The interface gathers the customer details and asks to reserve one catalogue ID.
          </TechnicalStep>
          <TechnicalStep icon={<EngineIcon />} number='02' title='Go decides'>
            A deterministic state machine compiled to WebAssembly accepts or rejects the transition.
          </TechnicalStep>
          <TechnicalStep icon={<ShieldIcon />} number='03' title='The write is guarded'>
            Web Locks serialise tabs. IndexedDB checks the expected version before committing the result.
          </TechnicalStep>
          <TechnicalStep icon={<SyncIcon />} number='04' title='Every tab catches up'>
            BroadcastChannel announces the change, so stale screens refresh without polling.
          </TechnicalStep>
        </div>
      </section>

      <section className='trust-boundary'>
        <div>
          <p className='eyebrow'>Stripe trust boundary</p>
          <h2>A redirect is not proof of payment.</h2>
          <p>
            GitHub Pages cannot receive a webhook, so returning from the Stripe preview leaves the order in an
            explicit <strong>unverified</strong> state. Only the simulated verified event is allowed to mark
            inventory as acquired.
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
