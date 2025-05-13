import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  Title
} from 'chart.js';
import 'chart.js/auto';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler, Title);

const COLORS = {
  border: 'rgba(59, 130, 246, 1)', // #3b82f6
  point: 'rgba(99, 102, 241, 1)', // #6366f1
  bg: 'rgba(59, 130, 246, 0.12)',
  grid: '#e5e7eb',
  font: '#1f2937',
  tooltipBg: '#fff',
  tooltipText: '#3b82f6',
};

const SalesChart = ({ data = [], type = 'month' }) => {
  // Chuẩn hóa dữ liệu cho chartjs
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Doanh thu',
        data: data.map(item => item.revenue),
        fill: true,
        borderColor: COLORS.border,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const {ctx: c, chartArea} = chart;
          if (!chartArea) return COLORS.bg;
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59,130,246,0.18)');
          gradient.addColorStop(1, 'rgba(59,130,246,0.01)');
          return gradient;
        },
        pointBackgroundColor: COLORS.point,
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: COLORS.border,
        tension: 0.4,
        borderWidth: 3,
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
        text:
          type === 'week'
            ? 'Doanh Thu Theo Tuần'
            : type === 'month'
            ? 'Doanh Thu Theo Tháng'
            : 'Doanh Thu Theo Năm',
        color: COLORS.font,
        font: { size: 20, weight: 'bold', family: 'Inter, sans-serif' },
        padding: { bottom: 24 },
      },
      tooltip: {
        backgroundColor: COLORS.tooltipBg,
        titleColor: COLORS.tooltipText,
        bodyColor: COLORS.font,
        borderColor: COLORS.border,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('vi-VN')} ₫`,
        },
        displayColors: false,
        caretSize: 8,
        cornerRadius: 8,
        bodyFont: { family: 'Inter, sans-serif', size: 14 },
        titleFont: { family: 'Inter, sans-serif', size: 14, weight: 'bold' },
      },
    },
    scales: {
      x: {
        grid: {
          color: COLORS.grid,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          color: COLORS.font,
          font: { family: 'Inter, sans-serif', size: 14 },
        },
      },
      y: {
        grid: {
          color: COLORS.grid,
          borderDash: [4, 4],
        },
        ticks: {
          color: COLORS.font,
          font: { family: 'Inter, sans-serif', size: 14 },
          callback: (value) => value.toLocaleString('vi-VN') + ' ₫',
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
      },
      point: {
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    },
  };

  return (
    <div className="w-full h-full relative">
      <Line data={chartData} options={chartOptions} height={400} />
    </div>
  );
};

export default SalesChart; 