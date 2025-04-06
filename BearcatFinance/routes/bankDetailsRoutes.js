// routes/bankDetailsRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (sequelize) => {
  // Import the controller and pass the sequelize instance
  const bankDetailsController = require('../controllers/bankDetailsController')(sequelize);

  // Route to get all bank details
  router.get('/', bankDetailsController.getAllBanksDetails);

  // Route to get a specific bank detail by BankID
  router.get('/:bankId', bankDetailsController.getBankDetailsById);

    // Route to create a new bank detail
    router.post('/', bankDetailsController.addBankDetails);

  // Route to update an existing bank detail
  router.put('/:bankId', bankDetailsController.updateBankDetails);

  // Route to delete a bank detail
  router.delete('/:bankId', bankDetailsController.deleteBankDetails);

  return router;
};
