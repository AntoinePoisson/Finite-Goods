import { useDemoSnapshot } from '../app/StoreProvider';
import { ArrowIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ObjectCard } from '../components/ObjectCard';
import { StatusPill } from '../components/StatusPill';
import { catalog, price } from '../domain/catalog';
import { usePointerTilt } from '../hooks/usePointerTilt';
import { sitePath } from '../infrastructure/routing';

export function HomePage() {
  const { world } = useDemoSnapshot();
  const rock = catalog.find((item) => item.kind === 'rock')!;
  const rockStatus = world.objects.find((object) => object.id === rock.id)?.status ?? 'AVAILABLE';
  const tilt = usePointerTilt(1.2);

  return (
    <>
      <section className='home-hero tilt-scene' {...tilt}>
        <div className='home-hero__copy'>
          <h1>
            <span>One object.</span>
            <span>One reservation.</span>
            <span>No restock.</span>
          </h1>
          <Link className='button button--primary' to={`/objects/${rock.slug}`}>
            {rockStatus === 'AVAILABLE' ? 'Available' : 'View object'} <ArrowIcon />
          </Link>
        </div>

        <div className='home-hero__stage' role='img' aria-label='Ordinary Rock, featured object'>
          <div className='home-hero__shadow' aria-hidden='true' />
          <svg className='home-hero__rock-image' viewBox='0 0 480 384' aria-hidden='true'>
            <defs>
              <clipPath id='hero-rock-outline'>
                <path d='M71 244C67 198 86 151 127 114C169 77 225 46 276 48C341 51 384 101 401 166C417 230 403 287 359 317C325 339 147 339 102 312C81 299 71 273 71 244Z' />
              </clipPath>
            </defs>
            <image
              href={sitePath(rock.thumbnail)}
              width='480'
              height='384'
              clipPath='url(#hero-rock-outline)'
            />
          </svg>
        </div>

        <div className='home-hero__details'>
          <strong>{rock.name}</strong>
          <span>{rock.sku}</span>
          <small>Edition {rock.edition}</small>
          <b>{price(rock.price)}</b>
          <StatusPill status={rockStatus} />
        </div>
      </section>

      <section className='collection' id='collection'>
        <h2 className='visually-hidden'>Available objects</h2>
        <div className='object-grid'>
          {catalog.map((item, index) => (
            <ObjectCard
              key={item.id}
              index={index}
              item={item}
              status={world.objects.find((object) => object.id === item.id)?.status}
            />
          ))}
        </div>
      </section>
    </>
  );
}
