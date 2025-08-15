module.exports = (sequelize, DataTypes) => {
  const InventoryMovement = sequelize.define('InventoryMovement', {
    type: {
      type: DataTypes.ENUM('IN', 'OUT'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  InventoryMovement.associate = (models) => {
    InventoryMovement.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
      onDelete: 'CASCADE'
    });
  };

  return InventoryMovement;
};