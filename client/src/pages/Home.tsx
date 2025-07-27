import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import { videoAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/Video/VideoCard';
import './Pages.css';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchVideos = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError('');
      const response = await videoAPI.getMyVideos(pageNum, 10);
      
      if (append) {
        setVideos(prev => [...prev, ...response.videos]);
      } else {
        setVideos(response.videos);
      }
      
      setHasMore(pageNum < response.pagination.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleLikeUpdate = (videoId: number, liked: boolean, likeCount: number) => {
    setVideos(prev =>
      prev.map(video =>
        video.id === videoId
          ? { ...video, user_liked: liked, like_count: likeCount }
          : video
      )
    );
  };

  const handleDeleteVideo = (videoId: number) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      fetchVideos(page + 1, true);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>🏠 My Videos</h1>
          <p>Welcome back, <strong>{user?.username}</strong>! Here are your recent uploads.</p>
        </div>
        <Link to="/upload" className="upload-cta">
          <span className="upload-icon">📹</span>
          Upload New Video
        </Link>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => fetchVideos()} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {videos.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>Start sharing your moments! Upload your first 10-second video.</p>
          <Link to="/upload" className="empty-action-button">
            Upload Your First Video
          </Link>
        </div>
      ) : (
        <>
          <div className="videos-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onLikeUpdate={handleLikeUpdate}
                onDelete={handleDeleteVideo}
                showDeleteButton={true}
              />
            ))}
          </div>

          {hasMore && (
            <div className="load-more-container">
              <button
                onClick={loadMore}
                className="load-more-button"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Videos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;