// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';

import InventoryHistoryPage from './pages/InventoryHistoryPage';





function App() {
  return (
    <Router>
      <nav style={{ padding: '20px 30px', backgroundColor: '#333', color: 'white' }}>
        <ul style={{ listStyle: 'none',padding: 0, margin: 0, display: 'flex', justifySelf: 'center', gap: '20px' }}>
          <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
          <li><Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link></li>
          <li><Link to="/categories" style={{ color: 'white', textDecoration: 'none' }}>Categories</Link></li>
          <li><Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link></li>
          <li><Link to="/reports" style={{ color: 'white', textDecoration: 'none' }}>Reports</Link></li>
          <li><Link to="/inventory-history" style={{ color: 'white', textDecoration: 'none' }}>Inventory History</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/inventory-history" element={<InventoryHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;