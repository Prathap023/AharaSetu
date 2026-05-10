import React, { useState } from 'react';

function StarRating({ value, onChange, readOnly = false, size = '28px' }) {
  const [hovered, setHovered] = useState(0);

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              fontSize: size,
              cursor: readOnly ? 'default' : 'pointer',
              color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.15s, transform 0.15s',
              transform: !readOnly && star <= hovered ? 'scale(1.2)' : 'scale(1)',
              display: 'inline-block',
              lineHeight: 1,
            }}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
      {!readOnly && hovered > 0 && (
        <span style={styles.label}>{labels[hovered]}</span>
      )}
      {readOnly && value > 0 && (
        <span style={styles.readOnlyLabel}>{value} / 5</span>
      )}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
  stars: { display: 'flex', gap: '2px' },
  label: { fontSize: '13px', color: '#f59e0b', fontWeight: '600' },
  readOnlyLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500' },
};

export default StarRating;