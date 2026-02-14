import type { AnchorHTMLAttributes, MouseEvent } from 'react';

import { navigate, sitePath } from '../infrastructure/routing';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

export function Link({ to, onClick, children, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    // let cmd/ctrl/shift clicks through
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={sitePath(to)} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
