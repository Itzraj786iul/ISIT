import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
};

/** Standardized button — prefer over one-off sky/slate classes. */
export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...rest
}: Props) {
  return (
    <button type={type} className={`${variantClass[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
