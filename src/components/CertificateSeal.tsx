import type { SVGProps } from 'react';

/* A stamped seal rather than two letters in a disc: the certificate is the one place the shop
   plays the notary, so the mark carries the ring text, the perforated edge and the 1/1 the brand
   already wears. Drawn in a single ink so it reads as pressed onto the paper, not printed with it. */
export function CertificateSeal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className='seal' viewBox='0 0 80 80' aria-hidden='true' {...props}>
      <defs>
        {/* Two half circles rather than one closed ring: each carries its own line the right way
            up, which a single path cannot do without turning the lower half upside down. */}
        <path id='seal-arc-top' d='M13 40a27 27 0 0 1 54 0' fill='none' />
        <path id='seal-arc-bottom' d='M15.5 40a24.5 24.5 0 0 0 49 0' fill='none' />
      </defs>

      <circle className='seal__teeth' cx='40' cy='40' r='38' />
      <circle className='seal__disc' cx='40' cy='40' r='34.5' />
      <circle className='seal__rule' cx='40' cy='40' r='31.6' />
      <circle className='seal__core' cx='40' cy='40' r='22.4' />

      <text className='seal__legend'>
        <textPath href='#seal-arc-top' startOffset='50%' textLength='52'>
          FINITE GOODS
        </textPath>
      </text>
      <text className='seal__legend'>
        <textPath href='#seal-arc-bottom' startOffset='50%' textLength='38'>
          ORDINARY
        </textPath>
      </text>

      {/* Lozenges where the two lines meet, so the ring closes instead of trailing off. */}
      <path className='seal__pip' d='m8.4 40 2.6-2.6 2.6 2.6-2.6 2.6zM66.4 40l2.6-2.6 2.6 2.6-2.6 2.6z' />

      <text className='seal__mark' x='40' y='41.8'>
        FG
      </text>
      <path className='seal__rule' d='M31.5 46.4h17' />
      <text className='seal__unit' x='40' y='53.8'>
        1 / 1
      </text>
    </svg>
  );
}
