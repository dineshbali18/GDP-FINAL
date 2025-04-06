// controllers/userBankAccountController.js
module.exports = (sequelize) => {
  const BankDetails = require('../models/bankDetails')(sequelize);
    const UserBankAccounts = require('../models/userBankAccounts')(sequelize);
  
    // Get all bank accounts
    const getAllUserAccounts = async (req, res) => {
      console.log("User Info:", req.user);
      try {
        // Fetch all user accounts for the logged-in user
        const accounts = await UserBankAccounts.findAll({
          where: { UserID: req.user.userId },
        });
    
        if (accounts.length === 0) {
          return res.status(200).json([]); // Return empty array if no accounts
        }
    
        // Get unique BankIDs from the accounts
        const bankIds = accounts.map(account => account.BankID);
    
        // Fetch bank details in a single batch query
        const banks = await BankDetails.findAll({
          where: { BankID: bankIds },
          attributes: ["BankID", "BankName"], // Fetch only needed fields
        });
    
        // Create a map of BankID → BankName for quick lookup
        const bankMap = new Map(banks.map(bank => [bank.BankID, bank.BankName]));
    
        // Merge bank names with user accounts
        const accountsWithBankNames = accounts.map(account => ({
          ...account.toJSON(),
          BankName: bankMap.get(account.BankID) || "Unknown Bank",
        }));
    
        return res.status(200).json(accountsWithBankNames);
      } catch (err) {
        console.error("Error fetching bank accounts:", err);
        return res.status(500).json({ error: "Failed to fetch bank accounts." });
      }
    };
    
  
    // Get a single bank account by ID
    const getAccountById = async (req, res) => {
      try {
        const { accountId } = req.params;
        const account = await UserBankAccounts.findByPk(accountId);
        if (!account) {
          return res.status(404).json({ message: 'Bank account not found.' });
        }
        return res.status(200).json(account);
      } catch (err) {
        console.error('Error fetching bank account:', err);
        return res.status(500).json({ error: 'Failed to fetch bank account.' });
      }
    };
  
    // Create a new bank account
    const addAccount = async (req, res) => {
      try {
        const accountData = req.body;
        const newAccount = await UserBankAccounts.create(accountData);
        return res.status(201).json(newAccount);
      } catch (err) {
        console.error('Error creating bank account:', err);
        return res.status(500).json({ error: 'Failed to create bank account.' });
      }
    };
  
    // Update an existing bank account
    const updateAccount = async (req, res) => {
      try {
        const { accountId } = req.params;
        const { UserID, BankID, AccountNumber, AccountBalance } = req.body;
        const account = await UserBankAccounts.findByPk(accountId);
        if (!account) {
          return res.status(404).json({ message: 'Bank account not found.' });
        }
        await account.update({ UserID, BankID, AccountNumber, AccountBalance });
        return res.status(200).json({
          message: 'Bank account updated successfully.',
          account,
        });
      } catch (err) {
        console.error('Error updating bank account:', err);
        return res.status(500).json({ error: 'Failed to update bank account.' });
      }
    };
  
    // Delete a bank account
    const deleteAccount = async (req, res) => {
      try {
        const { accountId } = req.params;
        const account = await UserBankAccounts.findByPk(accountId);
        if (!account) {
          return res.status(404).json({ message: 'Bank account not found.' });
        }
        await account.destroy();
        return res.status(200).json({ message: 'Bank account deleted successfully.' });
      } catch (err) {
        console.error('Error deleting bank account:', err);
        return res.status(500).json({ error: 'Failed to delete bank account.' });
      }
    };
  
    return {
      getAllUserAccounts,
      getAccountById,
      addAccount,
      updateAccount,
      deleteAccount,
    };
  };
  