'use strict';

// Meal plan belonging to a user. planData holds the generated day-by-slot
// schedule (JSON): [{ day, meals: [{ recipeId, mealType, servings, ingredients }] }].
module.exports = (sequelize, DataTypes) => {
  const MealPlan = sequelize.define(
    'MealPlan',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      planStartDate: { type: DataTypes.DATEONLY, allowNull: true },
      planEndDate: { type: DataTypes.DATEONLY, allowNull: true },
      planData: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
    },
    { tableName: 'meal_plans' }
  );

  MealPlan.associate = (db) => {
    MealPlan.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
  };

  return MealPlan;
};
