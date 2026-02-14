import { Link } from '../components/Link';

export function NotFoundPage() {
  return (
    <section className='not-found'>
      <span>404</span>
      <h1>Nothing finite here.</h1>
      <p>That page is not in this collection.</p>
      <Link className='button button--primary' to='/'>
        Return to the objects
      </Link>
    </section>
  );
}
