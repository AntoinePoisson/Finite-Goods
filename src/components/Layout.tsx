import type { ReactNode } from 'react';

import { Brand } from './Brand';
import { Link } from './Link';
import { useLocation } from '../infrastructure/routing';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.split('?')[0];
  return (
    <>
      <a className='skip-link' href='#content'>
        Skip to content
      </a>
      <header className='site-header'>
        <Brand />
        <nav aria-label='Main navigation'>
          <Link aria-current={path === '/' ? 'page' : undefined} to='/'>
            Shop
          </Link>
          <Link
            className='nav-admin'
            aria-current={path === '/back-office' ? 'page' : undefined}
            to='/back-office'
          >
            Back office
          </Link>
          <Link
            className='nav-help'
            aria-current={['/about', '/how-it-work', '/how-it-works'].includes(path) ? 'page' : undefined}
            to='/about'
          >
            <span className='nav-help__icon' aria-hidden='true'>
              ?
            </span>
            How it works
          </Link>
        </nav>
      </header>
      <main id='content'>{children}</main>
      <footer className='site-footer'>
        <Brand />
        <p>One object. One reservation. No restock.</p>
        <div className='site-footer__links'>
          <Link to='/about'>How it works</Link>
          <span>React · Go · WebAssembly</span>
        </div>
      </footer>
    </>
  );
}
