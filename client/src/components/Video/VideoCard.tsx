import React, { useState } from 'react';
import { Video } from '../../types';
import { videoAPI } from '../../utils/api';
import './VideoCard.css';

interface VideoCardProps {
  video: Video;
  onLikeUpdate?: (videoId: number, liked: boolean, likeCount: number) => void;
  onDelete?: (videoId: number) => void;
  showDeleteButton?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onLikeUpdate, 
  onDelete, 
  showDeleteButton = false 
}) => {
  const [isLiked, setIsLiked] = useState(video.user_liked);
  const [likeCount, setLikeCount] = useState(video.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await videoAPI.likeVideo(video.id);
      setIsLiked(response.liked);
      setLikeCount(response.likeCount);
      onLikeUpdate?.(video.id, response.liked, response.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDeleting) return;

    const confirmed = window.confirm('Are you sure you want to delete this video?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await videoAPI.deleteVideo(video.id);
      onDelete?.(video.id);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const videoUrl = video.videoUrl.startsWith('http') 
    ? video.videoUrl 
    : `${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}${video.videoUrl}`;

  return (
    <div className="video-card">
      <div className="video-container">
        <video
          controls
          preload="metadata"
          className="video-player"
          poster=""
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {showDeleteButton && (
          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete video"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>

      <div className="video-info">
        <div className="video-header">
          <div className="user-info">
            <div className="user-avatar">
              {video.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h4 className="username">@{video.username}</h4>
              {video.city && <p className="location">📍 {video.city}</p>}
            </div>
          </div>
          <div className="video-meta">
            <span className="duration">{video.duration}s</span>
            <span className="upload-date">{formatDate(video.created_at)}</span>
          </div>
        </div>

        <div className="video-actions">
          <button
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <span className="like-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;