const { Language } = require('../models');

exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'version', 'extension', 'compileCmd', 'runCmd']
    });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLanguageById = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ error: 'Language not found.' });
    }
    res.json(language);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
