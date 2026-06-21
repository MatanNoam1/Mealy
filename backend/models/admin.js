'use strict';

// Admin record. Linked one-to-one to a User whose role is 'admin'. Holds
// admin-specific metadata (permission scope, notes) separate from the user row.
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: ['manage_users', 'manage_recipes'] },
      notes: { type: DataTypes.STRING, allowNull: true }
    },
    { tableName: 'admins' }
  );

  Admin.associate = (db) => {
    Admin.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
  };

  return Admin;
};
