const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
const port = 3000;

const USERS_FILE = path.join(__dirname, 'src', 'main', 'resources', 'static', 'users.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'main', 'resources', 'static')));

// Helpers
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// In-memory store for password reset tokens (for production, use DB or cache like Redis)
const passwordResetTokens = {};

// ======================= Signup =======================
app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const users = await readJsonFile(USERS_FILE);
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    users.push({ username, password, role });
    await writeJsonFile(USERS_FILE, users);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ======================= Login =======================
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ username: user.username, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ======================= Initiate Password Reset =======================
app.post('/reset-password/initiate', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate secure random token
    const token = crypto.randomBytes(20).toString('hex');
    passwordResetTokens[username] = token;

    // In real app, send this token to user's email
    res.json({ message: 'Password reset token generated', token });
  } catch (err) {
    console.error('Reset initiate error:', err);
    res.status(500).json({ message: 'Server error during password reset initiation' });
  }
});

// ======================= Complete Password Reset =======================
app.post('/reset-password/complete', async (req, res) => {
  const { username, token, newPassword } = req.body;
  if (!username || !token || !newPassword) {
    return res.status(400).json({ message: 'Username, token, and new password are required' });
  }

  try {
    if (!passwordResetTokens[username] || passwordResetTokens[username] !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const users = await readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].password = newPassword;
    await writeJsonFile(USERS_FILE, users);

    // Remove used token
    delete passwordResetTokens[username];

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// ======================= Employee Endpoints =======================
// Add employee - For demo, just return success. Implement actual storage if needed.
app.post('/employees', (req, res) => {
  // You can extend this to save employee details to a file or DB.
  res.status(201).json({ message: 'Employee added successfully' });
});

// Get employees list - example hardcoded
app.get('/employees', (req, res) => {
  res.json([
    { id: 1, name: "Prajna", email: "prajnatripurari@gmail.com", department: "HR", status: "Active" }
  ]);
});

// ======================= Fallback Route =======================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'main', 'resources', 'static', 'index.html'));
});

// Start server only if run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`✅ Server running at: http://localhost:${port}`);
  });
}

module.exports = app;
