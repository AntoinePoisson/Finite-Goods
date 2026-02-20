import { render, screen } from '@testing-library/react';

import { ObjectIllustration } from '../src/components/ObjectIllustration';
import { catalog } from '../src/domain/catalog';

it('gives product artwork an accessible name', () => {
  render(<ObjectIllustration item={catalog[4]} />);
  expect(screen.getByRole('img', { name: /ordinary rock/i })).toBeInTheDocument();
});
