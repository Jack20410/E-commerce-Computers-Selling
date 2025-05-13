import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#3b82f6', '#6366f1', '#f59e42', '#10b981', '#ef4444', '#f472b6', '#fbbf24', '#0ea5e9', '#a21caf', '#eab308'
];

// Hàm rút gọn tên sản phẩm
const truncate = (str, n = 20) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

const TopProductsList = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center h-full min-h-[320px]">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Selling Products</h3>
        <p className="text-gray-500">No products data available</p>
      </div>
    );
  }

  // Hàm định dạng tiền VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Rút gọn tên sản phẩm, có tooltip
  const maxNameLength = 20;
  const renderProductName = (name) => (
    <span title={name} className="cursor-help">
      {truncate(name, maxNameLength)}
    </span>
  );

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 min-h-[320px]">
      <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity Sold</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 text-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mx-auto flex items-center justify-center">
                    <img
                      src={`http://localhost:3001${p.image}`}
                      alt={p.name}
                      className="object-cover w-12 h-12"
                      onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-blue-600 text-center">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{renderProductName(p.name)}</td>
                <td className="px-4 py-3 text-center text-gray-700">{p.sold}</td>
                <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatVND(p.revenue || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsList; 