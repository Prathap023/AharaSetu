import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    // Quick progress animation
    const t1 = setTimeout(() => setProgress(40), 50);
    const t2 = setTimeout(() => setProgress(70), 150);
    const t3 = setTimeout(() => setProgress(90), 300);
    const t4 = setTimeout(() => setProgress(100), 450);
    const t5 = setTimeout(() => setLoading(false), 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <>
      {/* Top progress bar */}
      <div style={styles.bar}>
        <div style={{ ...styles.progress, width: `${progress}%` }} />
      </div>

      {/* Page fade overlay */}
      <div style={{
        ...styles.overlay,
        opacity: progress < 100 ? 0.3 : 0,
      }} />
    </>
  );
}

const styles = {
  bar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '3px',
    zIndex: 9999,
    background: 'rgba(255,82,0,0.15)',
  },
  progress: {
    height: '100%',
    background: 'linear-gradient(to right, #FF5200, #FF8C00)',
    borderRadius: '0 2px 2px 0',
    transition: 'width 0.15s ease',
    boxShadow: '0 0 8px rgba(255,82,0,0.6)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'white',
    zIndex: 998,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
  },
};

export default PageLoader;