import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  isAdminLoggedIn: boolean;
  onLoginStatusChange: (status: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAdminLoggedIn, onLoginStatusChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLoginStatusChange(false);
    navigate('/'); // Redirect to home after logout
  };

  const isHomePage = location.pathname === '/';

  const navClass = isHomePage
    ? "navbar navbar-expand-lg navbar-dark bg-transparent"
    : "navbar navbar-expand-lg navbar-dark bg-dark";

  const navStyle = isHomePage
    ? { position: 'absolute' as 'absolute', width: '100%', zIndex: 100 }
    : {};


  return (
    <nav className={navClass} style={navStyle}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Tennis Championship
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAdminLoggedIn && (
              <li className="nav-item">
                <Link className="nav-link" to="/players">
                  Players
                </Link>
              </li>
            )}
            {isAdminLoggedIn && (
              <li className="nav-item">
                <Link className="nav-link" to="/tournaments">
                  Tournaments
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/add-match">
                Add Match
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/matches">
                Matches
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rankings">
                Rankings
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            {isAdminLoggedIn ? (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={handleLogout} style={{ color: 'white', textDecoration: 'none' }}>
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;