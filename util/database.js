const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'nodejs', 'LocalPass', {
  host: `localhost`,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      instanceName: 'SQL2017',
    },
  },
});

module.exports = sequelize;
