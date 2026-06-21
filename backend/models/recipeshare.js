'use strict';

// Junction table for the User <-> Recipe many-to-many "sharing" relationship.
// One row = "this recipe was shared with this user, by this owner".
module.exports = (sequelize, DataTypes) => {
  const RecipeShare = sequelize.define(
    'RecipeShare',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      recipeId: { type: DataTypes.INTEGER, allowNull: false },
      sharedWithUserId: { type: DataTypes.INTEGER, allowNull: false },
      sharedByUserId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
      tableName: 'recipe_shares',
      indexes: [{ unique: true, fields: ['recipeId', 'sharedWithUserId'] }]
    }
  );

  RecipeShare.associate = (db) => {
    RecipeShare.belongsTo(db.Recipe, { foreignKey: 'recipeId', as: 'recipe' });
    RecipeShare.belongsTo(db.User, { foreignKey: 'sharedWithUserId', as: 'sharedWithUser' });
    RecipeShare.belongsTo(db.User, { foreignKey: 'sharedByUserId', as: 'sharedByUser' });
  };

  return RecipeShare;
};
