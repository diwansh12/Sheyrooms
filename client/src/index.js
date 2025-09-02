// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/globals.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PayPalScriptProvider
      options={{
        'client-id':
          'AZwCSNQNKFdYp5y0jcgwSGgy8ZuuX0reXn_ZHwvL5ceQCp9zHlYa7o42vJ1m42ZnzAkemKfQ3fu7HGil',
        currency: 'USD',
      }}
    >
      
      <App />
    </PayPalScriptProvider>
  </React.StrictMode>
);

reportWebVitals();
