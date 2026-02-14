import { CertificateSeal } from '../components/CertificateSeal';
import { ArrowIcon, ExternalIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ObjectIllustration } from '../components/ObjectIllustration';
import { StatusPill } from '../components/StatusPill';
import { itemBySlug, price, type CatalogItem } from '../domain/catalog';
import { useDemoSnapshot } from '../app/StoreProvider';
import { usePointerTilt } from '../hooks/usePointerTilt';
import { sitePath } from '../infrastructure/routing';
import { NotFoundPage } from './NotFoundPage';

export function ObjectPage({ slug }: { slug: string }) {
  const item = itemBySlug(slug);
  if (!item) return <NotFoundPage />;
  return <ObjectDetails item={item} />;
}

function ObjectDetails({ item }: { item: CatalogItem }) {
  const { world, ready } = useDemoSnapshot();
  const object = world.objects.find((candidate) => candidate.id === item.id);
  const status = object?.status ?? 'AVAILABLE';
  const tilt = usePointerTilt(2);

  return (
    <article className='product-page'>
      <div className='product-gallery'>
        <div className='product-gallery__main tilt-surface' {...tilt}>
          <ObjectIllustration item={item} priority />
        </div>
        <div className='product-gallery__thumbs' aria-hidden='true'>
          <div>
            <ObjectIllustration compact item={item} />
          </div>
          <div>
            <ObjectIllustration compact item={item} />
          </div>
        </div>
      </div>

      <div className='product-panel'>
        <div className='product-panel__topbar'>
          <Link className='back-link back-link--button' to='/#collection'>
            ← Back to collection
          </Link>
        </div>
        <h1>{item.name}</h1>
        <span className='product-panel__sku'>{item.sku}</span>
        <div className='serial-row serial-row--large'>
          <strong>{item.serial}</strong>
          <span>Edition {item.edition}</span>
        </div>
        <div className='barcode barcode--wide' aria-hidden='true' />
        <strong className='product-panel__price'>{price(item.price)}</strong>
        <StatusPill status={status} />
        <p className='product-panel__description'>{item.description}</p>

        {status === 'AVAILABLE' ? (
          <Link
            className={`button button--primary button--wide ${!ready ? 'is-disabled' : ''}`}
            to={`/acquire/${item.slug}`}
            aria-disabled={!ready}
          >
            Reserve this object <ArrowIcon />
          </Link>
        ) : (
          <div className='availability-note'>
            <strong>
              {status === 'SOLD' ? 'This object has found an owner.' : 'This object is on hold.'}
            </strong>
            <span>Open the back office to inspect the current reservation or reset the demo.</span>
          </div>
        )}

        <section className='inventory-details'>
          <h2>Inventory details</h2>
          <dl>
            <div>
              <dt>Material</dt>
              <dd>{item.material}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{item.condition}</dd>
            </div>
            <div>
              <dt>Provenance</dt>
              <dd>{item.provenance}</dd>
            </div>
          </dl>
          <a href={sitePath(`/objects/${item.slug}`)} target='_blank' rel='noreferrer'>
            Open competing tab <ExternalIcon />
          </a>
        </section>

        <section className='certificate-preview'>
          <div>
            <span>Certificate of Ordinariness</span>
            <p>Issued for one object, as presented.</p>
          </div>
          <CertificateSeal />
        </section>
      </div>
    </article>
  );
}
