import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

// Top navigation shown on every page after login (spec component #2).
// Shows logo, nav links, the logged-in user name and a logout button.
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Show the username (firstName) as-is, matching the Settings "Username" field.
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
