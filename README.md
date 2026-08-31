# Finite Goods

Finite Goods is a browser-only shop for one-of-one objects. Open the same object in two tabs and reserve it in both: one transaction succeeds, the other receives a domain conflict.

The interface is React. The state machine is written in Go and compiled to WebAssembly. IndexedDB stores the state, Web Locks serialize competing writes, and BroadcastChannel refreshes other tabs.

## Run it

Requirements: Node.js 24, pnpm 10 and Go 1.26.

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm check
pnpm e2e
```

The production build is written to `dist/` and is ready for GitHub Pages.

## Stripe preview

Set `VITE_STRIPE_PAYMENT_LINK` to a Stripe Payment Link in test mode to leave the local checkout. This project has no backend, so a browser return is never treated as proof of payment. The interface keeps the order unverified until the demo explicitly simulates the missing webhook.

No real payment or remote data storage is used.
