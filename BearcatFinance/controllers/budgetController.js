module.exports = (sequelize) => {
  const Budgets = require('../models/budgets')(sequelize); // Import the Budgets model
  const Expenses = require('../models/expenses')(sequelize);

  // Get all budgets for a specific user
  const getBudgetsForUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Fetch all budgets for the user
      const budgets = await Budgets.findAll({ where: { UserID: userId } });
  
      // Iterate through each budget and calculate total expenses
      const budgetsWithCurrentAmount = await Promise.all(
        budgets.map(async (budget) => {
          const totalExpenses = await Expenses.sum('Amount', { where: { BudgetID: budget.BudgetID } });
          return {
            ...budget.toJSON(),
            AmountSpent: totalExpenses != null
              ? Number(totalExpenses) + Number(budget.AmountSpent)
              : Number(budget.AmountSpent),
          };
        })
      );

      console.log("-0000----",budgetsWithCurrentAmount)
  
      return res.status(200).json(budgetsWithCurrentAmount);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      return res.status(500).json({ error: 'Failed to fetch budgets for the user.' });
    }
  };
  

  // Get details of a specific budget
  const getBudgetById = async (req, res) => {
    const { budgetId } = req.params;

    try {
      const budget = await Budgets.findByPk(budgetId);
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }

      return res.status(200).json(budget);
    } catch (err) {
      console.error('Error fetching budget details:', err);
      return res.status(500).json({ error: 'Failed to fetch budget details.' });
    }
  };

  // Create a new budget
  const createBudget = async (req, res) => {
    const { BudgetName, UserID, Amount, StartDate, EndDate, AmountSpent} = req.body;

    try {
      const newBudget = await Budgets.create({
        BudgetName,
        UserID,
        Amount,
        AmountSpent,
        StartDate,
        EndDate,
      });

      return res.status(201).json({
        message: 'Budget created successfully.',
        budget: newBudget,
      });
    } catch (err) {
      console.error('Error creating budget:', err);
      return res.status(500).json({ error: 'Failed to create budget.' });
    }
  };

  // Update a specific budget
  const updateBudget = async (req, res) => {
    const { budgetId } = req.params;
    const { BudgetName, Amount, AmountSpent, StartDate, EndDate } = req.body;

    try {
      const budget = await Budgets.findByPk(budgetId);
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }

      await budget.update({ BudgetName, Amount, AmountSpent, StartDate, EndDate });

      return res.status(200).json({
        message: 'Budget updated successfully.',
        budget,
      });
    } catch (err) {
      console.error('Error updating budget:', err);
      return res.status(500).json({ error: 'Failed to update budget.' });
    }
  };

  // Delete a specific budget
  const deleteBudget = async (req, res) => {
    const { budgetId } = req.params;

    try {
      const budget = await Budgets.findByPk(budgetId);
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }

      await budget.destroy();

      return res.status(200).json({ message: 'Budget deleted successfully.' });
    } catch (err) {
      console.error('Error deleting budget:', err);
      return res.status(500).json({ error: 'Failed to delete budget.' });
    }
  };

  return {
    getBudgetsForUser,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
  };
};
