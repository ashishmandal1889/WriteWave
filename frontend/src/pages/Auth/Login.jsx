import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/FormInput/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { validateEmail, validatePassword } from '../../utils/validators';
import logoSvg from '../../assets/images/writewave-logo.svg';
import './Auth.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Retrieve origin route if redirected from ProtectedRoute
  const redirectPath = location.state?.from?.pathname || '/my-blogs';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to connect to authentication server. Please ensure your Spring Boot API is running.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          {/* Brand Header */}
          <div className="auth-header">
            <Link to="/" className="auth-brand">
              <img src={logoSvg} alt="WriteWave" className="auth-logo" />
              <span className="brand-name">WriteWave</span>
            </Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account to continue writing</p>
          </div>

          {apiError && (
            <ErrorMessage
              title="Authentication Failed"
              message={apiError}
              onRetry={handleSubmit}
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              required
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={isSubmitting}
            >
              <LogIn size={18} />
              <span>{isSubmitting ? 'Signing in...' : 'Login'}</span>
            </button>
          </form>

          {/* Navigation to Registration */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-switch-link">
                Sign Up <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
