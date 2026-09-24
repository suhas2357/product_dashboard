import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }


  const from = location.state?.from?.pathname || '/dashboard';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Admin Login
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Sign in to manage products
        </p>

        <LoginForm redirectTo={from} />
      </div>
    </main>
  );
};


export default memo(Login);