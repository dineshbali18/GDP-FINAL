const crypto = require('crypto');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavingGoals = sequelize.define('SavingGoals', {
    GoalID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the table
        key: 'UserID',
      },
    },
    GoalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TargetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    CurrentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    Deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  // Hook to format GoalName before creation (example use case, replace with actual logic if needed)
  SavingGoals.beforeCreate((goal) => {
    goal.GoalName = goal.GoalName.trim();
  });

  // Instance method to calculate remaining amount needed to reach the goal
  SavingGoals.prototype.getRemainingAmount = function () {
    return this.TargetAmount - this.CurrentAmount;
  };

  return SavingGoals;
};
