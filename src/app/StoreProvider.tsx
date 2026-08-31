import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';

import type { StoreSnapshot } from '../domain/types';
import { demoStore } from '../infrastructure/store/demoStore';

const StoreContext = createContext(demoStore);

export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void demoStore.initialise();
    // Expiry is intentionally coarse: it is demo housekeeping, not a visible countdown timer.
    const timer = window.setInterval(() => void demoStore.expireElapsed(), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return <StoreContext.Provider value={demoStore}>{children}</StoreContext.Provider>;
}

export function useDemoStore() {
  return useContext(StoreContext);
}

export function useDemoSnapshot(): StoreSnapshot {
  const store = useDemoStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
