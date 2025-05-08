import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthBanner from '../../components/ui/AuthBanner';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: {
      name: '',
      street: '',
      ward: '',
      district: '',
      city: ''
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/address/provinces');
        setProvinces(response.data || []);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          console.log('Selected province code:', selectedProvince);
          const response = await axios.get(`http://localhost:3001/api/address/districts/${selectedProvince}`);
          console.log('Districts API response:', response.data);
          setDistricts(response.data);
          setWards([]); // Reset wards when district changes
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              district: '',
              ward: ''
            }
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          console.log('Selected district code:', selectedDistrict);
          const response = await axios.get(`http://localhost:3001/api/address/wards/${selectedDistrict}`);
          console.log('Wards API response:', response.data);
          setWards(response.data);
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              ward: ''
            }
          }));
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    const province = provinces.find(p => p.code === provinceCode);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: province ? province.name : '',
        district: '',
        ward: ''
      }
    }));
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    console.log('District select onChange value:', districtCode);
    setSelectedDistrict(districtCode);
    const district = districts.find(d => String(d.code) === String(districtCode));
    console.log('District found:', district);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: district ? district.name : '',
        ward: ''
      }
    }));
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    console.log('Ward select onChange value:', wardCode);
    const ward = wards.find(w => String(w.code) === String(wardCode));
    console.log('Ward found:', ward);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ward: wardCode
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Lấy tên phường, quận, thành phố từ mã
    const wardObj = wards.find(w => String(w.code) === String(formData.address.ward));
    const districtObj = districts.find(d => String(d.code) === String(selectedDistrict));
    const provinceObj = provinces.find(p => String(p.code) === String(selectedProvince));

    const addressToSend = {
      name: formData.address.name,
      street: formData.address.street,
      ward: wardObj ? wardObj.name : '',
      district: districtObj ? districtObj.name : '',
      city: provinceObj ? provinceObj.name : '',
      isDefault: true // Địa chỉ đầu tiên luôn là mặc định
    };

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          address: addressToSend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Đăng ký thành công, tự động đăng nhập
      login(data.data);
      
      // Chuyển về trang chủ
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Register form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6 py-8">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Create an Account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  sign in if you already have an account
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Address</h3>
                {/* Address Name */}
                <div>
                  <label htmlFor="addressName" className="block text-sm font-medium text-gray-700">
                    Address Name
                  </label>
                  <input
                    type="text"
                    name="address.name"
                    id="addressName"
                    value={formData.address.name}
                    onChange={handleChange}
                    placeholder="e.g., Home, Office, etc."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                {/* City/Province */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City/Province
                  </label>
                  <select
                    id="city"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select City/Province</option>
                    {Array.isArray(provinces) && provinces.map(province => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* District */}
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    id="district"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Select District</option>
                    {Array.isArray(districts) && districts.map(district => (
                      <option key={district.code} value={String(district.code)}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Ward */}
                <div>
                  <label htmlFor="ward" className="block text-sm font-medium text-gray-700">
                    Ward
                  </label>
                  <select
                    id="ward"
                    value={formData.address.ward}
                    onChange={handleWardChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Ward</option>
                    {Array.isArray(wards) && wards.map(ward => (
                      <option key={ward.code} value={String(ward.code)}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Street */}
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    id="street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-600 text-center">
                A temporary password will be sent to your email
              </p>
            </form>

            {/* Sign up with Facebook and Google */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <a
                    href="http://localhost:3001/auth/google"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Google</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      />
                    </svg>
                    <span className="ml-2">Google</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Banner */}
      <div className="hidden lg:block lg:w-1/2 xl:w-2/3">
        <AuthBanner />
      </div>
    </div>
  );
};

export default Register;
