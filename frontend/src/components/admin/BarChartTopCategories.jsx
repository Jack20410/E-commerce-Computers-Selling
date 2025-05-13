import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import 'chart.js/auto';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// Màu gradient hoặc đơn sắc tinh tế
const COLORS = [
  '#3b82f6', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6',
  '#fb923c', '#34d399', '#22d3ee', '#facc15', '#f87171'
];

const BarChartTopCategories = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center h-full min-h-[320px]">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Selling Categories</h3>
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  const chartData = {
    labels: categories.map(c => c.category),
    datasets: [
      {
        label: 'Sản phẩm đã bán',
        data: categories.map(c => c.sold),
        backgroundColor: COLORS.slice(0, categories.length),
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top Selling Categories',
        color: '#1f2937',
        font: { size: 22, weight: 'bold', family: 'Inter, sans-serif' },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#3b82f6',
        bodyColor: '#111827',
        borderColor: '#93c5fd',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.y} sản phẩm`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#374151',
          font: { family: 'Inter, sans-serif', size: 13 },
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
          borderDash: [6, 6],
        },
        ticks: {
          beginAtZero: true,
          color: '#374151',
          font: { family: 'Inter, sans-serif', size: 13 },
          precision: 0,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutBounce',
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6 h-[400px] w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default BarChartTopCategories;
