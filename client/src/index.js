import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css'; // for Antd v5+

import App from './App';
import reportWebVitals from './reportWebVitals';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": "AZwCSNQNKFdYp5y0jcgwSGgy8ZuuX0reXn_ZHwvL5ceQCp9zHlYa7o42vJ1m42ZnzAkemKfQ3fu7HGil", currency: "USD" }}>
    <App />
    </PayPalScriptProvider>
     
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

