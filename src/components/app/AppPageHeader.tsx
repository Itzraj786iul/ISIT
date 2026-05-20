'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

type AppPageHeaderProps = {
  items: AppBreadcrumbItem[];
};

/**
 * Token-based app chrome header (breadcrumb bar). Use on student / teacher / parent app pages.
 */
export function AppPageHeader({ items }: AppPageHeaderProps) {
  return (
    <header className="isit-app-header shrink-0">
      <div className="px-4 py-3 sm:px-6 md:px-8">
        <nav aria-label="Breadcrumb" className="isit-app-breadcrumb flex flex-wrap items-center gap-2 text-sm">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
                {item.href && !isLast ? (
                  <Link href={item.href} className="isit-app-breadcrumb-link font-medium no-underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'isit-app-breadcrumb-current font-medium' : 'isit-app-breadcrumb-link'}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
