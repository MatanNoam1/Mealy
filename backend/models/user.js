'use strict';

// User account. Owns recipes (one-to-many) and can have recipes shared with it
// (many-to-many through RecipeShare). An admin user also has one Admin record.
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      dietaryPreferences: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      theme: { type: DataTypes.ENUM('light', 'dark'), allowNull: false, defaultValue: 'light' },
      userRole: { type: DataTypes.ENUM('admin', 'manager', 'user'), allowNull: false, defaultValue: 'user' }
    },
    { tableName: 'users' }
  );

  User.associate = (db) => {
    // One-to-many: a user owns many recipes.
    User.hasMany(db.Recipe, { foreignKey: 'ownerId', as: 'ownedRecipes' });
    // One-to-many: a user owns many meal plans.
    User.hasMany(db.MealPlan, { foreignKey: 'userId', as: 'mealPlans' });
    // One-to-one: an admin user has one Admin record.
    User.hasOne(db.Admin, { foreignKey: 'userId', as: 'admin' });
    // Many-to-many: recipes shared with this user, via the junction table.
    User.belongsToMany(db.Recipe, {
      through: db.RecipeShare,
      foreignKey: 'sharedWithUserId',
      otherKey: 'recipeId',
      as: 'sharedRecipes'
    });
  };

  return User;
};
