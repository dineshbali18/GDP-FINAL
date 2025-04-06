const express = require('express');
const router = express.Router();
const verifyToken = require('../jwt/verify');

module.exports = (sequelize) => {
  // Import controller methods
  const savingGoalsController = require('../controllers/savingGoalsController')(sequelize);

  const {
    getSavingGoalsForUser,
    getSavingGoalById,
    addSavingGoal,
    updateSavingGoal,
    deleteSavingGoal
  } = savingGoalsController;

  // Get all saving goals for a user
  router.get('/user/:userId', verifyToken, getSavingGoalsForUser);

  // Get details of a specific saving goal
  router.get('/goal/:goalId', verifyToken, getSavingGoalById);

  // Add a new saving goal
  router.post('/', verifyToken, addSavingGoal);

  // Update a saving goal
  router.put('/:goalId', verifyToken, updateSavingGoal);

  // Delete a saving goal
  router.delete('/:goalId', verifyToken, deleteSavingGoal);

  return router;
};
