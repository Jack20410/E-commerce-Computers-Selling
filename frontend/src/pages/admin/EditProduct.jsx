import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import specificationFields from '../../utils/specificationFields';
import productService from '../../services/productService';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    price: '',
    stock: '',
    description: '',
    specifications: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [categoryHasChanged, setCategoryHasChanged] = useState(false);
  const [mainImageId, setMainImageId] = useState(null);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await productService.getProductById(id);
        
        // Set basic product fields
        setFormData({
          category: product.category || '',
          brand: product.brand || '',
          model: product.model || '',
          price: product.price || '',
          stock: product.stock || '',
          description: product.description || '',
          specifications: product.specifications || {}
        });
        
        // Set existing images
        if (product.images && Array.isArray(product.images)) {
          const images = product.images.map((img, index) => ({
            ...img,
            order: index
          }));
          setExistingImages(images);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setMessage({ 
          text: error.message || 'Failed to load product', 
          type: 'error' 
        });
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleBaseInputChange = (e) => {
    const { name, value } = e.target;
    
    // Check if category has changed
    if (name === 'category' && value !== formData.category) {
      setCategoryHasChanged(true);
    }
    
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

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if total images will exceed limit
    if (existingImages.length - deletedImageIds.length + files.length > 5) {
      setMessage({ text: 'Maximum 5 images allowed in total', type: 'error' });
      e.target.value = ''; // Clear the file input
      return;
    }
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(newPreviews);
    setNewImages(files);
  };

  const handleSetMainImage = (imageId) => {
    setExistingImages(prev => prev.map(img => ({
      ...img,
      isMain: img._id === imageId
    })));
  };

  const handleDeleteExistingImage = async (imageId) => {
    // Prevent deleting if it's the last image
    if (existingImages.length - deletedImageIds.length <= 1 && newImages.length === 0) {
      setMessage({ text: 'At least one image is required', type: 'error' });
      return;
    }
    
    const imageToDelete = existingImages.find(img => img._id === imageId);
    if (!imageToDelete) {
      console.error('Failed to find image with ID:', imageId);
      return;
    }

    console.log('Deleting image:', {
      id: imageToDelete._id,
      url: imageToDelete.url,
      filename: getFilenameFromUrl(imageToDelete.url)
    });
    
    try {
      // Make the API call to delete the image immediately
      setSaveLoading(true);
      await productService.deleteProductImage(id, imageId);
      
      // Remove the image from local state
      setExistingImages(prev => prev.filter(img => img._id !== imageId));
      
      // If deleted image was main, set first remaining as main
      if (imageToDelete.isMain) {
        const remainingImages = existingImages.filter(img => 
          img._id !== imageId && !deletedImageIds.includes(img._id)
        );
        if (remainingImages.length > 0) {
          handleSetMainImage(remainingImages[0]._id);
        }
      }
      
      setMessage({ text: 'Image deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage({ 
        text: error.message || 'Failed to delete image', 
        type: 'error' 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const moveImage = (index, direction) => {
    // Create a copy of the existing images array
    const imagesCopy = [...existingImages];
    
    if (direction === 'up' && index > 0) {
      // Swap with previous image
      [imagesCopy[index-1], imagesCopy[index]] = [imagesCopy[index], imagesCopy[index-1]];
    } 
    else if (direction === 'down' && index < imagesCopy.length - 1) {
      // Swap with next image
      [imagesCopy[index], imagesCopy[index+1]] = [imagesCopy[index+1], imagesCopy[index]];
    }
    
    // Update order property on all images
    const reorderedImages = imagesCopy.map((img, idx) => ({
      ...img,
      order: idx
    }));
    
    setExistingImages(reorderedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate required fields
      const requiredFields = ['category', 'brand', 'model', 'price', 'stock', 'description'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      // Validate numeric fields
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        throw new Error('Price must be a valid positive number');
      }
      if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
        throw new Error('Stock must be a valid positive number');
      }

      // Create FormData for multipart/form-data submission
      const productData = new FormData();
      
      // Add base fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'specifications' && value !== undefined && value !== null) {
          productData.append(key, value.toString().trim());
        }
      });

      // Add specifications
      if (formData.category && specificationFields[formData.category]) {
        specificationFields[formData.category].forEach(field => {
          const fieldName = field.name;
          let fieldValue = formData.specifications[fieldName];

          if ((fieldValue === undefined || fieldValue === null) && !field.required) {
            return;
          }

          if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
            throw new Error(`Required specification missing: ${field.label}`);
          }

          if (['ports', 'pcieSlots', 'features'].includes(fieldName)) {
            if (typeof fieldValue === 'string') {
              fieldValue = fieldValue.split(',').map(v => v.trim()).filter(v => v);
            }
            if (Array.isArray(fieldValue)) {
              productData.append(`specifications[${fieldName}]`, fieldValue.join(','));
            }
          }
          else if (field.type === 'checkbox') {
            productData.append(`specifications[${fieldName}]`, fieldValue ? 'true' : 'false');
          }
          else if (field.type === 'number') {
            const numValue = parseFloat(fieldValue);
            if (isNaN(numValue)) {
              throw new Error(`${field.label} must be a valid number`);
            }
            productData.append(`specifications[${fieldName}]`, numValue);
          }
          else if (fieldValue !== undefined && fieldValue !== null) {
            productData.append(`specifications[${fieldName}]`, fieldValue.toString().trim());
          }
        });
      }

      // Handle images
      const remainingImages = existingImages
        .filter(img => !deletedImageIds.includes(img._id))
        .sort((a, b) => a.order - b.order);

      // Validate main image requirement
      if (remainingImages.length === 0 && newImages.length === 0) {
        throw new Error('At least one image is required');
      }

      // Ensure there is exactly one main image
      let hasMainImage = false;
      remainingImages.forEach((img, index) => {
        if (img.isMain) {
          hasMainImage = true;
        }
      });

      // If no main image is set, set the first image as main
      if (!hasMainImage && remainingImages.length > 0) {
        remainingImages[0].isMain = true;
      }

      // Add remaining images with order and main status
      remainingImages.forEach((img, index) => {
        productData.append('imageOrder[]', img._id);
        productData.append('imageMain[]', img.isMain ? 'true' : 'false');
      });

      // Add deleted images with their URLs
      if (deletedImageIds.length > 0) {
        const deletedImages = existingImages
          .filter(img => deletedImageIds.includes(img._id))
          .map(img => ({
            _id: img._id,
            url: img.url,
            filename: getFilenameFromUrl(img.url)
          }));
        
        console.log('Sending deleted images:', deletedImages);
        
        deletedImages.forEach(img => {
          productData.append('deletedImages[]', img._id);
          productData.append('deletedImageUrls[]', img.url);
          // Also append the filename extracted from URL - this is the most reliable identifier
          if (img.filename) {
            productData.append('deletedImageFilenames[]', img.filename);
          }
        });
      }

      // Add new images
      newImages.forEach((image, index) => {
        if (!image.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${image.name}. Only images are allowed.`);
        }
        if (image.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${image.name}. Maximum size is 5MB.`);
        }
        
        productData.append('images', image);
        // Set as main only if there are no remaining images and this is the first new image
        const isMain = remainingImages.length === 0 && index === 0;
        productData.append('newImageMain[]', isMain ? 'true' : 'false');
      });

      // Log FormData contents for debugging
      console.log('Updating product with FormData:');
      for (let pair of productData.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      const result = await productService.updateProduct(id, productData);

      setMessage({ text: 'Product updated successfully!', type: 'success' });
      
      setTimeout(() => {
        navigate(`/products/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ 
        text: error.response?.data?.message || error.message || 'Error updating product',
        type: 'error' 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Warn user if changing category might reset specifications
  useEffect(() => {
    if (categoryHasChanged) {
      const confirmChange = window.confirm(
        'Changing the category will reset all specifications. Do you want to proceed?'
      );
      
      if (confirmChange) {
        // Reset specifications if category changed
        setFormData(prev => ({
          ...prev,
          specifications: {}
        }));
      } else {
        // Revert category change
        setFormData(prev => ({
          ...prev,
          category: prev.category
        }));
      }
      
      setCategoryHasChanged(false);
    }
  }, [categoryHasChanged]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading product data...</p>
      </div>
    );
  }

  // Get filtered images that are not deleted
  const visibleImages = existingImages.filter(img => !deletedImageIds.includes(img._id));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      
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
                      value={
                        Array.isArray(formData.specifications[spec.name])
                          ? formData.specifications[spec.name].join(', ')
                          : formData.specifications[spec.name] || ''
                      }
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

        {/* Image Management Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          
          {/* Existing Images */}
          {visibleImages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Current Images</h3>
              <div className="flex flex-wrap gap-4" id="existingImages">
                {visibleImages.map((image, index) => (
                  <div key={image._id} className="relative" data-image-id={image._id}>
                    <img
                      src={image.url.startsWith('http') ? image.url : `http://localhost:3001${image.url}`}
                      alt={`Product ${index + 1}`}
                      className={`w-32 h-32 object-cover border rounded ${image.isMain ? 'border-blue-500 border-2' : ''}`}
                      style={{width: '150px', height: '150px', objectFit: 'cover'}}
                    />
                    <div className="absolute top-1 right-1 flex bg-white bg-opacity-75 rounded p-1 gap-1">
                      <button 
                        type="button"
                        onClick={() => handleSetMainImage(image._id)}
                        className={`px-1 py-0 ${image.isMain ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} rounded`}
                        title={image.isMain ? 'Main Image' : 'Set as Main Image'}
                      >
                        <i className="fas fa-star">{image.isMain ? '★' : '☆'}</i>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                        className={`px-1 py-0 ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'} rounded`}
                        aria-label="Move up"
                      >
                        <i className="fas fa-arrow-up">↑</i>
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === visibleImages.length - 1}
                        className={`px-1 py-0 ${index === visibleImages.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'} rounded`}
                        aria-label="Move down"
                      >
                        <i className="fas fa-arrow-down">↓</i>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteExistingImage(image._id)}
                        className="px-1 py-0 text-red-600 hover:bg-red-100 rounded"
                        aria-label="Delete"
                      >
                        <i className="fas fa-trash">×</i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add New Images */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Add New Images {visibleImages.length === 0 ? '*' : ''}
              <span className="text-sm text-gray-500 ml-2">
                (Max 5 total)
              </span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImageUpload}
              className="w-full p-2 border rounded"
              required={visibleImages.length === 0}
            />
          </div>
          
          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="mt-4" id="imagePreview">
              <h3 className="font-medium mb-2">New Image Previews</h3>
              <div className="flex flex-wrap gap-4">
                {newImagePreviews.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`New image ${index + 1}`}
                      className="w-32 h-32 object-cover border rounded"
                      style={{width: '150px', height: '150px', objectFit: 'cover'}}
                    />
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
              saveLoading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct; 