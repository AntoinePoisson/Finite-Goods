import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

export function usePointerTilt(maximum = 3) {
  const frame = useRef<number | undefined>(undefined);

  function move(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    // Mousemove can fire faster than a paint; only the latest position needs to reach the DOM.
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--tilt-x', `${-y * maximum}deg`);
      element.style.setProperty('--tilt-y', `${x * maximum}deg`);
      element.style.setProperty('--pointer-x', x.toFixed(3));
      element.style.setProperty('--pointer-y', y.toFixed(3));
      element.dataset.tilting = 'true';
    });
  }

  function leave(event: ReactPointerEvent<HTMLElement>) {
    if (frame.current) cancelAnimationFrame(frame.current);
    const element = event.currentTarget;
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
    element.style.setProperty('--pointer-x', '0');
    element.style.setProperty('--pointer-y', '0');
    delete element.dataset.tilting;
  }

  return { onPointerMove: move, onPointerLeave: leave };
}
