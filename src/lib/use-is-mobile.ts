'use client';

import { useEffect, useState } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';

/** Matches tablet-and-below breakpoint used in mobile-responsive.css */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return mobile;
}

/** Sets `html.is-mobile` for global CSS performance hooks */
export function useMobileHtmlClass() {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => {
      document.documentElement.classList.toggle('is-mobile', mq.matches);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      document.documentElement.classList.remove('is-mobile');
    };
  }, []);
}
