import { memo } from 'react';

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed';

const VARIANT_CLASS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
};

const SPINNER_CLASS =
  'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${BASE_CLASS} ${variantClass} ${className}`}
    >
      {loading && <span className={SPINNER_CLASS} />}
      {children}
    </button>
  );
};


export default memo(Button);