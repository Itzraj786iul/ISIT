'use client';

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => (
    <aside
      className="hidden w-[220px] shrink-0 border-r border-[color:var(--isit-shell-border)] md:block"
      aria-hidden
    />
  ),
});

export default Sidebar;
