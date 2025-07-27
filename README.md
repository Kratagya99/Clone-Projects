# 📹 VideoSync - Location-Based 10-Second Video Platform

VideoSync is a modern social media platform that allows users to share 10-second videos with people in their city. Built with React, Node.js, Express, and MySQL.

## ✨ Features

- **🔐 User Authentication**: Complete registration and login system
- **📹 Video Upload**: Upload videos up to 10 seconds long
- **🏠 Home Page**: View your uploaded videos
- **🔍 Explore Page**: Discover videos from people in your city
- **❤️ Like System**: Like and unlike videos
- **🗑️ Delete Videos**: Remove your own videos
- **📍 Location-Based**: Videos are filtered by user's city
- **📱 Responsive Design**: Modern, mobile-friendly interface

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Modern styling

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd video-social-platform
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up MySQL database**
   - Create a MySQL database named `video_social_platform`
   - Update database credentials in `.env` file

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=video_social_platform
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

6. **Start the development servers**

   In the root directory (for backend):
   ```bash
   npm run dev
   ```

   In another terminal (for frontend):
   ```bash
   npm run client
   ```

   Or run both simultaneously:
   ```bash
   npm run dev:full
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
video-social-platform/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Layout/        # Header, Layout
│   │   │   └── Video/         # Video components
│   │   ├── context/           # React context
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities (API calls)
│   │   └── App.tsx
│   └── package.json
├── config/                    # Database configuration
├── middleware/                # Express middleware
├── routes/                    # API routes
├── uploads/                   # Uploaded videos (created automatically)
├── server.js                  # Express server
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/my-videos` - Get user's videos
- `GET /api/videos/explore` - Get videos from same city
- `POST /api/videos/:id/like` - Like/unlike video
- `DELETE /api/videos/:id` - Delete video

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎯 Key Features Explained

### 10-Second Video Limit
- Videos are validated on both frontend and backend
- Duration is checked when the video metadata loads
- Files longer than 10 seconds are rejected

### Location-Based Discovery
- Users register with their city
- Explore page only shows videos from the same city
- Location is stored with each video for fast filtering

### Modern UI/UX
- Gradient backgrounds and modern design
- Responsive grid layouts
- Smooth animations and transitions
- Intuitive user interface

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File type and size validation
- CORS protection
- Helmet.js security headers

## 📱 Mobile Responsive

The application is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones

## 🚦 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  duration DECIMAL(4,2) NOT NULL,
  file_size INT NOT NULL,
  city VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Likes Table
```sql
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  video_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (user_id, video_id)
);
```

## 🔄 Development Scripts

```bash
# Backend only
npm run dev

# Frontend only (from root)
npm run client

# Both frontend and backend
npm run dev:full

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Video Upload Issues**
   - Check file size (max 50MB)
   - Verify video duration (max 10 seconds)
   - Ensure uploads directory has write permissions

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on ports 3000/5000

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend
- MySQL for reliable data storage
- All the open-source contributors
