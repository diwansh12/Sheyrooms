// Create components/FavoritesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FavoritesScreen() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Load favorites from localStorage or API
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, [currentUser, navigate]);

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h2 className="mb-4">
            <i className="fas fa-heart me-2 text-danger"></i>
            My Favorites
          </h2>
          
          {favorites.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-heart-broken fa-3x text-muted mb-3"></i>
              <h4>No favorites yet</h4>
              <p className="text-muted">Start exploring rooms and add them to your favorites!</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/home')}
              >
                Browse Rooms
              </button>
            </div>
          ) : (
            <div className="row">
              {favorites.map((room, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card">
                    <img 
                      src={room.image || 'https://via.placeholder.com/300x200'} 
                      className="card-img-top" 
                      alt={room.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{room.name}</h5>
                      <p className="card-text">{room.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-primary fw-bold">₹{room.price}/night</span>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            const updatedFavorites = favorites.filter((_, i) => i !== index);
                            setFavorites(updatedFavorites);
                            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                          }}
                        >
                          <i className="fas fa-heart-broken"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritesScreen;
