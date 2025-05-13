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

  // Rút gọn tên cho legend
  const maxNameLength = 20;
  const chartData = {
    labels: products.map(p => truncate(p.name, maxNameLength) + ` (${p.sold} items)`),
    datasets: [
      {
        data: products.map(p => p.sold),
        backgroundColor: COLORS.slice(0, products.length),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#1f2937',
          font: { size: 14, family: 'Inter, sans-serif', weight: 'bold' },
          padding: 18,
          boxWidth: 24,
          // Hiển thị legend gọn gàng
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length) {
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: '#fff',
                lineWidth: 2,
                hidden: isNaN(data.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                index: i
              }));
            }
            return [];
          }
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = products[ctx.dataIndex];
            return ` ${p.name}: ${p.sold} sản phẩm`;
          },
        },
        backgroundColor: '#fff',
        titleColor: '#3b82f6',
        bodyColor: '#1f2937',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 8,
        caretSize: 8,
        displayColors: true,
      },
      title: {
        display: true,
        text: 'Top Selling Products',
        color: '#1f2937',
        font: { size: 20, weight: 'bold', family: 'Inter, sans-serif' },
        padding: { bottom: 18 },
      },
    },
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center h-full min-h-[320px]">
      <Pie data={chartData} options={chartOptions} style={{ maxHeight: 480 }} />
    </div>
  );
};

export default TopProductsList; 