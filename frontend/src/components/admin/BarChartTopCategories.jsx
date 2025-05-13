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

// Subtle gradient or solid colors
const COLORS = [
  '#3b82f6', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6',
  '#fb923c', '#34d399', '#22d3ee', '#facc15'
];

// All possible categories
const ALL_CATEGORIES = [
  'laptop',
  'pc',
  'cpu',
  'graphicsCard',
  'memory',
  'storage',
  'monitor',
  'motherboard',
  'gears'
];

// Format category name
const formatCategoryName = (category) => {
  return category
    .split(/(?=[A-Z])|_/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BarChartTopCategories = ({ categories = [] }) => {
  // Ensure all categories are included with at least 0 sales
  const allCategoriesData = ALL_CATEGORIES.map(category => {
    const existingCategory = categories.find(c => c.category === category);
    return {
      category,
      sold: existingCategory ? existingCategory.sold : 0
    };
  });

  const chartData = {
    labels: allCategoriesData.map(c => formatCategoryName(c.category)),
    datasets: [
      {
        label: 'Products Sold',
        data: allCategoriesData.map(c => c.sold),
        backgroundColor: COLORS,
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
          label: (ctx) => ` ${formatCategoryName(allCategoriesData[ctx.dataIndex].category)}: ${ctx.parsed.y} products`,
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
    <div className="bg-white shadow-xl rounded-2xl p-8 h-[420px] min-h-[320px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 tracking-tight">Top Selling Categories</h2>
      <div className="flex-1 min-h-[320px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BarChartTopCategories;
