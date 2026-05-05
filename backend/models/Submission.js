// backend/models/Submission.js
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('Submission', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    languageId: { type: DataTypes.INTEGER, allowNull: false },
    code: { type: DataTypes.TEXT, allowNull: false },
    status: { 
      type: DataTypes.ENUM('queued', 'running', 'completed', 'failed'), 
      defaultValue: 'queued' 
    }
  }, {
    tableName: 'submissions',
    timestamps: true
  });

  Submission.associate = (models) => {
    Submission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Submission.belongsTo(models.Language, { foreignKey: 'languageId', as: 'language' });
    Submission.hasOne(models.ExecutionResult, { foreignKey: 'submissionId', as: 'result' });
  };

  return Submission;
};
