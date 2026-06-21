import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login page: validates email and password on the client, shows a loading
// state and any backend error, and redirects to the dashboard on success.
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6)
      errors.password = 'Password must be at least 6 characters.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit} noValidate>
        <div className="login__brand">
          <span aria-hidden="true">🍽</span> Mealy
        </div>
        <h1 className="login__title">Sign in</h1>
        <p className="login__subtitle">Plan your meals, skip the stress.</p>

        {serverError && <div className="login__alert">{serverError}</div>}

        <label className="login__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`login__input ${fieldErrors.email ? 'login__input--error' : ''}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="matan@mealy.com"
          autoComplete="username"
        />
        {fieldErrors.email && (
          <span className="login__field-error">{fieldErrors.email}</span>
        )}

        <label className="login__label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`login__input ${fieldErrors.password ? 'login__input--error' : ''}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="current-password"
        />
        {fieldErrors.password && (
          <span className="login__field-error">{fieldErrors.password}</span>
        )}

        <button className="login__button" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <p className="login__hint">
          Demo: any valid email and a 6+ character password works.
        </p>
      </form>
    </div>
  );
}

export default Login;
