import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import specificationFields from '../../utils/specificationFields';
import productService from '../../services/productService';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    price: '',
    stock: '',
    description: '',
    specifications: {},
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleBaseInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: finalValue
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setMessage({ text: 'Maximum 5 images allowed', type: 'error' });
      return;
    }
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
    
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Basic validation
      if (!formData.category) {
        throw new Error('Category is required');
      }

      if (formData.images.length === 0) {
        throw new Error('At least one image is required');
      }

      // Create FormData for multipart/form-data submission
      const productData = new FormData();
      
      // Add base fields
      productData.append('category', formData.category);
      productData.append('brand', formData.brand);
      productData.append('model', formData.model);
      productData.append('price', formData.price);
      productData.append('stock', formData.stock);
      productData.append('description', formData.description);

      // Add each specification field individually
      const currentSpecs = specificationFields[formData.category] || [];
      currentSpecs.forEach(field => {
        const fieldName = field.name;
        let fieldValue = formData.specifications[fieldName];
        
        // Special handling for array fields
        if (fieldName === 'ports' || fieldName === 'pcieSlots' || fieldName === 'features') {
          if (typeof fieldValue === 'string') {
            // Already a string, no need to convert
            productData.append(`specifications[${fieldName}]`, fieldValue);
          } else if (Array.isArray(fieldValue)) {
            // Join array to string (backend will parse it)
            productData.append(`specifications[${fieldName}]`, fieldValue.join(','));
          }
        } 
        // Special handling for checkbox fields
        else if (field.type === 'checkbox') {
          productData.append(`specifications[${fieldName}]`, fieldValue ? 'true' : 'false');
        }
        // Regular fields
        else if (fieldValue !== undefined && fieldValue !== null) {
          productData.append(`specifications[${fieldName}]`, fieldValue);
        }
      });

      // Add images
      formData.images.forEach((image) => {
        productData.append('images', image);
      });

      // Use productService instead of direct fetch
      const result = await productService.createProduct(productData);

      setMessage({ text: 'Product added successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        category: '',
        brand: '',
        model: '',
        price: '',
        stock: '',
        description: '',
        specifications: {},
        images: []
      });
      setImagePreviewUrls([]);
      
      // Redirect to admin products page after delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ 
        text: error.message || (typeof error === 'string' ? error : 'Error adding product'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      
      {message.text && (
        <div 
          className={`mb-4 p-4 rounded ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        encType="multipart/form-data"
      >
        {/* Basic Information Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                <option value="pc">PC</option>
                <option value="laptop">Laptop</option>
                <option value="cpu">CPU</option>
                <option value="graphicsCard">Graphics Card</option>
                <option value="motherboard">Motherboard</option>
                <option value="memory">Memory</option>
                <option value="storage">Storage</option>
                <option value="monitor">Monitor</option>
                <option value="gears">Gears</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Brand*</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Model*</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Price*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Stock*</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                min="0"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleBaseInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        {/* Specifications Card */}
        {formData.category && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specificationFields[formData.category]?.map((spec) => {
                if (spec.type === 'checkbox') {
                  return (
                    <div key={spec.name} className="flex items-center">
                      <input
                        type="checkbox"
                        id={spec.name}
                        name={spec.name}
                        checked={!!formData.specifications[spec.name]}
                        onChange={handleSpecificationChange}
                        className="mr-2"
                      />
                      <label htmlFor={spec.name} className="font-medium">
                        {spec.label}{spec.required === false ? '' : '*'}
                      </label>
                    </div>
                  );
                }
                
                return (
                  <div key={spec.name}>
                    <label className="block mb-2 font-medium">
                      {spec.label}{spec.required === false ? '' : '*'}
                    </label>
                    <input
                      type={spec.type}
                      name={spec.name}
                      value={formData.specifications[spec.name] || ''}
                      onChange={handleSpecificationChange}
                      className="w-full p-2 border rounded"
                      required={spec.required !== false}
                      placeholder={
                        spec.name === 'ports' || spec.name === 'pcieSlots' || spec.name === 'features'
                          ? 'Enter values separated by commas'
                          : ''
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Upload Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Add Images (Max 5)*</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Image Preview</h3>
              <div className="flex flex-wrap gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-32 h-32 object-cover border rounded"
                    />
                    {index === 0 && (
                      <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {message.text && (
        <div 
          className={`mb-4 p-4 rounded ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message.text}
        </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white ${
              loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 