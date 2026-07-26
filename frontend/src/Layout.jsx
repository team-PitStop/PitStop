import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function Layout({ children }) {
  const location = useLocation();

  // Login and Register render a full-bleed scene of their own, so the
  // shared footer is hidden there — same authPaths approach Navbar uses
  // to hide itself on those routes.
  const authPaths = ['/login', '/register'];
  const showFooter = !authPaths.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        {children}
      </main>
      {showFooter && (
        <footer style={styles.footer}>
          <p>© 2026 Florida International University - PitStop Project</p>
        </footer>
      )}
    </div>
  );
}

const styles = {
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
    marginTop: '40px'
  }
};

export default Layout;