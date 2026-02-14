import { Link } from './Link';

export function Brand() {
  return (
    <Link className='brand' to='/'>
      <span className='brand__words'>
        FINITE G
        <span className='brand__rock'>
          O<span aria-hidden='true'>⌣</span>
        </span>
        ODS
      </span>
      <sup>1/1</sup>
      <span className='visually-hidden'>, home</span>
    </Link>
  );
}
