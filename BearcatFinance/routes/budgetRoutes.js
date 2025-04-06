const express = require('express');
const router = express.Router();
const verifyToken = require('../jwt/verify');

module.exports = (sequelize) => {
  // Import controller methods
  const budgetsController = require('../controllers/budgetController')(sequelize); // Import the controller and pass sequelize

  const {
    getBudgetsForUser,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget
  } = budgetsController;

  // Get all budgets for a specific user
  router.get('/user/:userId/budgets', verifyToken, getBudgetsForUser);

  // Get details of a specific budget
  router.get('/budgets/:budgetId', verifyToken, getBudgetById);

  // Create a new budget
  router.post('/budgets', verifyToken, createBudget);

  // Update a specific budget
  router.put('/budgets/:budgetId', verifyToken, updateBudget);

  // Delete a specific budget
  router.delete('/budgets/:budgetId', verifyToken, deleteBudget);

  return router;
};
