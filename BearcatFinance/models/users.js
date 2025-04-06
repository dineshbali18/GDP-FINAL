const crypto = require('crypto');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

  const Users = sequelize.define('Users', {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'user',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Users.beforeCreate((user) => {
    user.password = crypto.createHash('sha256').update(user.password).digest('hex');
  });

  // Users.beforeUpdate((user)=>{
  //   user.password = crypto.createHash('sha256').update(user.password).digest('hex');
  // });

  Users.prototype.validatePassword = function (password) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    return this.password === hashedPassword;
  };

  return Users;
};
