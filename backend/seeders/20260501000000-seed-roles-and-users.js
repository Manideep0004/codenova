'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'admin',
        description: 'Administrator with full system telemetry and user management access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'user',
        description: 'Standard user with code authoring and execution rights',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Upsert default admin and demo user
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@codenova.io',
        password: adminPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'manideep',
        email: 'manideep@codenova.io',
        password: userPassword,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
