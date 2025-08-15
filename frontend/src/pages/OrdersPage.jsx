import React, { useState, useEffect } from 'react';
import axios from 'axios';const OrdersPage = () => {
  // حالت‌های اصلی شما برای فیلتر و جدول
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // حالت‌های مدال ثبت سفارش
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [newOrderItems, setNewOrderItems] = useState([]);  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { customerName: customerNameFilter, status: statusFilter, startDate: startDateFilter, endDate: endDateFilter };
      const response = await axios.get('http://localhost:3001/api/orders', { params });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await axios.get('http://localhost:3001/api/products');
      setAllProducts(res.data);
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProductsError('خطا در بارگذاری محصولات. امکان افزودن آیتم وجود ندارد.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    fetchOrders();
  }, [customerNameFilter, statusFilter, startDateFilter, endDateFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Change status of order ${orderId} to ${newStatus}?`)) return;

    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {      console.error('Error updating order status:', err);
      setError(`Failed to update order status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || currentQuantity <= 0) return;
    const product = allProducts.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    const existingItem = newOrderItems.find(item => item.productId === product.id);
    if (existingItem) {
      setNewOrderItems(newOrderItems.map(item =>
        item.productId === product.id ? { ...item, quantity: item.quantity + parseInt(currentQuantity, 10) } : item
      ));
    } else {
      setNewOrderItems([...newOrderItems, {        productId: product.id, productName: product.name, quantity: parseInt(currentQuantity, 10), price: product.price
      }]);
    }
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setNewOrderItems(newOrderItems.filter(item => item.productId !== productId));
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!newOrderCustomer) {
      alert('لطفاً نام مشتری را وارد کنید.');
      return;
    }
    if (newOrderItems.length === 0) {
      alert('حداقل یک محصول باید به سفارش اضافه شود.');
      return;
    }    setSubmitLoading(true);
    try {
      await axios.post('http://localhost:3001/api/orders', {
        customerName: newOrderCustomer,
        items: newOrderItems.map(({ productId, quantity }) => ({ productId, quantity }))
      });
      setIsModalOpen(false);
      setNewOrderCustomer('');
      setNewOrderItems([]);
      fetchOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(`Failed to create order: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#292929ff', color: '#ffffffff',
    padding: '25px', borderRadius: '10px', zIndex: 1000, width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ccc'
  };
  const backdropStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#ffffffff' }}>Orders Management</h1>
        <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
          + Create New Order
        </button>
      </div>

      {isModalOpen && (
        <>
          <div style={backdropStyle} onClick={() => setIsModalOpen(false)}></div>
          <div style={modalStyle}>
            <h2 style={{borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Create New Order</h2>
            <form onSubmit={handleSubmitOrder}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Customer Name:</label>
                <input type="text" value={newOrderCustomer} onChange={(e) => setNewOrderCustomer(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Add Items</label>
                {productsLoading ? <p>در حال بارگذاری محصولات...</p> : productsError ? <p style={{color: 'red'}}>{productsError}</p> : (
                  allProducts.length > 0 ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 3 }}>
                        <label>Product:</label>
                        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                          {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Quantity:</label>
                        <input type="number" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} min="1" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                      </div>
                      <button type="button" onClick={handleAddItem} style={{ padding: '8px 12px' }}>Add</button>
                    </div>
                  ) : <p>محصولی برای افزودن یافت نشد.</p>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <h4>Order Items:</h4>
                {newOrderItems.length === 0 ? <p>No items added yet.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {newOrderItems.map(item => (
                      <li key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202020ff', padding: '16px', borderRadius: '4px', marginBottom: '5px' }}>
                        <span>{item.productName} (x{item.quantity})</span>
                        <button type="button" onClick={() => handleRemoveItem(item.productId)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                <button type="submit" disabled={submitLoading || productsLoading || !!productsError} style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                  {submitLoading ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* بخش فیلترهای شما (کامل و بدون تغییر) */}
      <h3 style={{ fontSize: '20px', color: '#ffffffff' }}>Filter Orders</h3>
      <div style={{backgroundColor: '#202020cc', marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex',flexDirection: 'row' , flexWrap: 'wrap', gap: '25px'}}>
        <div>
          <label>Customer Name: </label>
          <input type="text" value={customerNameFilter} onChange={(e) => setCustomerNameFilter(e.target.value)} placeholder="Search by name" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '10px' }}/>
        </div>
        <div>
          <label>Status: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{alignContent: 'center' }}>
          <label>Start Date: </label><br></br>
          <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop:'10px' }}/>
        </div>
        <div  style={{alignContent: 'center' }}>
          <label>End Date: </label><br></br>
          <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop:'10px' }}/>
        </div>
        <button onClick={fetchOrders} style={{alignSelf: 'center', padding: '12px 19px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>
          Apply Filters
        </button>
        <button onClick={() => { setCustomerNameFilter(''); setStatusFilter(''); setStartDateFilter(''); setEndDateFilter(''); }} style={{alignSelf: 'center', padding: '12px 19px', borderRadius: '4px', border: 'none', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer' }}>
          Clear Filters
        </button>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* بخش جدول شما (کامل و با اصلاح نمایش آیتم‌ها) */}
      {orders.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
          <thead>
            <tr style={{ backgroundColor: '#080808', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Order ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Customer Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Order Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Amount</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{order.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{order.customerName}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{new Date(order.orderDate).toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={{ fontSize: '15px',padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>                
                <td style={{ border: '1px solid #ddd', padding: '15px' }}>
                  <details>
                    <summary
                      style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #979797ff 0%, #e4e4e4ff 100%)',
                        padding: '13px 18px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        color: '#333',
                      }}
                    >
                      Orders List
                    </summary>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: 0, listStyle: 'none', textAlign: 'center' }}>
                    {order.orderItems && order.orderItems.length > 0 ? (
                      order.orderItems.map(item => (
                        <li key={item.id}>
                          {item.product ? item.product.name : 'N/A'} (x{item.quantity})
                        </li>
                      ))
                    ) : (
                      <li>No items</li>
                    )}
                  </ul>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No orders found.</p>
      )}
    </div>
  );
};

export default OrdersPage;
