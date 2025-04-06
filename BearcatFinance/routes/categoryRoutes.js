// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (sequelize) => {
  // Import the category controller and pass the sequelize instance
  const categoryController = require('../controllers/categoryController')(sequelize);

  // Route to get all categories
  router.get('/', categoryController.getCategories);

  // Route to get a specific category by ID
  router.get('/:categoryId', categoryController.getCategoryById);

  // Route to create a new category
  router.post('/', categoryController.createCategory);

  // Route to update an existing category
  router.put('/:categoryId', categoryController.updateCategory);

  // Route to delete a category
  router.delete('/:categoryId', categoryController.deleteCategory);

  return router;
};
