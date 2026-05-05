// backend/models/ExecutionResult.js
module.exports = (sequelize, DataTypes) => {
  const ExecutionResult = sequelize.define('ExecutionResult', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    submissionId: { type: DataTypes.INTEGER, allowNull: false },
    stdout: { type: DataTypes.TEXT, allowNull: true },
    stderr: { type: DataTypes.TEXT, allowNull: true },
    executionTime: { type: DataTypes.INTEGER, allowNull: true }, // in ms
    memoryUsed: { type: DataTypes.INTEGER, allowNull: true }, // in KB
    exitCode: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'execution_results',
    timestamps: true
  });

  ExecutionResult.associate = (models) => {
    ExecutionResult.belongsTo(models.Submission, { foreignKey: 'submissionId', as: 'submission' });
  };

  return ExecutionResult;
};
