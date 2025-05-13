import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SalesChart from '../../components/admin/SalesChart';
import StatCard from '../../components/admin/StatCard';
import TopProductsList from '../../components/admin/TopProductsList';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import userService from '../../services/userService';
import BarChartTopCategories from '../../components/admin/BarChartTopCategories';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueType, setRevenueType] = useState('month');
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch initial data only once
        const [productsResponse, ordersResponse, totalCustomers, recentOrdersData, topProductsResponse, topCategoriesResponse] = await Promise.all([
          productService.getAllProducts(),
          orderService.getAllOrders(),
          userService.getTotalCustomers(),
          orderService.getRecentOrders(5),
          orderService.getTopSellingProducts(5),
          orderService.getTopSellingCategories(5)
        ]);

        // Update states with real data
        setTotalProducts(productsResponse.data.length);
        setTotalOrders(ordersResponse.orders.length);
        setTotalCustomers(totalCustomers);
        setRecentOrders(recentOrdersData);
        setTopProducts(topProductsResponse.data);
        setTopCategories(topCategoriesResponse.data);

        // Calculate total revenue from orders (only delivered)
        const total = ordersResponse.orders
          .filter(order => order.currentStatus === 'delivered')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        setTotalRevenue(total);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Only load initial data once

  // Add new useEffect for revenue type changes
  useEffect(() => {
    const updateRevenueData = async () => {
      try {
        const revenueResponse = await orderService.getRevenue(revenueType);
        setRevenueData(revenueResponse.data);
      } catch (error) {
        console.error('Error updating revenue data:', error);
      }
    };

    updateRevenueData();
  }, [revenueType]);

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  };

  const handleRevenueTypeChange = (type) => {
    setRevenueType(type);
  };

  // Tính tổng doanh thu và tổng số đơn hàng của khoảng thời gian đang xem
  const totalRevenuePeriod = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrdersPeriod = revenueData.reduce((sum, d) => sum + (d.orderCount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.fullName || 'Admin'}! Here's what's happening with your store today.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/admin/products/add"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Product
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Orders Card */}
          <StatCard 
            title="Total Orders"
            value={totalOrders}
            bgColor="bg-blue-100"
            icon={
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          {/* Total Revenue Card */}
          <StatCard 
            title="Total Revenue"
            value={formatVND(totalRevenue)}
            bgColor="bg-green-100"
            icon={
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          {/* Total Products Card */}
          <StatCard 
            title="Total Products"
            value={totalProducts}
            bgColor="bg-indigo-100"
            icon={
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
          />

          {/* Total Customers Card */}
          <StatCard 
            title="Total Customers"
            value={totalCustomers}
            bgColor="bg-purple-100"
            icon={
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Sales Chart */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue Statistics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleRevenueTypeChange('week')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  revenueType === 'week'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleRevenueTypeChange('month')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  revenueType === 'month'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleRevenueTypeChange('quarter')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  revenueType === 'quarter'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => handleRevenueTypeChange('year')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  revenueType === 'year'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-80">
            <SalesChart data={revenueData} type={revenueType} totalRevenuePeriod={totalRevenuePeriod} totalOrdersPeriod={totalOrdersPeriod} />
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Top Products */}
          <TopProductsList products={topProducts} />
          <BarChartTopCategories categories={topCategories} />

          {/* Recent Orders */}
          <RecentOrdersTable orders={recentOrders} formatCurrency={formatVND} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
