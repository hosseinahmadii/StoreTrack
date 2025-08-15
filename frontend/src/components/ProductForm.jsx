// frontend/src/components/ProductForm.jsx
import React, { useState } from 'react';

// توجه: حالا categories را به عنوان prop دریافت می‌کنیم
function ProductForm({ onProductAdded, categories = [] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {      alert('لطفاً یک دسته‌بندی انتخاب کنید.');
      return;
    }
    // ... (بقیه منطق ارسال فرم که از قبل داشتید)
    try {
        const productData = {            name,
            description,
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            categoryId: parseInt(categoryId, 10),
        };

        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            alert('محصول با موفقیت اضافه شد!');
            // خالی کردن فرم
            setName(''); setDescription(''); setPrice(''); setQuantity(''); setCategoryId('');
            if (onProductAdded) onProductAdded();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add product.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert(`Error: ${error.message}`);
    }
  };

  return (    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>افزودن محصول جدید</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="نام محصول" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="توضیحات" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="قیمت" value={price} onChange={e => setPrice(e.target.value)} required step="0.01" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        <input type="number" placeholder="تعداد" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

        {/* <<< این قسمت تغییر اصلی است >>> */}
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">-- انتخاب دسته‌بندی --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>          ))}
        </select>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          افزودن محصول
        </button>
      </form>
    </div>
  );
}

export default ProductForm;