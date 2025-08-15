
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00    },
    status: {
      type: DataTypes.ENUM('Pending', 'Shipped', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    customerName: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'orders', 
  });


  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'orderItems', 
      onDelete: 'CASCADE', 
    });
  };

  return Order;
};