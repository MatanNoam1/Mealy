'use strict';

// Creates the full Mealy schema: users, admins, recipes, recipe_shares
// (junction), meal_plans. Tables are created in FK-dependency order and dropped
// in reverse. Run with `npm run db:migrate`.
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, STRING, TEXT, BOOLEAN, JSON, ENUM, DATE, DATEONLY } = Sequelize;
    const timestamps = {
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false }
    };

    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: STRING, allowNull: false },
      lastName: { type: STRING, allowNull: false },
      email: { type: STRING, allowNull: false, unique: true },
      passwordHash: { type: STRING, allowNull: false },
      dietaryPreferences: { type: JSON, allowNull: false },
      theme: { type: ENUM('light', 'dark'), allowNull: false, defaultValue: 'light' },
      userRole: { type: ENUM('admin', 'manager', 'user'), allowNull: false, defaultValue: 'user' },
      ...timestamps
    });

    await queryInterface.createTable('admins', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: INTEGER, allowNull: false, unique: true,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      permissions: { type: JSON, allowNull: false },
      notes: { type: STRING, allowNull: true },
      ...timestamps
    });

    await queryInterface.createTable('recipes', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      ownerId: {
        type: INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      title: { type: STRING, allowNull: false },
      ingredients: { type: JSON, allowNull: false },
      instructions: { type: TEXT, allowNull: false },
      prepTime: { type: INTEGER, allowNull: true },
      servings: { type: INTEGER, allowNull: false, defaultValue: 1 },
      mealTypes: { type: JSON, allowNull: false },
      isPublic: { type: BOOLEAN, allowNull: false, defaultValue: true },
      imageUrl: { type: STRING, allowNull: true },
      cuisineType: { type: STRING, allowNull: true },
      tags: { type: JSON, allowNull: false },
      ...timestamps
    });

    await queryInterface.createTable('recipe_shares', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      recipeId: {
        type: INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      sharedWithUserId: {
        type: INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      sharedByUserId: {
        type: INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      ...timestamps
    });
    await queryInterface.addConstraint('recipe_shares', {
      fields: ['recipeId', 'sharedWithUserId'],
      type: 'unique',
      name: 'recipe_shares_recipe_user_unique'
    });

    await queryInterface.createTable('meal_plans', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'
      },
      title: { type: STRING, allowNull: true },
      planStartDate: { type: DATEONLY, allowNull: true },
      planEndDate: { type: DATEONLY, allowNull: true },
      planData: { type: JSON, allowNull: false },
      ...timestamps
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('meal_plans');
    await queryInterface.dropTable('recipe_shares');
    await queryInterface.dropTable('recipes');
    await queryInterface.dropTable('admins');
    await queryInterface.dropTable('users');
  }
};
