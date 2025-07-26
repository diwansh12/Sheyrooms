import React from 'react';

function Error({ message }) {
  return (
    <div className="alert alert-danger d-flex align-items-center" role="alert" style={{
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 6px rgba(220, 53, 69, 0.1)',
      marginBottom: '20px'
    }}>
      <div className="me-3" style={{ fontSize: '1.2em' }}>⚠️</div>
      <div>
        <strong>Error:</strong> {message || 'Something went wrong!'}
      </div>
    </div>
  );
}

export default Error;
