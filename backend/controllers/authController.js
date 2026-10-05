const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Role 2 is standard 'user'
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      roleId: 2
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'user' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const roleName = user.role ? user.role.name : (user.roleId === 1 ? 'admin' : 'user');
    const token = jwt.sign(
      { id: user.id, username: user.username, role: roleName },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const roleName = req.user.role ? req.user.role.name : (req.user.roleId === 1 ? 'admin' : 'user');
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: roleName,
      roleId: req.user.roleId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
