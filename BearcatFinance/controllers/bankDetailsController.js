// controllers/bankDetailsController.js
const crypto = require('crypto');

module.exports = (sequelize) => {
  const BankDetails = require('../models/bankDetails')(sequelize);

  // Get all bank details
  const getAllBanksDetails = async (req, res) => {
    console.log("-------banks all")
    try {
      const banks = await BankDetails.findAll();
      console.log("BBBBBB",banks);
      if (!banks || banks.length === 0) {
        return res.status(404).json({ message: 'No bank details found.' });
      }
      console.log("AAAAAAAAA11",banks)
      return res.status(200).json(banks);
    } catch (err) {
      console.error('Error fetching bank details:', err);
      return res.status(500).json({ error: 'Failed to fetch bank details.' });
    }
  };

  // Get a single bank detail by BankID
  const getBankDetailsById = async (req, res) => {
    try {
      const { bankId } = req.params;
      const bank = await BankDetails.findByPk(bankId);
      if (!bank) {
        return res.status(404).json({ message: 'Bank not found.' });
      }
      return res.status(200).json(bank);
    } catch (err) {
      console.error('Error fetching bank detail:', err);
      return res.status(500).json({ error: 'Failed to fetch bank detail.' });
    }
  };

  // Create a new bank detail
  const addBankDetails = async (req, res) => {
    try {
      const bankData = req.body;
      const newBank = await BankDetails.create(bankData);
      return res.status(201).json(newBank);
    } catch (err) {
      console.error('Error creating bank detail:', err);
      return res.status(500).json({ error: 'Failed to create bank detail.' });
    }
  };

  // Update an existing bank detail
  const updateBankDetails = async (req, res) => {
    try {
      const { bankId } = req.params;
      const { BankName, BankApiKey } = req.body;
      const bank = await BankDetails.findByPk(bankId);
      if (!bank) {
        return res.status(404).json({ message: 'Bank not found.' });
      }
      
      // If BankApiKey is provided, it will be hashed by the beforeCreate hook on create,
      // but for updates you might want to hash it manually here (if desired)
      let updatedData = { BankName };
      if (BankApiKey) {
        updatedData.BankApiKey = crypto.createHash('sha256').update(BankApiKey).digest('hex');
      }
      
      await bank.update(updatedData);
      return res.status(200).json({
        message: 'Bank details updated successfully.',
        bank,
      });
    } catch (err) {
      console.error('Error updating bank detail:', err);
      return res.status(500).json({ error: 'Failed to update bank detail.' });
    }
  };

  // Delete a bank detail
  const deleteBankDetails = async (req, res) => {
    try {
      const { bankId } = req.params;
      const bank = await BankDetails.findByPk(bankId);
      if (!bank) {
        return res.status(404).json({ message: 'Bank not found.' });
      }
      await bank.destroy();
      return res.status(200).json({ message: 'Bank deleted successfully.' });
    } catch (err) {
      console.error('Error deleting bank detail:', err);
      return res.status(500).json({ error: 'Failed to delete bank detail.' });
    }
  };

  return {
    getAllBanksDetails,
    getBankDetailsById,
    addBankDetails,
    updateBankDetails,
    deleteBankDetails,
  };
};
