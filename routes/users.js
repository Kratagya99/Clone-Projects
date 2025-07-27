const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // Get user info
    const [users] = await pool.execute(
      'SELECT id, username, email, city, created_at FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get user's video count
    const [videoCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM videos WHERE user_id = ?',
      [user.id]
    );

    // Get user's total likes received
    const [likesCount] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM likes l 
      JOIN videos v ON l.video_id = v.id 
      WHERE v.user_id = ?
    `, [user.id]);

    res.json({
      user: {
        ...user,
        videoCount: videoCount[0].count,
        totalLikes: likesCount[0].count
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { city } = req.body;
    
    if (city) {
      await pool.execute(
        'UPDATE users SET city = ? WHERE id = ?',
        [city, req.user.id]
      );
      
      // Update user's videos city as well
      await pool.execute(
        'UPDATE videos SET city = ? WHERE user_id = ?',
        [city, req.user.id]
      );
    }

    // Get updated user info
    const [users] = await pool.execute(
      'SELECT id, username, email, city FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;