const crypto = require('crypto');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Categories = sequelize.define('Categories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // Hook to format name before creation (example use case, replace with actual logic if needed)
  Categories.beforeCreate((category) => {
    category.name = category.name.trim();
  });

  // Instance method to format category details as a string
  Categories.prototype.getCategoryDetails = function () {
    return `Category: ${this.name}, Description: ${this.description || 'N/A'}`;
  };

  Categories.getCategoryNameById = async function (categoryId) {
    const category = await Categories.findByPk(categoryId);
    if (category) {
      return category.name;
    }
    throw new Error('Category not found');
  };
  
  return Categories;
};
