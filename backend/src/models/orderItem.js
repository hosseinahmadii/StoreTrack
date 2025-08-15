module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 
    },
    priceAtOrder: { 
      type: DataTypes.FLOAT,
      allowNull: false
    },
  
  }, {
    tableName: 'order_items' 
  });  OrderItem.associate = function(models) {

    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });

    OrderItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return OrderItem;
};