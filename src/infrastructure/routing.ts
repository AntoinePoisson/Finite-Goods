import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function sitePath(path: string) {
  const suffix = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix || '/'}`;
}

export function appPath(pathname = window.location.pathname) {
  // pages serves us under /Finite-Goods
  if (base && pathname.startsWith(base)) return pathname.slice(base.length) || '/';
  return pathname || '/';
}

export function useLocation() {
  const [location, setLocation] = useState(() =>
    typeof window === 'undefined' ? '/' : `${appPath()}${window.location.search}`
  );

  useEffect(() => {
    const update = () => setLocation(`${appPath()}${window.location.search}`);
    window.addEventListener('popstate', update);
    window.addEventListener('finite-goods:navigate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('finite-goods:navigate', update);
    };
  }, []);

  return location;
}

export function navigate(to: string, replace = false) {
  const href = sitePath(to);
  if (replace) window.history.replaceState(null, '', href);
  else window.history.pushState(null, '', href);
  // pushState doesnt fire popstate, so we poke the router ourselves
  window.dispatchEvent(new Event('finite-goods:navigate'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
