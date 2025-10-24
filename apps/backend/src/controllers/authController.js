import { signup, login, getProfile } from '../services/authService.js';

export const signupController = async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await signup({ email, username, password });
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await login({ email, password });
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

export const profileController = async (req, res) => {
  try {
    const user = await getProfile(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
};