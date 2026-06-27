import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Reuse the Login styles so both auth screens look identical.
import './Login.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register page: creates a new account. Validates every field on the client
// (required, valid email, 6+ char password) before calling the backend, shows
// any server error (e.g. email already taken) and redirects to the dashboard
// on success.
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required.';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.';

    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email)) errors.email = 'Enter a valid email address.';

    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6)
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
      await register(form);
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
        <h1 className="login__title">Create your account</h1>
        <p className="login__subtitle">Plan your meals, skip the stress.</p>

        {serverError && <div className="login__alert">{serverError}</div>}

        <label className="login__label" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          type="text"
          className={`login__input ${fieldErrors.firstName ? 'login__input--error' : ''}`}
          value={form.firstName}
          onChange={setField('firstName')}
          placeholder="Matan"
          autoComplete="given-name"
        />
        {fieldErrors.firstName && (
          <span className="login__field-error">{fieldErrors.firstName}</span>
        )}

        <label className="login__label" htmlFor="lastName">
          Last name
        </label>
        <input
          id="lastName"
          type="text"
          className={`login__input ${fieldErrors.lastName ? 'login__input--error' : ''}`}
          value={form.lastName}
          onChange={setField('lastName')}
          placeholder="Noam"
          autoComplete="family-name"
        />
        {fieldErrors.lastName && (
          <span className="login__field-error">{fieldErrors.lastName}</span>
        )}

        <label className="login__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`login__input ${fieldErrors.email ? 'login__input--error' : ''}`}
          value={form.email}
          onChange={setField('email')}
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
          value={form.password}
          onChange={setField('password')}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        {fieldErrors.password && (
          <span className="login__field-error">{fieldErrors.password}</span>
        )}

        <button className="login__button" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="login__hint">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
