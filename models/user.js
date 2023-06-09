'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasOne(models.product, {foreignKey:"user_id"})
      user.hasOne(models.user_token, {foreignKey:"user_id"})
      // define association here
    }
  }
  user.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    wrongpasswordcnt:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};