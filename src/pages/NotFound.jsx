import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <p
        className="text-6xl sm:text-7xl font-bold text-blue-600"
        aria-hidden="true"
      >
        404
      </p>

      <h1 className="text-xl font-semibold text-gray-800 mt-3">
        Page not found
      </h1>

      <p className="text-gray-500 text-sm mt-2 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go Back
        </button>

        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};


export default memo(NotFound);