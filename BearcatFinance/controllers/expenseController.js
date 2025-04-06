const axios = require('axios');
const redis = require('../redis/redisClient');


module.exports = (sequelize) => {
  // const { Op } = require('sequelize');
const Categories = require('../models/categories')(sequelize);
  const Expenses = require('../models/expenses')(sequelize); // Import the Expenses model
const UserBankAccounts = require('../models/userBankAccounts')(sequelize);
  // Get all expenses for a specific user
  const getExpensesForUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Fetch expenses for the user (only select the necessary fields)
      const expenses = await Expenses.findAll({
        where: { UserID: userId },
        attributes: ['ExpenseID', 'CategoryID', 'TransactionType', 'Amount', 'Description', 'GoalID','BudgetID','Merchandise', 'Date', 'createdAt', 'updatedAt'],
        order: [['Date', 'DESC']],
      });
  
      if (expenses.length === 0) {
        return res.status(404).json({ message: 'No expenses found for this user.' });
      }
  
      // Collect all unique CategoryIDs from the expenses
      const categoryIds = [...new Set(expenses.map(expense => expense.CategoryID))];
  
      // Fetch all categories by the collected CategoryIDs in a single query
      const categories = await Categories.findAll({
        where: { id: categoryIds },
        attributes: ['id', 'name'], // Only fetch the id and name of the category
      });
  
      // Map the categories by CategoryID for fast lookup
      const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
      }, {});
  
      // Group expenses by CategoryID
      const categorizedExpenses = {};
  
      for (const expense of expenses) {
        const categoryId = expense.CategoryID;
        const categoryName = categoryMap[categoryId] || 'Unknown'; // Fallback to 'Unknown' if category is not found
        const transactionType = expense.TransactionType;  // Debit or Credit
        const amount = parseFloat(expense.Amount);  // Convert amount to a number
  
        // Initialize category data if not already initialized
        if (!categorizedExpenses[categoryId]) {
          categorizedExpenses[categoryId] = {
            categoryName,
            debitTotal: 0,
            creditTotal: 0,
            expenses: [],
          };
        }
  
        // Classify by transaction type (Debit or Credit)
        if (transactionType &&  (transactionType.toLowerCase() === 'debit'|| transactionType.toLowerCase() === 'withdrawal')) {
          categorizedExpenses[categoryId].debitTotal += amount;
        } else if (transactionType && (transactionType.toLowerCase() === 'credit' || transactionType.toLowerCase() === 'deposit')) {
          categorizedExpenses[categoryId].creditTotal += amount;
        }
  
        // Add the expense details to the category
        categorizedExpenses[categoryId].expenses.push({
          ExpenseID: expense.ExpenseID,
          CategoryID: categoryId,
          CategoryName: categoryName, // Use the fetched category name
          Amount: expense.Amount,
          Description: expense.Description,
          GoalID: expense.GoalID,
          BudgetID: expense.BudgetID,
          TransactionType: transactionType,
          Merchandise: expense.Merchandise,
          Date: expense.Date,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        });
      }
  
      // Convert categorized expenses object to an array of categories with totals
      const categorizedExpensesArray = Object.keys(categorizedExpenses).map((categoryId) => {
        const category = categorizedExpenses[categoryId];
        return {
          categoryName: category.categoryName,
          debitTotal: category.debitTotal.toFixed(2), // Formatting the total to two decimal places
          creditTotal: category.creditTotal.toFixed(2),
          expenses: category.expenses,
        };
      });
  
      // Return the response with grouped expenses and totals
      return res.status(200).json({
        categorizedExpenses: categorizedExpensesArray,
      });
  
    } catch (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses for the user.' });
    }
  };
  
  

  // Get details of a specific expense
  const getExpenseById = async (req, res) => {
    const { expenseId } = req.params;

    try {
      const expense = await Expenses.findByPk(expenseId);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found.' });
      }

      return res.status(200).json(expense);
    } catch (err) {
      console.error('Error fetching expense details:', err);
      return res.status(500).json({ error: 'Failed to fetch expense details.' });
    }
  };

  const addExpense = async (req, res) => {
    try {
      // Assuming expense data is sent in the request body
      const expenseData = req.body;
      expenseData.UserID = req.user.userId;
      const newExpense = await Expenses.create(expenseData);
      return res.json({ success: true, data: newExpense });
    } catch (err) {
      console.error('Error adding expense:', err);
      return res.json({ success: false, error: 'Failed to add expense. Please try again.' });
    }
  };
  
  

  // Update an expense
  const updateExpense = async (req, res) => {
    const { expenseId } = req.params;
  
    try {
      const expense = await Expenses.findByPk(expenseId);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found.' });
      }
  
      // Filter out undefined fields to update only provided ones
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== undefined)
      );
  
      await expense.update(updateData);
  
      return res.status(200).json({
        message: 'Expense updated successfully.',
        expense,
      });
    } catch (err) {
      console.error('Error updating expense:', err);
      return res.status(500).json({ error: 'Failed to update expense.' });
    }
  };
  

  // Delete an expense
  const deleteExpense = async (req, res) => {
    const { expenseId } = req.params;

    try {
      const expense = await Expenses.findByPk(expenseId);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found.' });
      }

      await expense.destroy();

      return res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ error: 'Failed to delete expense.' });
    }
  };



  const syncTransactions = async (req, res) => {
    console.log("AAAAAA0000");
    try {
        const userId = req.params.userId; // Assume userID is passed as a parameter
        if (!userId) {
            return res.status(400).send('UserID is required');
        }

        console.log("UUUUU", userId);

        // Fetch all user bank accounts
        const userBankAccounts = await UserBankAccounts.findAll({ where: { UserID: userId } });
        if (!userBankAccounts.length) {
            return res.status(404).send('No bank accounts found for the user');
        }
        console.log("AAAAA", userBankAccounts);

        for (const account of userBankAccounts) {
            console.log("111111", account.AccountNumber);
            const accountId = account.AccountNumber;
            const lastSyncedId = await getLastSyncedTransactionId(accountId);

            console.log("0000000", accountId);

            try {
                // Fetch transactions from the bank API
                const response = await axios.get(`http://192.168.1.11:3001/bank/transactions/${accountId}/offset/${lastSyncedId}`);
                console.log("SSSSSS", response.data);

                if (response.data.error === "Account not found") {
                    continue;
                }
                const transactions = response.data?.transactions;

                console.log("TT1", transactions);
                if (!transactions || transactions.length === 0) {
                    console.log(`No new transactions for account ${accountId}`);
                    continue;
                }

                // Map transactions to expenses and store them
                const expenses = transactions.map(tx => ({
                    TransactionID: tx.TransactionID,
                    UserID: userId,
                    Amount: tx.amount,
                    Description: "bank",
                    Date: tx.createdAt,
                    TransactionType: tx.type,
                    Merchandise: tx.merchant || null,
                    CategoryID: tx.category || 1, // Default category if not provided
                }));

                await Expenses.bulkCreate(expenses);
                console.log("aaaaheheh");

                // Update last synced transaction ID
                await updateLastSyncedTransactionId(accountId, transactions[transactions.length - 1].TransactionID);
            } catch (err) {
                console.error(`Error syncing transactions for account ${accountId}:`, err.message);
                continue; // Continue with the next account in case of an error
            }
        }

        return res.status(200).send('Transactions synced successfully');
    } catch (err) {
        console.error("Error syncing transactions:", err.message);
        return res.status(500).send('An error occurred while syncing transactions');
    }
};


const getLastSyncedTransactionId = async (accountId) => {
    try {
        const account = await UserBankAccounts.findOne({
            where: { AccountNumber: accountId },
            attributes: ['Offset'], // Using Offset column to track last synced transaction ID
        });

        return account?.Offset || 0; // Default to 0 if Offset is null or account doesn't exist
    } catch (error) {
        console.error(`Error retrieving last synced transaction ID for account ${accountId}:`, error);
        return 0;
    }
};

const updateLastSyncedTransactionId = async (accountId, lastTransactionId) => {
    try {
        await UserBankAccounts.update(
            { Offset: lastTransactionId },
            { where: { AccountNumber: accountId } }
        );
    } catch (error) {
        console.error(`Error updating last synced transaction ID for account ${accountId}:`, error);
    }
};



  return {
    getExpensesForUser,
    getExpenseById,
    addExpense,
    updateExpense,
    deleteExpense,
    syncTransactions,
  };
};
