import { memo, useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const loggingOutRef = useRef(false);

  const handleLogout = useCallback(() => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setLoggingOut(true);
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const greeting = user ? `Hi, ${user.firstName || user.username}` : null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-50">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700" />
        </button>

        <Link to="/dashboard" className="font-bold text-lg text-blue-700">
          Product Admin
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {greeting && (
          <span className="hidden sm:block text-sm text-gray-600">
            {greeting}
          </span>
        )}
        <Button variant="outline" onClick={handleLogout} loading={loggingOut}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default memo(Navbar);