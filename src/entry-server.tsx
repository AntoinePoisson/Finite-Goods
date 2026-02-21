import { renderToString } from 'react-dom/server';

import { App } from './app/App';
import { StoreProvider } from './app/StoreProvider';
export function render() {
  return renderToString(
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
