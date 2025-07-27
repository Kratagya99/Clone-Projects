# 🚀 Quick Setup Guide

## Prerequisites
1. **Node.js** (v14+) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0+) - [Download here](https://mysql.com/downloads/)

## Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
# Make the setup script executable and run it
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup
```bash
# 1. Install backend dependencies
npm install

# 2. Install frontend dependencies
cd client && npm install && cd ..

# 3. Create and configure .env file
cp .env.example .env
# Edit .env with your MySQL credentials

# 4. Start both servers
npm run dev:full
```

## MySQL Database Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE video_social_platform;
   ```

2. **Update .env file:**
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=video_social_platform
   ```

## Testing the Application

1. **Open your browser to:** http://localhost:3000
2. **Register a new account** with any city name (e.g., "Delhi", "Mumbai")
3. **Upload a video** (make sure it's 10 seconds or less)
4. **View your videos** on the Home page
5. **Explore videos** from your city on the Explore page
6. **Try the like feature** on videos

## Troubleshooting

**Port already in use?**
```bash
# Kill processes on ports 3000 and 5000
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9
```

**Database connection issues?**
- Make sure MySQL is running
- Check your credentials in `.env`
- Ensure the database exists

**Video upload not working?**
- Check file size (max 50MB)
- Ensure video is 10 seconds or less
- Try different video formats (MP4, WebM)

## Features to Test

✅ **User Registration & Login**
✅ **Video Upload (10-second limit)**
✅ **Home Page (Your Videos)**
✅ **Explore Page (City-based)**
✅ **Like/Unlike Videos**
✅ **Delete Your Videos**
✅ **Responsive Design**
✅ **Location-based Discovery**

## Production Deployment

For production deployment:
```bash
# Build the frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

The application will serve the built React app from the Express server on port 5000.