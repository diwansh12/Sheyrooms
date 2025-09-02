import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
    window.location.reload();
  }

  const displayUserName = (user) => {
    if (!user) return 'User';

    if (typeof user.name === 'string') {
      return user.name;
    } else if (typeof user.name === 'object' && user.name.first) {
      return `${user.name.first} ${user.name.last || ''}`.trim();
    }

    return user.email?.split('@')[0] || 'User';
  };

  const getInitials = (user) => {
    const name = displayUserName(user);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

    const handleLoginClick = () => {
    try {
      navigate('/login');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/login';
    }
  };
  // Don't render navbar on landing page
  if (location.pathname === '/' || location.pathname === '/landing') {
    return null;
  }


  return (
    <>
      <nav className={`navbar navbar-expand-lg fixed-top transition-all ${scrolled ? 'navbar-scrolled' : 'navbar-transparent'
        }`}>
        <div className="container">
          {/* Enhanced Brand */}
          <Link className="navbar-brand" to="/">
            <div className="brand-container">
              <div className="brand-icon">
                <i className="fas fa-hotel"></i>
              </div>
              <div className="brand-text">
                <span className="brand-name">SheyRooms</span>
                <span className="brand-tagline">Luxury Stays</span>
              </div>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className={`navbar-toggler ${isMobileMenuOpen ? 'active' : ''}`}
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Menu */}
          <div className={`navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto">
              {currentUser && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActiveRoute('/home') ? 'active' : ''}`}
                      to="/home"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fas fa-home"></i>
                      <span>Home</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActiveRoute('/home') ? 'active' : ''}`}
                      to="/home"  // ✅ This should work - shows rooms
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fas fa-bed"></i>
                      <span>Rooms</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
                      to="/profile"  // ✅ Change from /bookings to /profile
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fas fa-calendar-check"></i>
                      <span>My Bookings</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* User Actions */}
            <ul className="navbar-nav">
               {!currentUser ? (
        <div className="auth-buttons">
          <button onClick={handleLoginClick} className="btn btn-outline-light me-2">
            <i className="fas fa-sign-in-alt me-1"></i>
            Login
          </button>
          <Link to="/register">
            <button className="btn btn-primary">
              <i className="fas fa-user-plus me-1"></i>
              Register
            </button>
          </Link>
        </div>
      ) : (
                <li className="nav-item dropdown user-dropdown" ref={dropdownRef}>
                  <button
                    className="user-profile-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="user-avatar">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="User Avatar" />
                      ) : (
                        <span className="user-initials">{getInitials(currentUser)}</span>
                      )}
                      {currentUser.isAdmin && <div className="admin-badge"></div>}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{displayUserName(currentUser)}</span>
                      <span className="user-role">
                        {currentUser.isAdmin ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                    <i className={`fas fa-chevron-down chevron ${isDropdownOpen ? 'rotate' : ''}`}></i>
                  </button>

                  <div className={`dropdown-menu-custom ${isDropdownOpen ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <div className="user-avatar-large">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="User Avatar" />
                        ) : (
                          <span className="user-initials">{getInitials(currentUser)}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <h6>{displayUserName(currentUser)}</h6>
                        <p>{currentUser.email}</p>
                        {currentUser.isAdmin && (
                          <span className="badge bg-warning text-dark">Administrator</span>
                        )}
                      </div>
                    </div>

                    <div className="dropdown-body">
                      <Link
                        className="dropdown-item-custom"
                        to="/profile"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-user-circle"></i>
                        <span>My Profile</span>
                      </Link>

                      <Link
                        className="dropdown-item-custom"
                        to="/profile"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-calendar-alt"></i>
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        className="dropdown-item-custom"
                        to="/favorites"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-heart"></i>
                        <span>Favorites</span>
                      </Link>

                      {currentUser.isAdmin && (
                        <>
                          <div className="dropdown-divider"></div>
                          <Link
                            className="dropdown-item-custom admin-item"
                            to="/admin"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <i className="fas fa-cog"></i>
                            <span>Admin Panel</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="dropdown-footer">
                      <button
                        className="logout-btn"
                        onClick={logout}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Enhanced Styles */}
      <style>{`
        .navbar {
          padding: 1rem 0;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .navbar-transparent {
          background: rgba(13, 27, 42, 0.95);
        }

        .navbar-scrolled {
          background: rgba(13, 27, 42, 0.98);
          padding: 0.5rem 0;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .transition-all {
          transition: all 0.3s ease;
        }


      body {
       padding-top: 80px;
      }


.main-content {
  padding-top: 80px;
}

        /* Enhanced Brand */
        .brand-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
        }

        /* Enhanced Mobile Toggle */
        .navbar-toggler {
          border: none;
          padding: 0;
          width: 30px;
          height: 30px;
          position: relative;
          background: transparent;
          cursor: pointer;
        }

        .navbar-toggler span {
          display: block;
          width: 25px;
          height: 3px;
          background: white;
          margin: 5px 0;
          transition: 0.3s;
          border-radius: 3px;
        }

        .navbar-toggler.active span:nth-child(1) {
          transform: rotate(-45deg) translate(-5px, 6px);
        }

        .navbar-toggler.active span:nth-child(2) {
          opacity: 0;
        }

        .navbar-toggler.active span:nth-child(3) {
          transform: rotate(45deg) translate(-5px, -6px);
        }

        /* Enhanced Navigation Links */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem !important;
          border-radius: 8px;
          margin: 0 0.25rem;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8) !important;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .nav-link:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: white !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-link i {
          font-size: 1rem;
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-outline-light {
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 500;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }

        .btn-outline-light:hover {
          border-color: white;
          background: white;
          color: #0d1b2a;
          transform: translateY(-2px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-weight: 500;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Enhanced User Profile */
        .user-dropdown {
          position: relative;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .user-profile-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-initials {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .admin-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #ffd700;
          border-radius: 50%;
          border: 2px solid white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          line-height: 1;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          line-height: 1;
        }

        .chevron {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        /* Enhanced Dropdown Menu */
        .dropdown-menu-custom {
          position: absolute;
          top: 100%;
          right: 0;
          width: 300px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .dropdown-menu-custom.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .user-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details h6 {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-details p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.85rem;
        }

        .dropdown-body {
          padding: 0.5rem 0;
        }

        .dropdown-item-custom {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: #333;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
        }

        .dropdown-item-custom:hover {
          background: #f8f9fa;
          color: #667eea;
          transform: translateX(5px);
        }

        .dropdown-item-custom i {
          width: 20px;
          font-size: 1rem;
        }

        .admin-item {
          color: #e74c3c;
        }

        .admin-item:hover {
          background: #fff5f5;
          color: #e74c3c;
        }

        .dropdown-divider {
          height: 1px;
          background: #eee;
          margin: 0.5rem 0;
        }

        .dropdown-footer {
          padding: 0.5rem;
          border-top: 1px solid #eee;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        /* Responsive Design */
        @media (max-width: 991px) {
          .navbar-collapse {
            background: rgba(13, 27, 42, 0.98);
            border-radius: 16px;
            padding: 1rem;
            margin-top: 1rem;
            backdrop-filter: blur(10px);
          }

          .user-profile-btn {
            width: 100%;
            justify-content: flex-start;
            margin-top: 1rem;
          }

          .dropdown-menu-custom {
            position: static;
            width: 100%;
            transform: none;
            margin-top: 1rem;
            opacity: 1;
            visibility: visible;
          }

          .auth-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }

          .auth-buttons .btn {
            width: 100%;
          }
        }

        /* Additional Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-menu-custom.show {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Navbar;
