import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Eye, Download, Search, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import './ResearchHistory.css'

const ResearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const stored = localStorage.getItem('researchHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResearch = (id) => {
    if (window.confirm('Are you sure you want to delete this research?')) {
      const updated = history.filter(item => item.id !== id);
      setHistory(updated);
      localStorage.setItem('researchHistory', JSON.stringify(updated));
      if (selectedResearch?.id === id) {
        setSelectedResearch(null);
      }
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all research history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('researchHistory');
      setSelectedResearch(null);
    }
  };

  const exportToPDF = (research) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Research Results', 40, y);
    y += 30;

    doc.setFontSize(14);
    doc.text(`Topic: ${research.topic}`, 40, y);
    y += 25;

    const cleanedSummary = research.summary
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');

    const lines = cleanedSummary.split('\n');
    doc.setFontSize(12);

    lines.forEach((line) => {
      if (!line.trim()) {
        y += 8;
        return;
      }

      if (/^\d+(\.\d+)*\.\s+/.test(line)) {
        doc.setFont('Helvetica', 'bold');
      } else {
        doc.setFont('Helvetica', 'normal');
      }

      if (/^\-\s+/.test(line)) {
        line = '• ' + line.replace(/^\-\s+/, '');
      }

      const wrappedLines = doc.splitTextToSize(line, 500);
      wrappedLines.forEach((t) => {
        if (y > 770) {
          doc.addPage();
          y = 40;
        }
        doc.text(t, 40, y);
        y += 16;
      });
    });

    if (research.sources) {
      y += 20;
      if (y > 770) {
        doc.addPage();
        y = 40;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text('Sources:', 40, y);
      y += 16;

      doc.setFont('Helvetica', 'normal');
      const sourceLines = doc.splitTextToSize(research.sources, 500);
      sourceLines.forEach((t) => {
        if (y > 770) {
          doc.addPage();
          y = 40;
        }
        doc.text(t, 40, y);
        y += 14;
      });
    }

    doc.save(`${research.topic.replace(/\s+/g, '_')}_Research.pdf`);
  };

  const filteredHistory = history.filter(item =>
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="research-history-container">
      <div className="research-history-wrapper">
        {/* Header */}
        <div className="research-history-header">
          <h1 className="research-history-title">Research History</h1>
          <p className="research-history-subtitle">Access and manage your previous research findings</p>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card blue">
            <div className="feature-icon">💾</div>
            <h3 className="feature-title">Auto-Save</h3>
            <p className="feature-desc">All research saved automatically</p>
          </div>
          <div className="feature-card green">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Quick Search</h3>
            <p className="feature-desc">Find past research instantly</p>
          </div>
          <div className="feature-card purple">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">Export PDF</h3>
            <p className="feature-desc">Download any research</p>
          </div>
          <div className="feature-card orange">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Data Safe</h3>
            <p className="feature-desc">No more lost research</p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="search-controls">
          <div className="search-controls-inner">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search research history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              onClick={clearAllHistory}
              disabled={history.length === 0}
              className="clear-all-btn"
            >
              <Trash2 />
              Clear All
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="history-grid">
          {/* History List */}
          <div className="history-list-container">
            <div className="history-list-card">
              <h2 className="history-list-header">
                <Clock />
                Recent Research ({filteredHistory.length})
              </h2>

              {filteredHistory.length === 0 ? (
                <div className="empty-state">
                  <Calendar className="empty-icon" />
                  <p className="empty-title">No research history found</p>
                  <p className="empty-desc">Your research results will appear here</p>
                </div>
              ) : (
                <div className="history-items">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`history-item ${selectedResearch?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedResearch(item)}
                    >
                      <h3 className="history-item-title">{item.topic}</h3>
                      <p className="history-item-meta">
                        <Clock />
                        {formatDate(item.timestamp)}
                      </p>
                      <div className="history-item-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResearch(item);
                          }}
                          className="action-btn view"
                        >
                          <Eye />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToPDF(item);
                          }}
                          className="action-btn download"
                        >
                          <Download />
                          PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteResearch(item.id);
                          }}
                          className="action-btn delete"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="detail-view-container">
            {selectedResearch ? (
              <div className="detail-card">
                <div className="detail-header">
                  <h2 className="detail-title">{selectedResearch.topic}</h2>
                  <div className="detail-meta">
                    <span>
                      <Clock />
                      {new Date(selectedResearch.timestamp).toLocaleString()}
                    </span>
                    <button
                      onClick={() => exportToPDF(selectedResearch)}
                      className="export-btn"
                    >
                      <Download />
                      Export PDF
                    </button>
                  </div>
                </div>

                <div className="detail-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedResearch.summary}
                  </ReactMarkdown>
                </div>

                {selectedResearch.sources && (
                  <div className="sources-box">
                    <h4 className="sources-title">📚 Sources</h4>
                    <p className="sources-content">{selectedResearch.sources}</p>
                  </div>
                )}

                <div className="detail-footer">
                  © {new Date().getFullYear()} AcaWise. All rights reserved.
                </div>
              </div>
            ) : (
              <div className="detail-card">
                <div className="empty-state">
                  <Eye className="empty-icon" />
                  <h3 className="empty-title">No Research Selected</h3>
                  <p className="empty-desc">
                    Select a research item from the list to view its details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchHistory;