'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('languages', [
      {
        name: 'Python',
        version: '3.11',
        dockerImage: 'python:3.11-slim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Java',
        version: '17',
        dockerImage: 'openjdk:17-slim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'C++',
        version: '12',
        dockerImage: 'gcc:12',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'JavaScript',
        version: '18',
        dockerImage: 'node:18-alpine',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('languages', null, {});
  }
};
