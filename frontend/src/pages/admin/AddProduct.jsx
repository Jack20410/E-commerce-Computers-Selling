import React, { useState } from 'react';
import axios from 'axios';

const categorySpecs = {
  pc: {
    processor: { type: 'text', required: true, label: 'Processor' },
    ram: { type: 'text', required: true, label: 'RAM' },
    storage: { type: 'text', required: true, label: 'Storage' },
    graphicsCard: { type: 'text', required: true, label: 'Graphics Card' },
    motherboard: { type: 'text', required: true, label: 'Motherboard' },
    powerSupply: { type: 'text', required: true, label: 'Power Supply' },
    case: { type: 'text', required: true, label: 'Case' },
    operatingSystem: { type: 'text', required: false, label: 'Operating System' },
  },
  laptop: {
    processor: { type: 'text', required: true, label: 'Processor' },
    ram: { type: 'text', required: true, label: 'RAM' },
    storage: { type: 'text', required: true, label: 'Storage' },
    displaySize: { type: 'text', required: true, label: 'Display Size' },
    graphicsCard: { type: 'text', required: true, label: 'Graphics Card' },
    batteryLife: { type: 'text', required: true, label: 'Battery Life' },
    weight: { type: 'text', required: true, label: 'Weight' },
    operatingSystem: { type: 'text', required: false, label: 'Operating System' },
  },
  cpu: {
    socket: { type: 'text', required: true, label: 'Socket' },
    cores: { type: 'number', required: true, label: 'Cores' },
    threads: { type: 'number', required: true, label: 'Threads' },
    baseSpeed: { type: 'text', required: true, label: 'Base Speed' },
    boostSpeed: { type: 'text', required: true, label: 'Boost Speed' },
    graphic: { type: 'text', required: true, label: 'Integrated Graphics' },
    tdp: { type: 'text', required: true, label: 'TDP' },
  },
  graphicsCard: {
    chipset: { type: 'text', required: true, label: 'Chipset' },
    memory: { type: 'text', required: true, label: 'Memory' },
    memoryType: { type: 'text', required: true, label: 'Memory Type' },
    coreClock: { type: 'text', required: true, label: 'Core Clock' },
    boostClock: { type: 'text', required: true, label: 'Boost Clock' },
    powerConsumption: { type: 'text', required: true, label: 'Power Consumption' },
    ports: { type: 'text', required: false, label: 'Ports (comma separated)' },
  },
  motherboard: {
    socket: { type: 'text', required: true, label: 'Socket' },
    chipset: { type: 'text', required: true, label: 'Chipset' },
    formFactor: { type: 'text', required: true, label: 'Form Factor' },
    memorySlots: { type: 'number', required: true, label: 'Memory Slots' },
    maxMemory: { type: 'text', required: true, label: 'Maximum Memory' },
    supportedMemoryType: { type: 'text', required: true, label: 'Supported Memory Type' },
    pcieSlots: { type: 'text', required: false, label: 'PCIe Slots (comma separated)' },
    sataConnectors: { type: 'number', required: true, label: 'SATA Connectors' },
  },
  memory: {
    type: { type: 'text', required: true, label: 'Type' },
    capacity: { type: 'text', required: true, label: 'Capacity' },
    speed: { type: 'text', required: true, label: 'Speed' },
    latency: { type: 'text', required: true, label: 'Latency' },
    voltage: { type: 'text', required: true, label: 'Voltage' },
  },
  storage: {
    type: { type: 'text', required: true, label: 'Type' },
    capacity: { type: 'text', required: true, label: 'Capacity' },
    formFactor: { type: 'text', required: true, label: 'Form Factor' },
    interface: { type: 'text', required: true, label: 'Interface' },
    readSpeed: { type: 'text', required: true, label: 'Read Speed' },
    writeSpeed: { type: 'text', required: true, label: 'Write Speed' },
  },
  monitor: {
    displaySize: { type: 'text', required: true, label: 'Display Size' },
    resolution: { type: 'text', required: true, label: 'Resolution' },
    panelType: { type: 'text', required: true, label: 'Panel Type' },
    refreshRate: { type: 'text', required: true, label: 'Refresh Rate' },
    responseTime: { type: 'text', required: true, label: 'Response Time' },
    ports: { type: 'text', required: false, label: 'Ports (comma separated)' },
    hdrSupport: { type: 'checkbox', required: false, label: 'HDR Support' },
  },
  gears: {
    type: { type: 'text', required: true, label: 'Type' },
    connectivity: { type: 'text', required: true, label: 'Connectivity' },
    features: { type: 'text', required: false, label: 'Features (comma separated)' },
  },
};

const AddProduct = () => {
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    price: '',
    stock: '',
    description: '',
    specifications: {},
    images: [],
  });

  const handleBaseInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = value;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      finalValue = checked;
    }
    
    // Handle array fields (comma-separated strings)
    const spec = categorySpecs[formData.category][name];
    if (spec && (name === 'ports' || name === 'pcieSlots' || name === 'features')) {
      finalValue = value.split(',').map(item => item.trim()).filter(item => item);
    }

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
      alert('Maximum 5 images allowed');
      return;
    }
    
    // Create preview URLs and prepare for upload
    const imageFiles = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: index === 0, // First image is main by default
      order: index
    }));

    setFormData(prev => ({
      ...prev,
      images: imageFiles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Append base product data
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('description', formData.description);
      
      // Append specifications
      formDataToSend.append('specifications', JSON.stringify(formData.specifications));
      
      // Append images
      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image.file);
        formDataToSend.append('imageMetadata', JSON.stringify({
          isMain: image.isMain,
          order: image.order
        }));
      });

      const response = await axios.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Product added successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Base Product Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleBaseInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              {Object.keys(categorySpecs).map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Brand</label>
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
            <label className="block mb-2">Model</label>
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
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleBaseInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleBaseInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleBaseInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        {/* Dynamic Specifications based on category */}
        {formData.category && (
          <div className="specifications-section">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(categorySpecs[formData.category]).map(([key, spec]) => (
                <div key={key}>
                  <label className="block mb-2">{spec.label}</label>
                  <input
                    type={spec.type}
                    name={key}
                    value={
                      spec.type === 'checkbox' 
                        ? undefined 
                        : Array.isArray(formData.specifications[key])
                          ? formData.specifications[key].join(', ')
                          : formData.specifications[key] || ''
                    }
                    checked={spec.type === 'checkbox' ? formData.specifications[key] : undefined}
                    onChange={handleSpecificationChange}
                    className="w-full p-2 border rounded"
                    required={spec.required}
                    placeholder={
                      (key === 'ports' || key === 'pcieSlots' || key === 'features')
                        ? 'Enter values separated by commas'
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block mb-2">Images (Max 5)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded"
            required
          />
          {/* Image Previews */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {image.isMain && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct; 