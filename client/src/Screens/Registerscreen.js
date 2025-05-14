import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Components/Loader';
import Error from '../Components/Error';
import Success from '../Components/Success';

function Registerscreen() {
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [cpassword, setcpassword] = useState('');
  const [loading, setloading] = useState(false); // changed to false
  const [error, setError] = useState('');
  const [success, setsuccess] = useState(false);

  async function register() {
    if (password !== cpassword) {
      alert('Passwords do not match');
      return;
    }

    const user = {
      name,
      email,
      password,
    };

    try {
      setloading(true);
      setError('');
      setsuccess(false);
      
      await axios.post('/api/users/register', user);
      
      setloading(false);
      setsuccess(true);

      // Clear form
      setname('');
      setemail('');
      setpassword('');
      setcpassword('');
    } catch (err) {
      console.log(err);
      setloading(false);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <div>
      {loading && <Loader />}
      {error && <Error message={error} />}
      {success && <Success message='Registration Successful' />}

      <div className='row justify-content-center mt-5'>
        <div className='col-md-5 mt-5'>
          <div className='bs'>
            <h2>Register</h2>
            <input
              type='text'
              className='form-control'
              placeholder='Name'
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <input
              type='email'
              className='form-control'
              placeholder='Email'
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
            <input
              type='password'
              className='form-control'
              placeholder='Password'
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            <input
              type='password'
              className='form-control'
              placeholder='Confirm Password'
              value={cpassword}
              onChange={(e) => setcpassword(e.target.value)}
            />
            <button className='btn btn-primary mt-3' onClick={register}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registerscreen;
