import {memo} from 'react';
const EmptyState = ({ title = 'No results found', message = 'Try adjusting your search or filters.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-gray-400 text-2xl">∅</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm mt-1 max-w-md">{message}</p>
    </div>
  );
};

export default memo(EmptyState);