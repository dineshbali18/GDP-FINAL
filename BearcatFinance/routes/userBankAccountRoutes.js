// routes/userBankAccountRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../jwt/verify');

module.exports = (sequelize) => {
  // Import the controller and pass the sequelize instance
  const userBankAccountController = require('../controllers/userBankAccountController')(sequelize);

  // Route to get all bank accounts related to a user
  router.get('/',verifyToken, userBankAccountController.getAllUserAccounts);

  // Route to add bank account
  router.post('/', userBankAccountController.addAccount);

  // Route to update an existing bank account
  router.put('/:accountId', userBankAccountController.updateAccount);

  // Route to delete a bank account
  router.delete('/:accountId', userBankAccountController.deleteAccount);

  return router;
};
