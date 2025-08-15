module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'categories'
  });

  Category.associate = function(models) {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'Products'
    });
  };

  return Category;
};