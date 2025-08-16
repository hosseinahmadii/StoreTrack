import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryHistoryPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [productNameFilter, setProductNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory');
      let data = response.data;

      if (productNameFilter) {
        data = data.filter(m =>
          m.product?.name?.toLowerCase().includes(productNameFilter.toLowerCase())
        );
      }

      if (typeFilter) {
        data = data.filter(m => m.type === typeFilter);
      }

      if (startDateFilter) {
        const start = new Date(startDateFilter);
        data = data.filter(m => new Date(m.date) >= start);
      }

      if (endDateFilter) {
        const end = new Date(endDateFilter);
        data = data.filter(m => new Date(m.date) <= end);
      }

      setMovements(data);
    } catch (err) {
      console.error('Error fetching inventory movements:', err);
      setError('⚠️ Failed to fetch inventory history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [productNameFilter, typeFilter, startDateFilter, endDateFilter]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📦 Inventory History</h1>

      {/* فیلترها */}
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        
        <div>
          <label>Product Name: </label>
          <input
            type="text"
            value={productNameFilter}
            onChange={e => setProductNameFilter(e.target.value)}
            placeholder="Search product name"
          />
        </div>

        <div>
          <label>Type: </label>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>

        <div>
          <label>Start Date: </label>
          <input
            type="date"
            value={startDateFilter}
            onChange={e => setStartDateFilter(e.target.value)}
          />
        </div>

        <div>
          <label>End Date: </label>
          <input
            type="date"
            value={endDateFilter}
            onChange={e => setEndDateFilter(e.target.value)}
          />
        </div>

        <button
          onClick={fetchMovements}
          style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
        >
          Apply Filters
        </button>

        <button
          onClick={() => {
            setProductNameFilter('');
            setTypeFilter('');
            setStartDateFilter('');
            setEndDateFilter('');
          }}
          style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
        >
          Clear
        </button>
      </div>

      {/* وضعیت لودینگ یا خطا */}
      {loading && <p>⏳ Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* جدول تاریخچه */}
      {movements.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#080808', color: 'white' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Product Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{m.product?.name}</td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    color: m.type === 'IN' ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  {m.type}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{m.quantity}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {new Date(m.date).toLocaleString()}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{m.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No inventory history found.</p>
      )}
    </div>
  );
};

export default InventoryHistoryPage;
