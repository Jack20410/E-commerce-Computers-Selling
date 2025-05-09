import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { formatVND } from '../../utils/currencyFormatter';
import websocketService from '../../services/websocket.service';

const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipping: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusText = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {statusText[status]}
    </span>
  );
};

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `http://localhost:3001/api/orders/admin/${orderId}/status`,
        { status: newStatus, note: statusNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? {
                  ...order,
                  currentStatus: newStatus,
                  statusHistory: [
                    ...order.statusHistory,
                    { status: newStatus, timestamp: new Date(), note: statusNote }
                  ]
                }
              : order
          )
        );
        
        setStatusNote('');
        setSelectedOrder(null);
      } else {
        setError(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Error updating order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Initialize WebSocket connection and fetch orders
  useEffect(() => {
    if (token) {
      websocketService.connect(token);
      fetchOrders();

      // Subscribe to order updates
      websocketService.subscribeToOrderUpdates((data) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === data.orderId
              ? {
                  ...order,
                  currentStatus: data.newStatus,
                  statusHistory: [
                    ...order.statusHistory,
                    { status: data.newStatus, timestamp: new Date(), note: data.note }
                  ]
                }
              : order
          )
        );
      });

      // Cleanup
      return () => {
        websocketService.unsubscribeFromOrderUpdates();
        websocketService.disconnect();
      };
    }
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Total Orders: {orders.length}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Order ID: </span>
                      <span className="font-mono text-gray-700">{order._id}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Date: </span>
                      <span className="text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.currentStatus} />
                </div>

                {/* Customer Info */}
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{order.user?.fullName || 'Guest'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email || 'No email provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 py-3">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          <img
                            src={`http://localhost:3001${item.productSnapshot.image}`}
                            alt={item.productSnapshot.name}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productSnapshot.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × {formatVND(item.price)}
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            Subtotal: {formatVND(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">
                        Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </div>
                      {order.loyaltyPointsEarned > 0 && (
                        <div className="text-sm text-green-600">
                          Points Earned: +{order.loyaltyPointsEarned}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatVND(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                    </div>
                  </div>
                </div>

                {/* Status Timeline and Actions */}
                <div className="px-4 py-3 border-t">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Lịch sử trạng thái</h4>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={getStatusTransitions(order.currentStatus).length === 0}
                      >
                        Cập nhật trạng thái
                      </button>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      {order.statusHistory.map((status, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                            status.status === order.currentStatus 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {getStatusIcon(status.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {status.status === 'pending' && 'Chờ xác nhận'}
                                {status.status === 'confirmed' && 'Đã xác nhận'}
                                {status.status === 'shipping' && 'Đang giao hàng'}
                                {status.status === 'delivered' && 'Đã giao hàng'}
                                {status.status === 'cancelled' && 'Đã hủy'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(status.timestamp).toLocaleString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {status.note && (
                              <p className="mt-1 text-sm text-gray-600">
                                Ghi chú: {status.note}
                              </p>
                            )}
                          </div>
                          {index < order.statusHistory.length - 1 && (
                            <div className="absolute left-4 ml-3.5 h-full w-0.5 bg-gray-200" style={{ top: '2rem' }}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Update Order Status
              </h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setStatusNote('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <OrderStatusBadge status={selectedOrder.currentStatus} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getStatusTransitions(selectedOrder.currentStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={isUpdating}
                      className="flex items-center justify-center space-x-2 p-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      <span>{getStatusIcon(status)}</span>
                      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  rows="3"
                  placeholder="Add a note about this status update..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 