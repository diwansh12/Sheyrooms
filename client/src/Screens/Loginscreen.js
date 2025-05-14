import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Components/Loader';
import Error from '../Components/Error';

function Loginscreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    const user = {
      email,
      password,
    };

    try {
      setLoading(true);
      setError('');
      
      const result = await axios.post('/api/users/login', user);
      setLoading(false);
      
      console.log('User data:', result.data);
      localStorage.setItem('currentUser', JSON.stringify(result.data));
      window.location.href = '/home';
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  }

  return (
    <div>
      {loading && <Loader />}
      <div className="row justify-content-center mt-5">
        <div className="col-md-5 mt-5">
          {error && <Error message={error} />}
          <div className="bs">
            <h2>Login</h2>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary mt-3" onClick={login}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginscreen;
