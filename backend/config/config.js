// Sequelize configuration. Reads credentials from environment variables so no
// secrets are committed. Loaded by both sequelize-cli (migrations/seeders) and
// the runtime model loader (models/index.js).
require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mealy',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false
};

module.exports = {
  development: common,
  test: { ...common, database: (process.env.DB_NAME || 'mealy') + '_test' },
  production: common
};
