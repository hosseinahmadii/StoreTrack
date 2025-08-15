
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales-report', require('./routes/salesReportRoutes'));

app.get('/', (req, res) => {
  res.send('StoreTrack API is running!');
});

// Start server after syncing database
db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Models synced with database.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  });