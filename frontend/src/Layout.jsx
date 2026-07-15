import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
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
      <footer style={styles.footer}>
        <p>© 2026 Florida International University - PitStop Project</p>
      </footer>
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