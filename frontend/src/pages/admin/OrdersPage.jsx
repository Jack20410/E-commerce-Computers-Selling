import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
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
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipping: 'Shipping',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow ${statusColors[status]}`}>
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
      const response = await api.get('/api/orders/admin/orders');
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
      const response = await api.patch(
        `/api/orders/admin/${orderId}/status`,
        { status: newStatus, note: statusNote }
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

  // Calculate total items for an order
  const getTotalItems = (order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
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
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-700">Order Management</h1>
              <p className="mt-1 text-sm text-blue-500">
                Total Orders: {orders.length}
              </p>
            </div>
          </div>

          <div className="flow-root">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="-mx-4 -my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-blue-100">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Customer</th>
                        <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order Date</th>
                        <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Total Items</th>
                        <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3.5 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Total Amount</th>
                        <th className="px-3 py-3.5 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 bg-white">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-blue-50 transition">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-blue-700">
                            <Link 
                              to={`/admin/orders/${order._id}`} 
                              className="hover:underline"
                            >
                              {order._id}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {order.user?.fullName || 'Guest'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString('en-US')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {getTotalItems(order)} items
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <OrderStatusBadge status={order.currentStatus} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 text-right font-semibold">
                            {formatVND(order.totalAmount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              disabled={getStatusTransitions(order.currentStatus).length === 0}
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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