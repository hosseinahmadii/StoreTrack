import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [productNameFilter, setProductNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const API_BASE_URL = 'http://localhost:3001/api';

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: productNameFilter,
        categoryId: categoryFilter,
      };
      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please ensure the backend is running and reachable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [productNameFilter, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddProductClick = () => {
    setCurrentProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategoryId('');
    setShowForm(true);
  };

  const handleEditProductClick = (product) => {
    setCurrentProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setQuantity(product.quantity);
    setCategoryId(product.categoryId);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      categoryId: parseInt(categoryId, 10),
    };

    try {
      if (currentProduct) {
        await axios.put(`${API_BASE_URL}/products/${currentProduct.id}`, productData);
        alert('Product updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/products`, productData);
        alert('Product added successfully!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error('Error submitting product:', err.response?.data || err);
      setError(`Failed to save product: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete product ID: ${productId}? This action cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err.response?.data || err);
      setError(`Failed to delete product: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Products Management</h1>

      {/* Filter Section */}
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
        <h3>Filter Products</h3>
        <div>
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            value={productNameFilter}
            onChange={(e) => setProductNameFilter(e.target.value)}
            placeholder="Search by name"
            style={{ marginLeft: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div>
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ marginLeft: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchProducts} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>
          Apply Filters
        </button>
        <button onClick={() => {
          setProductNameFilter('');
          setCategoryFilter('');
        }} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer' }}>
          Clear Filters
        </button>
      </div>

      <button
        onClick={handleAddProductClick}
        style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', marginBottom: '20px' }}
      >
        Add New Product
      </button>

      {/* Add/Edit Product Form */}
      {showForm && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#080808' }}>
          <h2>{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label htmlFor="quantity">Stock Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label htmlFor="categoryId">Category:</label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}
              >
                {currentProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#080808', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Stock</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr
                key={product.id}
                style={{ backgroundColor: product.quantity < 10 ? '#633d3d' : '#363535' }}
              >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {product.quantity < 10 ? '⚠️ ' : ''}{product.name}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${parseFloat(product.price).toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.quantity}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {product.Category ? product.Category.name : 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                    onClick={() => handleEditProductClick(product)}
                    style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#ffc107', color: 'white', cursor: 'pointer', marginRight: '5px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No products found. Add a new product to get started!</p>
      )}
    </div>
  );
};

export default ProductsPage;
