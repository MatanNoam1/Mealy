import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../services/settings.service';
import { useAuth } from '../context/AuthContext';
import { applyTheme } from '../theme';
import './Settings.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIET_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'kosher'];

// Settings page (spec component #4): loads current settings from the backend,
// shows them in a form with >= 3 editable fields (Username, Email, Theme +
// dietary preferences), validates input, and shows loading/success/error.
function Settings() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    theme: 'light',
    dietaryPreferences: []
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getSettings()
      .then((data) => {
        if (!active) return;
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          theme: data.theme || 'light',
          dietaryPreferences: data.dietaryPreferences || []
        });
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
    setSaveError('');
  };

  const toggleDiet = (option) => {
    setForm((prev) => {
      const has = prev.dietaryPreferences.includes(option);
      return {
        ...prev,
        dietaryPreferences: has
          ? prev.dietaryPreferences.filter((d) => d !== option)
          : [...prev.dietaryPreferences, option]
      };
    });
    setSuccess('');
  };

  // Theme is applied live so the user sees it immediately, and persisted.
  const handleThemeChange = (theme) => {
    setField('theme', theme);
    applyTheme(theme);
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'Username is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email))
      errors.email = 'Enter a valid email address.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setSaveError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateSettings({
        firstName: form.firstName,
        email: form.email,
        theme: form.theme,
        dietaryPreferences: form.dietaryPreferences
      });
      setSuccess('Settings saved.');
      applyTheme(updated.theme || form.theme);
      // Keep the navbar name + cached profile in sync.
      if (user) {
        updateUser({
          ...user,
          firstName: updated.firstName,
          email: updated.email,
          theme: updated.theme,
          dietaryPreferences: updated.dietaryPreferences
        });
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings">
        <div className="settings__state">
          <span className="spinner" /> Loading settings…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="settings">
        <div className="settings__state settings__state--error">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>
      <p className="settings__subtitle">Manage your Mealy profile and preferences.</p>

      <form className="settings__card" onSubmit={handleSubmit} noValidate>
        {success && <div className="settings__alert settings__alert--ok">{success}</div>}
        {saveError && (
          <div className="settings__alert settings__alert--error">{saveError}</div>
        )}

        <label className="settings__label" htmlFor="firstName">
          Username
        </label>
        <input
          id="firstName"
          className={`settings__input ${fieldErrors.firstName ? 'settings__input--error' : ''}`}
          value={form.firstName}
          onChange={(e) => setField('firstName', e.target.value)}
        />
        {fieldErrors.firstName && (
          <span className="settings__field-error">{fieldErrors.firstName}</span>
        )}

        <label className="settings__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`settings__input ${fieldErrors.email ? 'settings__input--error' : ''}`}
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
        />
        {fieldErrors.email && (
          <span className="settings__field-error">{fieldErrors.email}</span>
        )}

        <span className="settings__label">Theme preference</span>
        <div className="settings__theme">
          {['light', 'dark'].map((option) => (
            <label key={option} className="settings__radio">
              <input
                type="radio"
                name="theme"
                value={option}
                checked={form.theme === option}
                onChange={() => handleThemeChange(option)}
              />
              {option === 'light' ? 'Light' : 'Dark'}
            </label>
          ))}
        </div>

        <span className="settings__label">Dietary preferences</span>
        <div className="settings__diet">
          {DIET_OPTIONS.map((option) => (
            <label key={option} className="settings__chip">
              <input
                type="checkbox"
                checked={form.dietaryPreferences.includes(option)}
                onChange={() => toggleDiet(option)}
              />
              {option}
            </label>
          ))}
        </div>

        <button className="settings__button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default Settings;
