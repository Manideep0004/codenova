const { Language } = require('../models');

exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      attributes: ['id', 'name', 'version']
    });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
