import { Link } from 'react-router-dom';

const RecentOrdersTable = ({ orders = [], formatCurrency }) => {
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <h3 className="text-xl font-bold text-blue-700 mb-6">Recent Orders</h3>
      <div className="flow-root">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No recent orders</p>
          </div>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-3.5 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3.5 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50 transition">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-blue-700">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{order.customer}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 text-right font-semibold">
                        {formatCurrency ? formatCurrency(order.total) : order.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <Link
            to="/admin/orders"
            className="inline-block px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersTable;