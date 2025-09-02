// components/booking/PaymentMethods.jsx - Enhanced Payment Component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentMethods = ({ data, onChange, onPaymentSuccess, processing, amount }) => {
  const [selectedMethod, setSelectedMethod] = useState(data.paymentMethod || 'paypal');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [walletProvider, setWalletProvider] = useState('paytm');

  const paymentMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <CreditCard size={24} />,
      description: 'Pay securely with your PayPal account',
      popular: true
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CreditCard size={24} />,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: <Smartphone size={24} />,
      description: 'Google Pay, PhonePe, Paytm UPI'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building size={24} />,
      description: 'All major banks supported'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <Wallet size={24} />,
      description: 'Paytm, Amazon Pay, MobiKwik'
    },
    {
      id: 'manual',
      name: 'Pay at Hotel',
      icon: <Building size={24} />,
      description: 'Cash or card payment during check-in'
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    onChange({ paymentMethod: methodId });
  };

  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);

    const handleStripeSubmit = async () => {
      if (!stripe || !elements) return;

      const card = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
      });

      if (error) {
        setCardError(error.message);
      } else {
        onPaymentSuccess({
          method: 'stripe',
          paymentMethodId: paymentMethod.id,
          transactionId: `stripe_${Date.now()}`
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
            onChange={(e) => {
              setCardError(e.error ? e.error.message : null);
              setCardComplete(e.complete);
            }}
          />
        </div>

        {cardError && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle size={16} className="mr-2" />
            {cardError}
          </div>
        )}

        <Button
          onClick={handleStripeSubmit}
          disabled={!stripe || !cardComplete || processing}
          loading={processing}
          className="w-full"
        >
          Pay ₹{amount.toLocaleString()}
        </Button>
      </div>
    );
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'paypal':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center text-blue-800">
                <Shield size={20} className="mr-2" />
                <span className="font-medium">Secure PayPal Payment</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You'll be redirected to PayPal to complete your payment securely.
              </p>
            </div>

            <PayPalScriptProvider options={{
              "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
              currency: "USD"
            }}>
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        value: (amount / 80).toFixed(2) // Convert INR to USD (approximate)
                      }
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  const order = await actions.order.capture();
                  onPaymentSuccess({
                    method: 'paypal',
                    transactionId: order.id,
                    orderId: data.orderID
                  });
                }}
                onError={(err) => {
                  console.error('PayPal error:', err);
                }}
              />
            </PayPalScriptProvider>
          </div>
        );

      case 'stripe':
        return (
          <Elements stripe={stripePromise}>
            <StripeForm />
          </Elements>
        );

      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                <button
                  key={app}
                  className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 text-center"
                >
                  <div className="text-sm font-medium">{app}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => onPaymentSuccess({
                method: 'upi',
                upiId,
                transactionId: `upi_${Date.now()}`
              })}
              disabled={!upiId || processing}
              loading={processing}
              className="w-full"
            >
              Pay ₹{amount.toLocaleString()}
            </Button>
          </div>
        );

      case 'netbanking':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Bank
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Select Bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>Other</option>
              </select>
            </div>

            <Button
              onClick={() => onPaymentSuccess({
                method: 'netbanking',
                transactionId: `nb_${Date.now()}`
              })}
              disabled={processing}
              loading={processing}
              className="w-full"
            >
              Pay ₹{amount.toLocaleString()}
            </Button>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Wallet
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['Paytm', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map((wallet) => (
                  <label key={wallet} className="flex items-center">
                    <input
                      type="radio"
                      name="wallet"
                      value={wallet.toLowerCase().replace(' ', '')}
                      checked={walletProvider === wallet.toLowerCase().replace(' ', '')}
                      onChange={(e) => setWalletProvider(e.target.value)}
                      className="mr-2"
                    />
                    {wallet}
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={() => onPaymentSuccess({
                method: 'wallet',
                provider: walletProvider,
                transactionId: `wallet_${Date.now()}`
              })}
              disabled={processing}
              loading={processing}
              className="w-full"
            >
              Pay ₹{amount.toLocaleString()}
            </Button>
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Pay at Hotel</h4>
                  <p className="text-sm text-yellow-700">
                    You can pay the full amount during check-in using cash or card.
                    Your booking will be confirmed but marked as "payment pending".
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Accepted Payment Methods at Hotel:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cash (INR)</li>
                <li>• Credit Cards (Visa, Mastercard, Amex)</li>
                <li>• Debit Cards</li>
                <li>• UPI Payments</li>
              </ul>
            </div>

            <Button
              onClick={() => onPaymentSuccess({
                method: 'manual',
                status: 'pending',
                transactionId: `manual_${Date.now()}`
              })}
              disabled={processing}
              loading={processing}
              className="w-full"
              variant="outline"
            >
              Confirm Booking (Pay at Hotel)
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </div>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              onClick={() => handleMethodSelect(method.id)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {method.popular && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="flex items-start">
                <div className="text-blue-600 mr-3 mt-1">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>

                <div className="ml-2">
                  <input
                    type="radio"
                    checked={selectedMethod === method.id}
                    onChange={() => { }}
                    className="text-blue-600"
                  />
                </div>
              </div>

              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complete Payment
            </h3>
            {renderPaymentForm()}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Security Notice */}
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start">
          <Lock className="text-green-600 mr-3 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Secure Payment</h4>
            <p className="text-sm text-green-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethods;
