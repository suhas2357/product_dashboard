import Button from './Button.jsx';
import { memo } from 'react';
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-red-600 text-2xl font-bold">!</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Something went wrong</h3>
      <p className="text-gray-500 text-sm mt-1 max-w-md">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button onClick={onRetry}>Retry</Button>
        </div>
      )}
    </div>
  );
};

export default memo(ErrorMessage);