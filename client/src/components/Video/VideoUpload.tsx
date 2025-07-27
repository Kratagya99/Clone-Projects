import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../../utils/api';
import './VideoUpload.css';

const VideoUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create video preview
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);

      if (duration > 10) {
        setError('Video must be 10 seconds or less');
        setSelectedFile(null);
        setVideoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoDuration) {
      setError('Please select a valid video file');
      return;
    }

    if (videoDuration > 10) {
      setError('Video must be 10 seconds or less');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('duration', videoDuration.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await videoAPI.uploadVideo(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clean up
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      // Navigate to home page
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVideoDuration(null);
    setVideoPreview(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1>📹 Share Your Moment</h1>
          <p>Upload a video up to 10 seconds to share with your city</p>
        </div>

        {!selectedFile ? (
          <div className="upload-zone">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="upload-label">
              <div className="upload-icon">🎬</div>
              <h3>Choose a video file</h3>
              <p>Select a video up to 10 seconds long</p>
              <span className="upload-button">Browse Files</span>
            </label>
          </div>
        ) : (
          <div className="preview-section">
            <div className="video-preview">
              <video
                ref={videoRef}
                src={videoPreview || ''}
                controls
                onLoadedMetadata={handleVideoLoadedMetadata}
                className="preview-video"
              />
            </div>

            <div className="file-info">
              <h4>Selected Video</h4>
              <div className="file-details">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                {videoDuration && (
                  <p>
                    <strong>Duration:</strong> {videoDuration.toFixed(1)}s
                    {videoDuration <= 10 ? (
                      <span className="duration-valid"> ✅</span>
                    ) : (
                      <span className="duration-invalid"> ❌ Too long!</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="upload-actions">
              <button
                onClick={handleReset}
                className="reset-button"
                disabled={isUploading}
              >
                Choose Different Video
              </button>
              <button
                onClick={handleUpload}
                className="upload-submit-button"
                disabled={isUploading || !videoDuration || videoDuration > 10}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>

            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>
        )}

        <div className="upload-tips">
          <h4>Upload Tips:</h4>
          <ul>
            <li>Videos must be 10 seconds or less</li>
            <li>Maximum file size: 50MB</li>
            <li>Supported formats: MP4, WebM, AVI, MOV</li>
            <li>Portrait or landscape orientation both work</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;