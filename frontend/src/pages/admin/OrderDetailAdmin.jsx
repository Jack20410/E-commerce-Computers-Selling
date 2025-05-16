import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { formatVND } from '../../utils/currencyFormatter';
import api from '../../services/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusText = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const getStatusTransitions = (currentStatus) => {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipping', 'cancelled'],
    shipping: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };
  return transitions[currentStatus] || [];
};

const getStatusIcon = (status) => {
  const icons = {
    pending: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    confirmed: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    shipping: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    delivered: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    cancelled: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };
  return icons[status];
};

const OrderDetailAdmin = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        setError('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const response = await api.patch(
        `/api/orders/admin/${orderId}/status`,
        { status: newStatus, note: statusNote }
      );
      if (response.data.success) {
        // Update local order state
        setOrder(prev => ({
          ...prev,
          currentStatus: newStatus,
          statusHistory: [
            ...prev.statusHistory,
            { status: newStatus, timestamp: new Date(), note: statusNote }
          ]
        }));
        setStatusNote('');
      } else {
        setUpdateError(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Error updating order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-4">{error || 'Order not found'}</p>
        <Link to="/admin/orders" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.currentStatus]}`}>{statusText[order.currentStatus]}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Order ID</p>
            <p className="font-mono">{order._id}</p>
          </div>
          <div>
            <p className="text-gray-600">Order Date</p>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Customer</p>
            <p>{order.user?.fullName || 'Guest'}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p>{order.user?.email || 'No email provided'}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="font-semibold mb-2">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_API_URL}${item.productSnapshot.image}`}
                    alt={item.productSnapshot.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productSnapshot.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity} × {formatVND(item.price)}</p>
                  <p className="text-sm font-medium text-gray-700">Subtotal: {formatVND(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
              {order.loyaltyPointsEarned > 0 && (
                <div className="text-sm text-green-600">Points Earned: +{order.loyaltyPointsEarned}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatVND(order.totalAmount)}</div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Status History</h4>
          <div className="space-y-2 mb-6">
            {order.statusHistory.map((status, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.status]}`}>{statusText[status.status]}</span>
                <span className="text-xs text-gray-500">{new Date(status.timestamp).toLocaleString()}</span>
                {status.note && <span className="text-xs text-gray-600">Note: {status.note}</span>}
              </div>
            ))}
          </div>
          {/* Update Status Actions */}
          {getStatusTransitions(order.currentStatus).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="mb-2 font-semibold text-gray-800">Update Order Status</div>
              {updateError && <div className="text-red-600 text-sm mb-2">{updateError}</div>}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {getStatusTransitions(order.currentStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(order._id, status)}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 p-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{getStatusIcon(status)}</span>
                    <span>{statusText[status]}</span>
                  </button>
                ))}
              </div>
              <textarea
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2 mb-2"
                rows="2"
                placeholder="Add a note about this status update..."
              />
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link to="/admin/orders" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Back to Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailAdmin; 