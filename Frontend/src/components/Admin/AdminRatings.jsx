// components/Admin/AdminRatings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Star, Calendar, TrendingUp, Download, RefreshCw, Trash2, 
  Lock, Eye, EyeOff, Filter, Search, X 
} from 'lucide-react';
import './AdminRatings.css';

const AdminRatings = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  // 🔐 SECURITY: Set your admin password here
  const ADMIN_PASSWORD = 'admin2025'; // Change this to your secure password

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      loadRatings();
      loadStats();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'authenticated');
      setPassword('');
      loadRatings();
      loadStats();
    } else {
      alert('❌ Incorrect password!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setRatings([]);
    setStats(null);
  };

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/ratings/all');
      
      if (!response.ok) {
        throw new Error('Failed to load ratings');
      }
      
      const data = await response.json();
      setRatings(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      setError(err.message);
      console.error('Error loading ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ratings/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ratings/export');
      const data = await response.json();
      
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ CSV exported successfully!');
    } catch (err) {
      alert('❌ Failed to export CSV: ' + err.message);
    }
  };

  const clearAllRatings = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL ratings? This cannot be undone!')) {
      return;
    }
    
    if (!window.confirm('🚨 FINAL WARNING: This will permanently delete all ratings. Continue?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/ratings/clear', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ All ratings cleared successfully');
        loadRatings();
        loadStats();
      }
    } catch (err) {
      alert('❌ Failed to clear ratings: ' + err.message);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'easy': '👍',
      'helpful': '✨',
      'fast': '⚡',
      'accurate': '🎯',
      'design': '🎨',
      'skipped': '⏭️'
    };
    return emojis[category] || '📝';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'easy': 'Easy to use',
      'helpful': 'Very helpful',
      'fast': 'Fast & efficient',
      'accurate': 'Accurate results',
      'design': 'Great design',
      'skipped': 'Skipped'
    };
    return labels[category] || category;
  };

  // Filter ratings
  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = 
      rating.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterRating === 'all' || rating.rating === parseInt(filterRating);
    
    return matchesSearch && matchesFilter;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-icon">
            <Lock />
          </div>
          <h1>🔐 Admin Access</h1>
          <p>Enter password to view ratings dashboard</p>
          
          <form onSubmit={handleLogin}>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            
            <button type="submit" className="login-btn">
              Unlock Dashboard
            </button>
          </form>
          
          {/* <p className="login-hint">
            💡 Default password: <code>admin2024</code>
          </p> */}
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="admin-ratings-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>📊 Ratings Dashboard</h1>
          <p>View and manage all user feedback</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <Lock /> Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card gradient-blue">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <span className="stat-label">Average Rating</span>
              <span className="stat-value">{stats.average_rating} / 5.0</span>
            </div>
          </div>

          <div className="stat-card gradient-green">
            <div className="stat-icon">
              <Star />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Ratings</span>
              <span className="stat-value">{stats.total_ratings}</span>
            </div>
          </div>

          <div className="stat-card gradient-purple">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-label">5-Star Ratings</span>
              <span className="stat-value">{stats.distribution[5]}</span>
            </div>
          </div>

          <div className="stat-card gradient-orange">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <span className="stat-label">Response Rate</span>
              <span className="stat-value">
                {stats.total_ratings > 0 ? '100%' : '0%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {stats && (
        <div className="distribution-card">
          <h2>📊 Rating Distribution</h2>
          <div className="distribution-chart">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="distribution-row">
                <span className="star-label">{star} ⭐</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill"
                    style={{
                      width: `${stats.total_ratings > 0 ? (stats.distribution[star] / stats.total_ratings) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="distribution-count">{stats.distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-filter-group">
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                <X />
              </button>
            )}
          </div>

          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="action-buttons">
          <button onClick={loadRatings} className="action-btn refresh">
            <RefreshCw /> Refresh
          </button>
          <button onClick={exportCSV} className="action-btn export">
            <Download /> Export CSV
          </button>
          <button onClick={clearAllRatings} className="action-btn delete">
            <Trash2 /> Clear All
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading ratings...</p>
        </div>
      )}

      {/* Ratings List */}
      {!loading && (
        <div className="ratings-list">
          <div className="ratings-list-header">
            <h2>All Ratings ({filteredRatings.length})</h2>
          </div>

          {filteredRatings.length === 0 ? (
            <div className="empty-state">
              <Star className="empty-icon" />
              <p className="empty-title">No ratings found</p>
              <p className="empty-desc">
                {searchTerm || filterRating !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Ratings from users will appear here'}
              </p>
            </div>
          ) : (
            <div className="ratings-grid">
              {filteredRatings.map((rating) => (
                <div key={rating.id} className="rating-card">
                  <div className="rating-card-header">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={star <= rating.rating ? 'filled' : 'empty'}
                        />
                      ))}
                    </div>
                    <div className="rating-badges">
                      <span className={`device-badge ${rating.device_type}`}>
                        {rating.device_type === 'mobile' ? '📱' : '💻'} 
                        {rating.device_type}
                      </span>
                    </div>
                  </div>

                  {rating.category && rating.category !== 'skipped' && (
                    <div className="category-badge">
                      <span>{getCategoryEmoji(rating.category)}</span>
                      <span>{getCategoryLabel(rating.category)}</span>
                    </div>
                  )}

                  {rating.feedback && rating.feedback !== 'User skipped' && (
                    <div className="feedback-text">
                      💬 "{rating.feedback}"
                    </div>
                  )}

                  <div className="rating-card-footer">
                    <span className="rating-date">
                      <Calendar /> {formatDate(rating.timestamp)}
                    </span>
                    <span className="rating-id">ID: {rating.id.slice(-8)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRatings;