import { useEffect } from 'react';

import { Layout } from '../components/Layout';
import { itemBySlug } from '../domain/catalog';
import { useLocation } from '../infrastructure/routing';
import { AboutPage } from '../routes/AboutPage';
import { AcquirePage } from '../routes/AcquirePage';
import { HomePage } from '../routes/HomePage';
import { NotFoundPage } from '../routes/NotFoundPage';
import { ObjectPage } from '../routes/ObjectPage';
import { OperationsPage } from '../routes/OperationsPage';
import { StripeReturnPage } from '../routes/StripeReturnPage';
import { navigate } from '../infrastructure/routing';

export function App() {
  const location = useLocation();
  const path = location.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  const page = route(segments);
  const documentTitle = titleFor(segments);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return <Layout>{page}</Layout>;
}

function route(segments: string[]) {
  if (segments.length === 0) return <HomePage />;
  if (segments[0] === 'objects' && segments.length === 2) return <ObjectPage slug={segments[1]} />;
  if (segments[0] === 'acquire' && segments.length === 2) return <AcquirePage slug={segments[1]} />;
  if (segments[0] === 'back-office' && segments.length === 1) return <OperationsPage />;
  if (segments[0] === 'operations' && segments.length === 1)
    return <LegacyRedirect destination='/back-office' />;
  if (['about', 'how-it-work', 'how-it-works'].includes(segments[0] ?? '') && segments.length === 1)
    return <AboutPage />;
  if (segments[0] === 'stripe-return' && segments.length === 1) return <StripeReturnPage />;
  return <NotFoundPage />;
}

function titleFor(segments: string[]) {
  if ((segments[0] === 'objects' || segments[0] === 'acquire') && segments.length === 2) {
    const item = itemBySlug(segments[1] ?? '');
    if (item) return `${item.name} — Finite Goods`;
  }
  if (['back-office', 'operations'].includes(segments[0] ?? '')) return 'Back office — Finite Goods';
  if (['about', 'how-it-work', 'how-it-works'].includes(segments[0] ?? ''))
    return 'How it works — Finite Goods';
  if (segments[0] === 'stripe-return') return 'Stripe return — Finite Goods';
  if (segments.length > 0) return 'Not found — Finite Goods';
  return 'Finite Goods — One object. One reservation. No restock.';
}

function LegacyRedirect({ destination }: { destination: string }) {
  useEffect(() => navigate(destination, true), [destination]);
  return null;
}
