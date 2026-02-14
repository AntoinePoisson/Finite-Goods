import type { CSSProperties } from 'react';

import { Link } from './Link';
import { ObjectIllustration } from './ObjectIllustration';
import { StatusPill } from './StatusPill';
import type { CatalogItem } from '../domain/catalog';
import { price } from '../domain/catalog';
import type { ObjectStatus } from '../domain/types';
import { usePointerTilt } from '../hooks/usePointerTilt';

export function ObjectCard({
  item,
  status = 'AVAILABLE',
  index
}: {
  item: CatalogItem;
  status?: ObjectStatus;
  index: number;
}) {
  const tilt = usePointerTilt(1.35);

  return (
    <article
      className='object-card reveal tilt-surface'
      style={{ '--delay': `${index * 45}ms`, '--accent': item.accent } as CSSProperties}
      {...tilt}
    >
      <Link className='object-card__link' to={`/objects/${item.slug}`} aria-label={`View ${item.name}`} />
      <div className='object-card__art'>
        <ObjectIllustration compact item={item} />
      </div>
      <div className='object-card__body'>
        <div className='object-card__heading'>
          <div>
            <h2>{item.name}</h2>
            <span>{item.sku}</span>
          </div>
          <i aria-hidden='true' />
        </div>
        <div className='serial-row'>
          <strong>{item.serial}</strong>
          <span>Edition {item.edition}</span>
        </div>
        <div className='barcode' aria-hidden='true' />
        <div className='object-card__footer'>
          <strong>{price(item.price)}</strong>
          <StatusPill status={status} />
        </div>
      </div>
    </article>
  );
}
