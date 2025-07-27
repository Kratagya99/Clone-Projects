import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { videoAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/Video/VideoCard';
import './Pages.css';

const Explore: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchVideos = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError('');
      const response = await videoAPI.getExploreVideos(pageNum, 10);
      
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
          <p>Discovering videos from {user?.city}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>🔍 Explore {user?.city}</h1>
          <p>Discover amazing 10-second videos from people in your city!</p>
        </div>
        <div className="city-badge">
          <span className="location-icon">📍</span>
          {user?.city}
        </div>
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
          <div className="empty-icon">🏙️</div>
          <h3>No videos from {user?.city} yet</h3>
          <p>Be the first to share a video from your city! Your upload will help build the local community.</p>
          <div className="empty-actions">
            <button onClick={() => fetchVideos()} className="refresh-button">
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="explore-stats">
            <div className="stat-card">
              <div className="stat-number">{videos.length}</div>
              <div className="stat-label">Videos Found</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user?.city}</div>
              <div className="stat-label">Your City</div>
            </div>
          </div>

          <div className="videos-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onLikeUpdate={handleLikeUpdate}
                showDeleteButton={false}
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
                {isLoading ? 'Loading...' : 'Discover More Videos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;