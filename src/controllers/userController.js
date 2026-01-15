const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, User, events, eventRegistrations } = require('../db');
const { sendWelcomeEmail } = require('../utils/emailService');

// User registration
async function register(req, res) {
  try {
    const { email, name, password, role } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User(email, name, hashedPassword, role || 'attendee');
    users.push(newUser);

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration.',
      error: error.message,
    });
  }
}

// User login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user by email
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login.',
      error: error.message,
    });
  }
}

// Get user profile
function getUserProfile(req, res) {
  try {
    const user = users.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Get user's registered events
    const userRegistrations = eventRegistrations.filter(
      (r) => r.userId === req.userId && r.status === 'registered'
    );

    const registeredEvents = userRegistrations.map((reg) => {
      const event = events.find((e) => e.id === reg.eventId);
      return event;
    });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        registeredEvents: registeredEvents.filter((e) => e),
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
      error: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  getUserProfile,
};
