const crypto = require('crypto');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserBankAccounts = sequelize.define('UserBankAccounts', {
    UserBankAccountID: {
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
    BankID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BankDetails', // Name of the table
        key: 'BankID',
      },
    },
    AccountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    AccountBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    Offset: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  // Hook to hash account number before creation (example use case, replace with actual logic if needed)
  // UserBankAccounts.beforeCreate((account) => {
  //   account.AccountNumber = crypto
  //     .createHash('sha256')
  //     .update(account.AccountNumber)
  //     .digest('hex');
  // });

  // Instance method to validate account number (example use case, replace with actual logic if needed)
  // UserBankAccounts.prototype.validateAccountNumber = function (accountNumber) {
  //   const hashedAccountNumber = crypto
  //     .createHash('sha256')
  //     .update(accountNumber)
  //     .digest('hex');
  //   return this.AccountNumber === hashedAccountNumber;
  // };

  return UserBankAccounts;
};
