import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide Nav on Login/Register
  const authPaths = ['/login', '/register'];
  if (authPaths.includes(location.pathname) || !token) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.brand}>
          <span style={styles.brandLog}>PIT</span>
          <span style={styles.brandGold}>STOP</span>
          <span style={styles.fiuTag}> | FIU</span>
        </Link>

        <button
            className="navbar-hamburger"
            style={styles.hamburgerBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links${menuOpen ? ' open' : ''}`} style={styles.navLinks}>
          <Link to="/dashboard" style={location.pathname === '/dashboard' ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/garage" style={location.pathname.startsWith('/garage') || location.pathname.startsWith('/vehicles') ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)} >My Garage</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#081E3F',
    height: '65px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: '22px',
    fontWeight: '900',
  },
  brandLog: { color: 'white' },
  brandGold: { color: '#B6862C' },
  fiuTag: { color: 'white', fontSize: '14px', marginLeft: '8px', fontWeight: '300' },
  navLinks: {
    gap: '25px',
    alignItems: 'center',
  },
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    opacity: '0.8',
  },
  activeLink: {
    color: '#B6862C',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '700',
    borderBottom: '2px solid #B6862C',
    paddingBottom: '4px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #B6862C',
    color: '#B6862C',
    padding: '5px 15px',
    fontSize: '12px',
  },
  hamburgerBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    padding: '4px 8px',
  },
};

export default Navbar;