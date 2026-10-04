'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('execution_results', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      submissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'submissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stdout: { type: Sequelize.TEXT, allowNull: true },
      stderr: { type: Sequelize.TEXT, allowNull: true },
      executionTime: { type: Sequelize.INTEGER, allowNull: true },
      memoryUsed: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      exitCode: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('execution_results', ['submissionId']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('execution_results');
  }
};
