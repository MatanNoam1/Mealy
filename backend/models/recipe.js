'use strict';

// Recipe owned by a user. Can be shared with other users (many-to-many through
// RecipeShare). mealType drives AI meal-plan slotting.
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define(
    'Recipe',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ownerId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      ingredients: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      instructions: { type: DataTypes.TEXT, allowNull: false },
      prepTime: { type: DataTypes.INTEGER, allowNull: true },
      servings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      mealTypes: { type: DataTypes.JSON, allowNull: false, defaultValue: ['dinner'] },
      isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      cuisineType: { type: DataTypes.STRING, allowNull: true },
      tags: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
    },
    { tableName: 'recipes' }
  );

  Recipe.associate = (db) => {
    // One-to-many inverse: a recipe belongs to its owner.
    Recipe.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });
    // Many-to-many: users this recipe is shared with, via the junction table.
    Recipe.belongsToMany(db.User, {
      through: db.RecipeShare,
      foreignKey: 'recipeId',
      otherKey: 'sharedWithUserId',
      as: 'sharedWith'
    });
  };

  return Recipe;
};
