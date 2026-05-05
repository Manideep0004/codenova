// backend/models/Language.js
module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    dockerImage: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'languages',
    timestamps: true
  });

  Language.associate = (models) => {
    Language.hasMany(models.Submission, { foreignKey: 'languageId', as: 'submissions' });
  };

  return Language;
};
