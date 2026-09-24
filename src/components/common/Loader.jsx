import { memo } from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="status"
      aria-live="polite"
    >
      <div
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        aria-hidden="true"
      />
      <p className="mt-4 text-gray-500 text-sm">{text}</p>
    </div>
  );
};

export default memo(Loader);