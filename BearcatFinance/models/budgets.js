const crypto = require('crypto');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Budgets = sequelize.define('Budgets', {
    BudgetID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BudgetName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the table
        key: 'UserID',
      },
    },
    Amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    AmountSpent:{
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Hook to format BudgetName before creation (example use case, replace with actual logic if needed)
  Budgets.beforeCreate((budget) => {
    budget.BudgetName = budget.BudgetName.trim();
  });

  // Instance method to calculate remaining days for the budget
  Budgets.prototype.getRemainingDays = function () {
    const today = new Date();
    const endDate = new Date(this.EndDate);
    const diffTime = endDate - today;
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  };

  return Budgets;
};