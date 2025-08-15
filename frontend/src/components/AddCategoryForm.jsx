// frontend/src/components/AddCategoryForm.jsx
import React, { useState } from 'react';

function AddCategoryForm({ onCategoryAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        alert('دسته‌بندی با موفقیت اضافه شد!');
        setName('');
        setDescription('');
        if (onCategoryAdded) {
          onCategoryAdded(); // به کامپوننت والد اطلاع می‌دهیم که لیست را رفرش کند
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category.');
      }
    } catch (error) {      console.error('Error adding category:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>افزودن دسته‌بندی جدید</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="نام دسته‌بندی"
          value={name}
          onChange={(e) => setName(e.target.value)}          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="توضیحات (اختیاری)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          افزودن دسته‌بندی
        </button>
      </form>
    </div>
  );
}

export default AddCategoryForm;