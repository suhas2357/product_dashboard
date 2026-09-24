import { useCallback, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { validateLogin } from "../../utils/validators.js";
import { getErrorMessage } from "../../services/api/apiErrorHandler.js";
import Button from "../common/Button.jsx";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
    setApiError((prev) => (prev ? "" : prev));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submittingRef.current) return;

      const validationErrors = validateLogin(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      setApiError("");

      try {
        const loggedInUser = await login(form.username.trim(), form.password);
        if (loggedInUser) {
          navigate(from, { replace: true });
        }
      } catch (err) {
        setApiError(getErrorMessage(err));
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [form, login, navigate, from],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="emilys"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.username ? "border-red-400" : "border-gray-300"
          }`}
          autoComplete="username"
        />
        {errors.username && (
          <p className="text-red-600 text-xs mt-1">{errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="emilyspass"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.password ? "border-red-400" : "border-gray-300"
          }`}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-red-600 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        {submitting ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Demo: <strong>emilys</strong> / <strong>emilyspass</strong>
      </p>
    </form>
  );
};

export default LoginForm;
