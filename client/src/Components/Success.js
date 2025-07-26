import React from 'react';

function Success({ message }) {
  return (
    <div className="alert alert-success d-flex align-items-center" role="alert" style={{
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 6px rgba(25, 135, 84, 0.1)',
      marginBottom: '20px'
    }}>
      <div className="me-3" style={{ fontSize: '1.2em' }}>✅</div>
      <div>
        <strong>Success:</strong> {message || 'Operation completed successfully!'}
      </div>
    </div>
  );
}

export default Success;
