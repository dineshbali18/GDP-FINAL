const express = require('express');
const router = express.Router();
const verifyToken = require('../jwt/verify');

module.exports = (sequelize) => {
  // Import controller methods
  const financialReportsController = require('../controllers/financialReportsController')(sequelize);

  const {
    getFinancialReportsForUser,
    getFinancialReportById,
    generateFinancialReport,
    updateFinancialReport,
    deleteFinancialReport
  } = financialReportsController;

  // Get all financial reports for a user
  router.get('/user/:userId', verifyToken, getFinancialReportsForUser);

  // Get details of a specific financial report
  router.get('/:reportId', verifyToken, getFinancialReportById);

  // Generate a new financial report
  router.post('/', verifyToken, generateFinancialReport);

  // Update a financial report
  router.put('/:reportId', verifyToken, updateFinancialReport);

  // Delete a financial report
  router.delete('/:reportId', verifyToken, deleteFinancialReport);

  return router;
};
