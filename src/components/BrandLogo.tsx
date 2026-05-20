import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  /** Icon only, or horizontal lockup with wordmark baked in */
  variant?: 'mark' | 'lockup';
  className?: string;
  href?: string;
  onClick?: () => void;
  /** Show “ISIC” text beside the mark (mark variant only) */
  showWordmark?: boolean;
  priority?: boolean;
};

const ALT = 'ISIC — Indian School of Innovation and Curiosity';

export default function BrandLogo({
  variant = 'mark',
  className = '',
  href,
  onClick,
  showWordmark = true,
  priority = false,
}: BrandLogoProps) {
  const isLockup = variant === 'lockup';

  const inner = (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <Image
        src={isLockup ? '/brand/isic-logo-lockup.png' : '/brand/isic-logo-icon.png'}
        alt={ALT}
        width={isLockup ? 168 : 40}
        height={isLockup ? 44 : 40}
        sizes={isLockup ? '168px' : '40px'}
        unoptimized
        priority={priority}
        className={
          isLockup
            ? 'h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-[10.5rem]'
            : 'h-9 w-9 shrink-0 rounded-lg object-cover'
        }
      />
      {!isLockup && showWordmark && (
        <span className="text-base font-bold tracking-tight text-[color:var(--isit-text)] sm:text-[1.0625rem]">
          ISIC
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="isit-public-nav-brand min-w-0 no-underline"
        title={ALT}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
