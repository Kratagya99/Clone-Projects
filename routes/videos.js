const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Check if file is video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Upload video
router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { duration } = req.body;
    
    // Validate duration (must be <= 10 seconds)
    if (!duration || parseFloat(duration) > 10) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Video must be 10 seconds or less' });
    }

    // Save video info to database
    const [result] = await pool.execute(
      'INSERT INTO videos (user_id, filename, original_name, file_path, duration, file_size, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        parseFloat(duration),
        req.file.size,
        req.user.city
      ]
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: result.insertId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        duration: parseFloat(duration),
        fileSize: req.file.size,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get user's videos (for home page)
router.get('/my-videos', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [videos] = await pool.execute(`
      SELECT 
        v.id, v.filename, v.original_name, v.duration, v.file_size, v.created_at,
        u.username,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.id) as like_count,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.id AND user_id = ?) as user_liked
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, req.user.id, limit, offset]);

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM videos WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      videos: videos.map(video => ({
        ...video,
        videoUrl: `/uploads/videos/${video.filename}`,
        user_liked: video.user_liked > 0
      })),
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get explore videos (from same city)
router.get('/explore', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [videos] = await pool.execute(`
      SELECT 
        v.id, v.filename, v.original_name, v.duration, v.file_size, v.created_at,
        u.username, u.city,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.id) as like_count,
        (SELECT COUNT(*) FROM likes WHERE video_id = v.id AND user_id = ?) as user_liked
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.city = ? AND v.user_id != ?
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, req.user.city, req.user.id, limit, offset]);

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM videos v WHERE v.city = ? AND v.user_id != ?',
      [req.user.city, req.user.id]
    );

    res.json({
      videos: videos.map(video => ({
        ...video,
        videoUrl: `/uploads/videos/${video.filename}`,
        user_liked: video.user_liked > 0
      })),
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching explore videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Like/Unlike video
router.post('/:videoId/like', authenticateToken, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    
    // Check if video exists
    const [videos] = await pool.execute('SELECT id FROM videos WHERE id = ?', [videoId]);
    if (videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if already liked
    const [existingLikes] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND video_id = ?',
      [req.user.id, videoId]
    );

    if (existingLikes.length > 0) {
      // Unlike
      await pool.execute(
        'DELETE FROM likes WHERE user_id = ? AND video_id = ?',
        [req.user.id, videoId]
      );
      
      // Get updated like count
      const [likeCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM likes WHERE video_id = ?',
        [videoId]
      );
      
      res.json({ 
        message: 'Video unliked', 
        liked: false, 
        likeCount: likeCount[0].count 
      });
    } else {
      // Like
      await pool.execute(
        'INSERT INTO likes (user_id, video_id) VALUES (?, ?)',
        [req.user.id, videoId]
      );
      
      // Get updated like count
      const [likeCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM likes WHERE video_id = ?',
        [videoId]
      );
      
      res.json({ 
        message: 'Video liked', 
        liked: true, 
        likeCount: likeCount[0].count 
      });
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Delete video
router.delete('/:videoId', authenticateToken, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    
    // Get video info
    const [videos] = await pool.execute(
      'SELECT file_path, user_id FROM videos WHERE id = ?',
      [videoId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videos[0];

    // Check if user owns the video
    if (video.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own videos' });
    }

    // Delete video from database
    await pool.execute('DELETE FROM videos WHERE id = ?', [videoId]);

    // Delete video file
    try {
      await fs.unlink(video.file_path);
    } catch (fileError) {
      console.error('Error deleting video file:', fileError);
      // Continue even if file deletion fails
    }

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;