import React, { useState } from 'react';
import HashLoader from "react-spinners/HashLoader";

function Loader() {
  let [loading, setLoading] = useState(true);
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <div className="text-center">
        <HashLoader
          color='#3B82F6'
          loading={loading}
          size={60}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default Loader;
