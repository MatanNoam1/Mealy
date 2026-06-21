// Small theme helper shared by Settings and App. Persists the choice and
// toggles a class on <body> that index.css reacts to.
const THEME_KEY = 'mealy_theme';

export function applyTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.body.classList.toggle('theme-dark', value === 'dark');
  localStorage.setItem(THEME_KEY, value);
}

export function loadTheme() {
  const value = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(value);
  return value;
}
