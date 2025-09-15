import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const VNPayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const handleVNPayReturn = async () => {
      try {
        // Get query parameters from URL
        const urlParams = new URLSearchParams(location.search);
        const queryParams = {};
        
        for (const [key, value] of urlParams.entries()) {
          queryParams[key] = value;
        }

        // Send the query parameters to backend for verification
        const response = await api.get('/api/order/vnpay-return', {
          params: queryParams
        });

        setPaymentResult(response.data);

        if (response.data.success) {
          // Payment successful
          toast.success('Payment completed successfully!');
          clearCart();
          
          // Redirect to order success page after a short delay
          setTimeout(() => {
            navigate(`/order-success/${response.data.order._id}`);
          }, 2000);
        } else {
          // Payment failed
          toast.error(`Payment failed: ${response.data.message}`);
          
          // Redirect to cart page after a short delay
          setTimeout(() => {
            navigate('/cart');
          }, 3000);
        }

      } catch (error) {
        console.error('Error processing VNPay return:', error);
        toast.error('Error processing payment return');
        setPaymentResult({
          success: false,
          message: 'Error processing payment return'
        });
        
        // Redirect to cart page after a short delay
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleVNPayReturn();
  }, [location.search, navigate, clearCart]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your payment...</p>
          <p className="text-gray-600">Please wait while we verify your payment with VNPay</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {paymentResult?.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700 mb-4">
              Your payment has been processed successfully through VNPay.
            </p>
            <p className="text-sm text-green-600">
              Redirecting to order confirmation page...
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Payment Failed
            </h1>
            <p className="text-red-700 mb-4">
              {paymentResult?.message || 'Your payment could not be processed.'}
            </p>
            <p className="text-sm text-red-600">
              You will be redirected to your cart to try again...
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/cart')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Return to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VNPayReturnPage;
