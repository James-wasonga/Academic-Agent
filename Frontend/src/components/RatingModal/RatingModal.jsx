// components/RatingModal/RatingModal.jsx
import React, { useState } from 'react';
import { X, Star, ThumbsUp, Heart } from 'lucide-react';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'easy', label: 'Easy to use', icon: '👍' },
    { id: 'helpful', label: 'Very helpful', icon: '✨' },
    { id: 'fast', label: 'Fast & efficient', icon: '⚡' },
    { id: 'accurate', label: 'Accurate results', icon: '🎯' },
    { id: 'design', label: 'Great design', icon: '🎨' }
  ];

  // 🆕 Detect device type
  const getDeviceType = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      ? 'mobile' 
      : 'desktop';
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Prepare rating data
    const ratingData = {
      rating,
      feedback: feedback.trim(),
      category: selectedCategory,
      timestamp: new Date().toISOString(),
      id: `rating_${Date.now()}`,
      user_agent: navigator.userAgent,
      device_type: getDeviceType()
    };

    try {
      // 🆕 STEP 1: Save to localStorage (backup)
      const existingRatings = localStorage.getItem('appRatings');
      const ratings = existingRatings ? JSON.parse(existingRatings) : [];
      ratings.push(ratingData);
      localStorage.setItem('appRatings', JSON.stringify(ratings));

      // 🆕 STEP 2: Send to backend API
      const response = await fetch('http://localhost:8000/api/ratings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Rating sent to server:', result);

      // Show thank you message
      setShowThankYou(true);
      
      // Call parent callback
      if (onSubmit) {
        onSubmit(ratingData);
      }

      // Close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error sending rating:', error);
      
      // Show error but still save locally
      setError('Saved locally, but could not send to server. Your feedback is still recorded!');
      
      // Still show thank you after error
      setTimeout(() => {
        setShowThankYou(true);
        if (onSubmit) {
          onSubmit(ratingData);
        }
        setTimeout(() => {
          handleClose();
        }, 2000);
      }, 1500);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    setSelectedCategory('');
    setShowThankYou(false);
    setError(null);
    onClose();
  };

  const handleSkip = () => {
    // Mark that user skipped
    const skipData = {
      skipped: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('lastRatingSkip', JSON.stringify(skipData));
    
    // 🆕 Optionally send skip event to backend
    fetch('http://localhost:8000/api/ratings/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: 0,
        feedback: 'User skipped',
        category: 'skipped',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        device_type: getDeviceType()
      }),
    }).catch(err => console.log('Skip not sent to server:', err));
    
    handleClose();
  };

  const getRatingText = (stars) => {
    switch(stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Rate your experience';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
        {!showThankYou ? (
          <>
            {/* Header */}
            <div className="rating-modal-header">
              <div className="rating-modal-icon">
                <Heart className="heart-icon" />
              </div>
              <button className="rating-modal-close" onClick={handleClose}>
                <X />
              </button>
            </div>

            {/* Title */}
            <div className="rating-modal-title">
              <h2>How was your experience?</h2>
              <p>We'd love to hear your feedback!</p>
            </div>

            {/* Star Rating */}
            <div className="rating-stars-container">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-button ${
                      star <= (hoveredRating || rating) ? 'active' : ''
                    }`}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`star-icon ${
                        star <= (hoveredRating || rating) ? 'filled' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="rating-text">{getRatingText(hoveredRating || rating)}</p>
            </div>

            {/* Quick Categories */}
            {rating > 0 && (
              <div className="rating-categories">
                <p className="categories-label">What did you like most?</p>
                <div className="categories-grid">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`category-button ${
                        selectedCategory === category.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-label">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Textarea */}
            {rating > 0 && (
              <div className="rating-feedback">
                <label htmlFor="feedback">
                  Additional comments (optional)
                </label>
                <textarea
                  id="feedback"
                  placeholder="Tell us more about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#92400e',
                marginBottom: '1rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="rating-modal-actions">
              <button
                className="rating-btn rating-btn-secondary"
                onClick={handleSkip}
              >
                Skip
              </button>
              <button
                className="rating-btn rating-btn-primary"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="btn-icon" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          // Thank You Message
          <div className="thank-you-message">
            <div className="thank-you-icon">✨</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been sent successfully!</p>
            <div className="thank-you-stars">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="thank-you-star" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingModal;