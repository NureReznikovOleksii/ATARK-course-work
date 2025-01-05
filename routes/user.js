// C:\Users\sotni\SmartEnergyServer-main\routes\user.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// POST /users/register – User registration
router.post('/register', async (req, res) => {
    try {
        const { UserName, Email, Password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Create user
        const newUser = await User.create({
            UserName,
            Email,
            PasswordHash: hashedPassword,
            CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format date for MS SQL Server
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// GET /users/login – User login
router.get('/login', async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user information without JWT
        res.json({
            message: 'Login successful',
            user: {
                UserID: user.UserID,
                UserName: user.UserName,
                Email: user.Email,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /users/:id – Update user data
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { UserName, Email, Password } = req.body;

        // Find user by ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the email is already in use by another user
        if (Email && Email !== user.Email) {
            const existingUser = await User.findOne({ where: { Email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already in use by another user' });
            }
        }

        // Update user details
        if (UserName) user.UserName = UserName;
        if (Email) user.Email = Email;
        if (Password) {
            const hashedPassword = await bcrypt.hash(Password, 10);
            user.PasswordHash = hashedPassword;
        }
        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// DELETE /users/:id – Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete user by ID
        const deletedCount = await User.destroy({ where: { UserID: id } });
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
