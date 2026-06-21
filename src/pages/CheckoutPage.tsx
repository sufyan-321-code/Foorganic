import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { CheckoutData, PaymentMethod } from '../types';
import { useToast } from '../context/ToastContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [formData, setFormData] = useState<CheckoutData>({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  const tax = state.total * 0.08;
  const grandTotal = state.total + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card_mock') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        addToast('Please fill in all card details', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const id = await createOrder(
        formData.fullName,
        formData.phoneNumber,
        formData.address,
        paymentMethod,
        state.items.map((item) => ({ product_id: item.id, quantity: item.quantity }))
      );
      setOrderId(id);
      clearCart();
      addToast('Order placed successfully!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to place order';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0 && !orderId) {
    navigate('/cart');
    return null;
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-earth-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-earth-900 mb-2">Order Received!</h1>
            <p className="text-earth-600 mb-2">Your order ID:</p>
            <p className="text-lg font-mono font-semibold text-organic-700 mb-4">
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-earth-600 mb-6">
              Payment: {paymentMethod === 'cod' ? 'Cash on Delivery (pay on delivery)' : 'Demo Card (paid)'}
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Checkout</h1>
        <div className="flex gap-4 mb-8 text-sm">
          <span className={step >= 1 ? 'text-organic-600 font-medium' : 'text-earth-400'}>
            1. Delivery
          </span>
          <span className="text-earth-300">→</span>
          <span className={step >= 2 ? 'text-organic-600 font-medium' : 'text-earth-400'}>
            2. Payment
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-earth-900 mb-6">Delivery Information</h2>
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-earth-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-earth-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="+92-300-1234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-earth-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="123 Main Street, City"
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary text-lg py-3">
                    Continue to Payment
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-earth-900 mb-6">Payment Method</h2>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-earth-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-earth-500">Pay when your order arrives</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-earth-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card_mock"
                        checked={paymentMethod === 'card_mock'}
                        onChange={() => setPaymentMethod('card_mock')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Demo Card (Lab Demo)</p>
                        <p className="text-sm text-earth-500">Simulated card payment for demo</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'card_mock' && (
                    <div className="space-y-3 p-4 bg-earth-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Card Number (4242 4242 4242 4242)"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-4 py-2 border border-earth-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="px-4 py-2 border border-earth-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="px-4 py-2 border border-earth-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn-secondary py-3"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary text-lg py-3 disabled:opacity-50"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-earth-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-earth-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-earth-900">
                      ₨{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4 border-t border-earth-200 pt-4">
                <div className="flex justify-between text-earth-600">
                  <span>Subtotal</span>
                  <span>₨{state.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-earth-600">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-earth-600">
                  <span>Tax</span>
                  <span>₨{tax.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-earth-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-earth-900">
                  <span>Total</span>
                  <span>₨{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
