const express = require('express');
const router = express.Router();
const verifyToken = require('../jwt/verify');


module.exports = (sequelize) => {
  // Import controller methods
  const userController = require('../controllers/userController')(sequelize); // Import the controller and pass sequelize

  const { registerUser, loginUser, getUserDetails, updateUser, updateUserProfile } = userController;

  // Route to register a new user
  router.post('/register', registerUser);

  // Route to login a user
  router.post('/login', loginUser);

  // Route to get user details
  router.get('/details/:userID', verifyToken, getUserDetails);

  // update user basing on the field sent
  router.post("/update",updateUser);

  router.post("/update/profile",updateUserProfile);

  return router;
};