import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          📹 VideoSync
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/explore" className="nav-link">
            Explore
          </Link>
          <Link to="/upload" className="nav-link">
            Upload
          </Link>
        </nav>

        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{user?.username}</span>
            <span className="chevron">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-email">{user?.email}</p>
                <p className="user-city">📍 {user?.city}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-link" onClick={() => setShowUserMenu(false)}>
                Profile
              </Link>
              <button className="dropdown-link logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;