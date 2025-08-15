import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import io from 'socket.io-client'; // <-- این خط حذف شد

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);

  const API_URL = 'http://localhost:3001/api/categories';
  // const SOCKET_URL = 'http://localhost:3001'; // <-- این خط حذف شد

  // دریافت تمام دسته‌بندی‌ها از سرور
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL);      if (Array.isArray(response.data)) {
        setCategories(response.data.sort((a,b) => a.name.localeCompare(b.name))); // مرتب‌سازی اولیه
      } else {
        console.error("API response is not an array:", response.data);
        setError("Invalid data format received from the server.");
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('Failed to fetch categories. Please check if the backend is running correctly.');
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect برای لود اولیه داده‌ها ---
  useEffect(() => {
    fetchCategories();
    // تمام بخش‌های مربوط به Socket.IO از اینجا حذف شدند
  }, []);

  // افزودن دسته‌بندی جدید
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    try {
      await axios.post(API_URL, { name: newCategoryName });
      setNewCategoryName('');
      await fetchCategories(); // <-- بازخوانی لیست پس از افزودن
    } catch (err) {
      console.error("Error adding category:", err);
      alert(`Failed to add category: ${err.response?.data?.message || err.message}`);
    }
  };

  // حذف یک دسته‌بندی
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_URL}/${categoryId}`);
        await fetchCategories(); // <-- بازخوانی لیست پس از حذف
      } catch (err) {
        console.error("Error deleting category:", err);
        alert(`Failed to delete category: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // آپدیت یک دسته‌بندی
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    try {
      await axios.put(`${API_URL}/${editingCategory.id}`, { name: editingCategory.name });
      setEditingCategory(null); // خروج از حالت ویرایش
      await fetchCategories(); // <-- بازخوانی لیست پس از آپدیت
    } catch (err) {
      console.error("Error updating category:", err);
      alert(`Failed to update category: ${err.response?.data?.message || err.message}`);
    }
  };

  // ظاهر کامپوننت
  return (
    <div className="page-container">
      <h1>Manage Categories</h1>

      {/* فرم افزودن دسته‌بندی */}
      <div className="card-section">
        <h3>Add New Category</h3>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
          <button type="submit" className="btn-success">
            Add Category
          </button>
        </form>
      </div>

      {/* لیست دسته‌بندی‌ها */}
      <h3>Existing Categories</h3>
      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p style={{ color: '#ff6b6b' }}>{error}</p>
      ) : (
        <ul className="category-list">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                {editingCategory && editingCategory.id === category.id ? (
                  // حالت ویرایش
                  <form onSubmit={handleUpdateCategory} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      autoFocus
                    />
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary">Cancel</button>
                  </form>
                ) : (
                  // حالت نمایش عادی
                  <>
                    <span>{category.name}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingCategory({ id: category.id, name: category.name })} className="btn-warning">Edit</button>
                      <button onClick={() => handleDeleteCategory(category.id)} className="btn-danger">Delete</button>
                    </div>                  </>
                )}
              </li>
            ))
          ) : (
            <p>No categories found. Add one above to get started!</p>
          )}
        </ul>
      )}
    </div>  );
};

export default CategoriesPage;