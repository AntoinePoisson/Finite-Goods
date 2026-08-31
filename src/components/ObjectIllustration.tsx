import type { CatalogItem } from '../domain/catalog';
import { sitePath } from '../infrastructure/routing';

interface Props {
  item: CatalogItem;
  compact?: boolean;
  priority?: boolean;
}

export function ObjectIllustration({ item, compact = false, priority = false }: Props) {
  return (
    <img
      className={compact ? 'object-art object-art--compact' : 'object-art'}
      src={sitePath(item.image)}
      srcSet={`${sitePath(item.thumbnail)} ${item.kind === 'rock' ? 480 : 360}w, ${sitePath(item.image)} ${item.kind === 'rock' ? 960 : 720}w`}
      sizes={compact ? '(max-width: 640px) 50vw, 240px' : '(max-width: 900px) 100vw, 760px'}
      alt={`${item.name}, hand-modelled in clay`}
      width={item.kind === 'rock' ? 960 : 720}
      height={item.kind === 'rock' ? 768 : 720}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
}
