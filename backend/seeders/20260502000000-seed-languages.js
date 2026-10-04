'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Upsert or clear and insert languages
    await queryInterface.bulkDelete('languages', null, {});
    await queryInterface.bulkInsert('languages', [
      {
        id: 1,
        name: 'Python',
        version: '3.11',
        dockerImage: 'python:3.11-slim',
        compileCmd: null,
        runCmd: 'python3 script.py',
        extension: 'py',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Java',
        version: '17',
        dockerImage: 'eclipse-temurin:17-jdk-alpine',
        compileCmd: 'javac Main.java',
        runCmd: 'java Main',
        extension: 'java',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'C++',
        version: 'C++20 (GCC 12)',
        dockerImage: 'gcc:12',
        compileCmd: 'g++ -std=c++20 main.cpp -o main',
        runCmd: './main',
        extension: 'cpp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'JavaScript',
        version: '18 (Node.js)',
        dockerImage: 'node:18-alpine',
        compileCmd: null,
        runCmd: 'node script.js',
        extension: 'js',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('languages', null, {});
  }
};
