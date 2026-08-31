import { useEffect, useState } from 'react';

export function Countdown({ expiresAt, onElapsed }: { expiresAt: string; onElapsed?: () => void }) {
  const [remaining, setRemaining] = useState(() => millisecondsLeft(expiresAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = millisecondsLeft(expiresAt);
      setRemaining(next);
      if (next === 0) {
        window.clearInterval(timer);
        onElapsed?.();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, onElapsed]);

  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <time dateTime={expiresAt}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </time>
  );
}

function millisecondsLeft(expiresAt: string) {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}
