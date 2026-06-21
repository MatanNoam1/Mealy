import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

// Top navigation bar for the logged-in pages: logo, page links, the current
// user's name and a logout button.
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Same value shown in the Settings "Username" field; falls back to Guest.
  const displayName = user ? user.firstName : 'Guest';

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            🍽
          </span>
          Mealy
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/" end className="navbar__link">
            Dashboard
          </NavLink>
          <NavLink to="/mealplans" className="navbar__link">
            Meal Plans
          </NavLink>
          <NavLink to="/ai" className="navbar__link">
            AI
          </NavLink>
          <NavLink to="/settings" className="navbar__link">
            Settings
          </NavLink>
        </nav>

        <div className="navbar__user">
          <span className="navbar__username">{displayName}</span>
          <button
            type="button"
            className="navbar__logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
