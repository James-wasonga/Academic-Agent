// should be removed later since it is for AI being worked on

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, Users, Bell, User, UserPlus, AlertCircle, CheckCircle, Wrench, Clock } from 'lucide-react';
import Toast from '../Toast/Toast';
import axios from 'axios';
import './StudentChat.css';

// const API_URL = 'http://localhost:8000/api/chat';
const API_URL = `${import.meta.env.VITE_API_URL}/api/chat`;

const StudentChat = () => {
  const [activeMode, setActiveMode] = useState('peer'); // Default to peer mode
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showContacts, setShowContacts] = useState(true); // Show contacts by default
  
  // Login modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);

  const messagesEndRef = useRef(null);
  const pollMessagesInterval = useRef(null);
  const contactsInterval = useRef(null);
  const heartbeatInterval = useRef(null);
  const usernameCheckTimeout = useRef(null);

  // Initialize user identity
  useEffect(() => {
    let userId = localStorage.getItem('student_user_id');
    let storedUsername = localStorage.getItem('student_username');

    if (!userId || !storedUsername) {
      setShowLoginModal(true);
    } else {
      initializeUser(userId, storedUsername);
    }
  }, []);

  const initializeUser = async (userId, name) => {
    try {
      const response = await axios.post(`${API_URL}/session/create`, {
        user_id: userId,
        username: name
      });

      setCurrentUser({ id: userId, name: name });
      localStorage.setItem('student_user_id', userId);
      localStorage.setItem('student_username', name);

      // Heartbeat every 15s
      heartbeatInterval.current = setInterval(() => {
        axios.post(`${API_URL}/session/heartbeat`, { user_id: userId, username: name })
          .catch(err => console.error('heartbeat error', err));
      }, 15000);

      loadContacts();
      checkUnreadMessages(userId);

      // Poll contacts every 5 seconds
      contactsInterval.current = setInterval(() => {
        loadContacts();
        checkUnreadMessages(userId);
      }, 5000);

      showToast(`Welcome, ${name}! 🎉 You're now online!`, 'success');
    } catch (error) {
      console.error('Failed to initialize user:', error);
      showToast('Failed to connect. Please try again.', 'error');
      setShowLoginModal(true);
    }

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval.current);
      clearInterval(contactsInterval.current);
      clearInterval(pollMessagesInterval.current);
    };
  };

  // Check username availability with debounce
  const checkUsernameAvailability = async (name) => {
    if (!name.trim()) {
      setUsernameError('');
      setUsernameValid(false);
      return;
    }

    if (name.trim().length < 2) {
      setUsernameError('Name must be at least 2 characters long');
      setUsernameValid(false);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await axios.post(`${API_URL}/check-username`, {
        username: name.trim()
      });

      if (response.data.available) {
        setUsernameError('');
        setUsernameValid(true);
      } else {
        setUsernameError(response.data.message);
        setUsernameValid(false);
      }
    } catch (error) {
      console.error('Username check failed:', error);
      setUsernameError('Failed to check username availability');
      setUsernameValid(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounce username check
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameValid(false);

    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Set new timeout
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    if (username.trim().length < 2) {
      showToast('Name must be at least 2 characters long', 'error');
      return;
    }

    if (!usernameValid) {
      showToast('Please choose a valid username', 'error');
      return;
    }

    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    try {
      await initializeUser(userId, username.trim());
      setShowLoginModal(false);
      setUsername('');
    } catch (error) {
      showToast('Failed to create account. Please try again.', 'error');
    }
  };

  // Poll messages when in peer mode
  useEffect(() => {
    if (activeMode === 'peer' && selectedPeer && currentUser) {
      loadPeerMessages(selectedPeer.id);
      clearInterval(pollMessagesInterval.current);
      pollMessagesInterval.current = setInterval(() => {
        loadPeerMessages(selectedPeer.id);
      }, 2500);
    } else {
      clearInterval(pollMessagesInterval.current);
    }
  }, [activeMode, selectedPeer, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/peer/contacts`);
      setContacts(res.data.contacts);
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  };

  const checkUnreadMessages = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/peer/unread/${userId}`);
      setUnreadCount(res.data.total_unread || 0);
      setUnreadMessages(res.data.unread_from || {});
    } catch (err) {
      console.error('Failed to check unread', err);
    }
  };

  const loadPeerMessages = async (peerId) => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_URL}/peer/messages/${currentUser.id}/${peerId}`);
      const formatted = res.data.messages.map(m => ({
        id: m.id,
        text: m.message,
        sender: m.sender_id === currentUser.id ? 'user' : 'peer',
        username: m.sender_name,
        timestamp: m.timestamp
      }));
      setMessages(formatted);
      checkUnreadMessages(currentUser.id);
    } catch (err) {
      console.error('Failed to load peer messages', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if in AI mode - show coming soon message
    if (activeMode === 'ai') {
      showToast('🔧 AI Assistant is currently under maintenance. Please use Peer Chat for now!', 'warning');
      return;
    }

    const text = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Peer mode
    if (!selectedPeer) {
      showToast('Please select a peer to chat with', 'warning');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/peer/send`, {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        receiver_id: selectedPeer.id,
        message: text
      });
      await loadPeerMessages(selectedPeer.id);
      showToast('Message sent! ✓', 'success');
    } catch (err) {
      console.error('send failed', err);
      showToast('Failed to send message', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
    setShowContacts(false);
    loadPeerMessages(peer.id);
  };

  const handleModeChange = (mode) => {
    if (mode === 'ai') {
      showToast('🔧 AI Assistant is being worked on by our technical team. Coming soon!', 'info');
      return; // Don't switch to AI mode
    }
    
    setActiveMode(mode);
    setMessages([]);
    if (mode === 'peer') {
      setShowContacts(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  const statusDot = (status) => (
    <span className={`status-dot ${status === 'online' ? 'online' : 'offline'}`} />
  );

  return (
    <div className="student-chat-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={4000} />}
      
      {/* Beautiful Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <div className="login-icon">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="login-title">Welcome to Student Chat! 👋</h2>
              <p className="login-subtitle">Enter your name to start chatting with classmates</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Your Name
                </label>
                <div className="input-wrapper">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="e.g., James Wasonga"
                    className={`form-input ${usernameError ? 'input-error' : usernameValid ? 'input-success' : ''}`}
                    autoFocus
                  />
                  {isCheckingUsername && (
                    <div className="input-icon">
                      <div className="spinner"></div>
                    </div>
                  )}
                  {!isCheckingUsername && usernameValid && (
                    <div className="input-icon">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  {!isCheckingUsername && usernameError && (
                    <div className="input-icon">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                
                {usernameError && (
                  <p className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    {usernameError}
                  </p>
                )}
                
                {usernameValid && !usernameError && (
                  <p className="success-message">
                    <CheckCircle className="w-4 h-4" />
                    Great! This name is available
                  </p>
                )}

                <p className="form-hint">
                  💡 Tip: If someone has your first name, add your last name to make it unique
                </p>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={!usernameValid || isCheckingUsername}
              >
                {isCheckingUsername ? 'Checking...' : 'Join Chat'}
              </button>
            </form>

            <div className="login-footer">
              <p className="footer-text">By joining, you agree to be respectful and kind to others</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      {currentUser && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
                Student Q&A Center
              </h2>
              <div className="flex items-center space-x-4">
                {unreadCount > 0 && (
                  <div className="relative">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  </div>
                )}
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  {currentUser.name}
                </span>
              </div>
            </div>

            <div className="chat-window">
              <div className="chat-header">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleModeChange('ai')} 
                    className="mode-btn relative"
                    title="AI Assistant - Coming Soon"
                  >
                    <Bot className="w-4 h-4 mr-2" /> 
                    AI Assistant
                    <Wrench className="w-3 h-3 ml-2 text-yellow-300" />
                  </button>
                  <button onClick={() => handleModeChange('peer')} className="mode-btn active">
                    <Users className="w-4 h-4 mr-2" /> Peer Chat
                    {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
                  </button>
                </div>
                {activeMode === 'peer' && (
                  <button onClick={() => setShowContacts(!showContacts)} className="text-white text-sm hover:underline">
                    {selectedPeer ? `💬 ${selectedPeer.name}` : 'Select a peer'}
                  </button>
                )}
              </div>

              {/* Coming Soon Notice for AI Mode */}
              {activeMode === 'ai' && (
                <div className="ai-maintenance-notice">
                  <div className="maintenance-icon">
                    <Wrench className="w-12 h-12 text-purple-600 animate-bounce" />
                  </div>
                  <h3 className="maintenance-title">AI Assistant Under Maintenance 🔧</h3>
                  <p className="maintenance-text">
                    Our technical team is working hard to bring you an amazing AI-powered learning assistant!
                  </p>
                  <div className="maintenance-features">
                    <h4 className="features-title">Coming Soon:</h4>
                    <ul className="features-list">
                      <li>📚 Instant homework help</li>
                      <li>💡 Code debugging assistance</li>
                      <li>🎯 Personalized learning tips</li>
                      <li>⚡ 24/7 availability</li>
                    </ul>
                  </div>
                  <div className="maintenance-cta">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>Expected Launch: Soon!</span>
                  </div>
                  <button 
                    onClick={() => handleModeChange('peer')}
                    className="switch-to-peer-btn"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Use Peer Chat for Now
                  </button>
                </div>
              )}

              {/* Peer Chat Interface */}
              {activeMode === 'peer' && (
                <>
                  {showContacts && (
                    <div className="contacts-sidebar">
                      <h3 className="text-lg font-bold mb-4">Available Students ({contacts.filter(c => c.id !== currentUser.id).length})</h3>
                      <div className="space-y-2">
                        {contacts.filter(c => c.id !== currentUser.id).map(contact => (
                          <button key={contact.id} onClick={() => handleSelectPeer(contact)} className={`contact-item ${selectedPeer?.id === contact.id ? 'active' : ''}`}>
                            <span className="text-2xl mr-3">{contact.avatar}</span>
                            <div className="flex-1 text-left">
                              <p className="font-semibold">{contact.name}</p>
                              <p className={`text-xs ${contact.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                                {statusDot(contact.status)} {contact.status}
                              </p>
                            </div>
                            {unreadMessages[contact.id] && (
                              <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {unreadMessages[contact.id].count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="messages-container">
                    {messages.map((message) => (
                      <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                        <div className="message-avatar">
                          {message.sender === 'user' ? (
                            <div className="avatar user-avatar">You</div>
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="message-content">
                          {message.username && message.sender === 'peer' && <p className="message-username">{message.username}</p>}
                          <div className="message-bubble">
                            <p className="message-text">{message.text}</p>
                          </div>
                          <p className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="message bot-message">
                        <div className="message-avatar">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-container">
                    {!selectedPeer ? (
                      <div className="text-center text-gray-500 py-4">
                        👆 Please select a peer from the list above to start chatting
                      </div>
                    ) : (
                      <>
                        <div className="chat-input-wrapper">
                          <textarea 
                            value={inputMessage} 
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${selectedPeer?.name}...`}
                            className="chat-input" 
                            rows="1" 
                          />
                          <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className="send-btn">
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentChat;



// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, Send, Bot, Users, Bell, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
// import Toast from '../Toast/Toast';
// import axios from 'axios';
// import './StudentChat.css';

// const API_URL = 'http://localhost:8000/api/chat';

// const StudentChat = () => {
//   const [activeMode, setActiveMode] = useState('ai');
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [selectedPeer, setSelectedPeer] = useState(null);
//   const [contacts, setContacts] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [unreadMessages, setUnreadMessages] = useState({});
//   const [showContacts, setShowContacts] = useState(false);
  
//   // Login modal states
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [username, setUsername] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [isCheckingUsername, setIsCheckingUsername] = useState(false);
//   const [usernameValid, setUsernameValid] = useState(false);

//   const messagesEndRef = useRef(null);
//   const pollMessagesInterval = useRef(null);
//   const contactsInterval = useRef(null);
//   const heartbeatInterval = useRef(null);
//   const usernameCheckTimeout = useRef(null);

//   // Initialize user identity
//   useEffect(() => {
//     let userId = localStorage.getItem('student_user_id');
//     let storedUsername = localStorage.getItem('student_username');

//     if (!userId || !storedUsername) {
//       setShowLoginModal(true);
//     } else {
//       initializeUser(userId, storedUsername);
//     }
//   }, []);

//   const initializeUser = async (userId, name) => {
//     try {
//       const response = await axios.post(`${API_URL}/session/create`, {
//         user_id: userId,
//         username: name
//       });

//       setCurrentUser({ id: userId, name: name });
//       localStorage.setItem('student_user_id', userId);
//       localStorage.setItem('student_username', name);

//       // Heartbeat every 15s
//       heartbeatInterval.current = setInterval(() => {
//         axios.post(`${API_URL}/session/heartbeat`, { user_id: userId, username: name })
//           .catch(err => console.error('heartbeat error', err));
//       }, 15000);

//       loadContacts();
//       checkUnreadMessages(userId);

//       // Poll contacts every 5 seconds
//       contactsInterval.current = setInterval(() => {
//         loadContacts();
//         checkUnreadMessages(userId);
//       }, 5000);

//       showToast(`Welcome back, ${name}! 🎉`, 'success');
//     } catch (error) {
//       console.error('Failed to initialize user:', error);
//       showToast('Failed to connect. Please try again.', 'error');
//       setShowLoginModal(true);
//     }

//     // Cleanup on unmount
//     return () => {
//       clearInterval(heartbeatInterval.current);
//       clearInterval(contactsInterval.current);
//       clearInterval(pollMessagesInterval.current);
//     };
//   };

//   // Check username availability with debounce
//   const checkUsernameAvailability = async (name) => {
//     if (!name.trim()) {
//       setUsernameError('');
//       setUsernameValid(false);
//       return;
//     }

//     if (name.trim().length < 2) {
//       setUsernameError('Name must be at least 2 characters long');
//       setUsernameValid(false);
//       return;
//     }

//     setIsCheckingUsername(true);
//     try {
//       const response = await axios.post(`${API_URL}/check-username`, {
//         username: name.trim()
//       });

//       if (response.data.available) {
//         setUsernameError('');
//         setUsernameValid(true);
//       } else {
//         setUsernameError(response.data.message);
//         setUsernameValid(false);
//       }
//     } catch (error) {
//       console.error('Username check failed:', error);
//       setUsernameError('Failed to check username availability');
//       setUsernameValid(false);
//     } finally {
//       setIsCheckingUsername(false);
//     }
//   };

//   // Debounce username check
//   const handleUsernameChange = (e) => {
//     const value = e.target.value;
//     setUsername(value);
//     setUsernameValid(false);

//     // Clear previous timeout
//     if (usernameCheckTimeout.current) {
//       clearTimeout(usernameCheckTimeout.current);
//     }

//     // Set new timeout
//     usernameCheckTimeout.current = setTimeout(() => {
//       checkUsernameAvailability(value);
//     }, 500);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
    
//     if (!username.trim()) {
//       showToast('Please enter your name', 'error');
//       return;
//     }

//     if (username.trim().length < 2) {
//       showToast('Name must be at least 2 characters long', 'error');
//       return;
//     }

//     if (!usernameValid) {
//       showToast('Please choose a valid username', 'error');
//       return;
//     }

//     const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
//     try {
//       await initializeUser(userId, username.trim());
//       setShowLoginModal(false);
//       setUsername('');
//       showToast(`Welcome, ${username.trim()}! 🎉 You're now online!`, 'success');
//     } catch (error) {
//       showToast('Failed to create account. Please try again.', 'error');
//     }
//   };

//   // Poll messages when in peer mode
//   useEffect(() => {
//     if (activeMode === 'peer' && selectedPeer && currentUser) {
//       loadPeerMessages(selectedPeer.id);
//       clearInterval(pollMessagesInterval.current);
//       pollMessagesInterval.current = setInterval(() => {
//         loadPeerMessages(selectedPeer.id);
//       }, 2500);
//     } else {
//       clearInterval(pollMessagesInterval.current);
//     }
//   }, [activeMode, selectedPeer, currentUser]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const loadContacts = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/peer/contacts`);
//       setContacts(res.data.contacts);
//     } catch (err) {
//       console.error('Failed to load contacts', err);
//     }
//   };

//   const checkUnreadMessages = async (userId) => {
//     try {
//       const res = await axios.get(`${API_URL}/peer/unread/${userId}`);
//       setUnreadCount(res.data.total_unread || 0);
//       setUnreadMessages(res.data.unread_from || {});
//     } catch (err) {
//       console.error('Failed to check unread', err);
//     }
//   };

//   const loadPeerMessages = async (peerId) => {
//     if (!currentUser) return;
//     try {
//       const res = await axios.get(`${API_URL}/peer/messages/${currentUser.id}/${peerId}`);
//       const formatted = res.data.messages.map(m => ({
//         id: m.id,
//         text: m.message,
//         sender: m.sender_id === currentUser.id ? 'user' : 'peer',
//         username: m.sender_name,
//         timestamp: m.timestamp
//       }));
//       setMessages(formatted);
//       checkUnreadMessages(currentUser.id);
//     } catch (err) {
//       console.error('Failed to load peer messages', err);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     if (activeMode === 'ai' && messages.length === 0) {
//       setMessages([{
//         id: 1,
//         text: "👋 Hi! I'm your AI learning assistant powered by Gemini. Ask me anything!",
//         sender: 'ai',
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   }, [activeMode]);

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim()) return;
//     const text = inputMessage.trim();
//     setInputMessage('');
//     setIsLoading(true);

//     if (activeMode === 'ai') {
//       try {
//         const resp = await axios.post('http://localhost:8000/api/chat/ai', { message: text, mode: 'ai' });
//         const aiMsg = {
//           id: Date.now() + 1,
//           text: resp.data.response || "AI did not reply.",
//           sender: 'ai',
//           timestamp: resp.data.timestamp || new Date().toISOString()
//         };
//         setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user', timestamp: new Date().toISOString() }, aiMsg]);
//       } catch (err) {
//         console.error(err);
//         setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user', timestamp: new Date().toISOString() }]);
//         showToast('This Page(AI Assistant) is Being Fixed by the Technical Team', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       if (!selectedPeer) {
//         showToast('Select a peer first', 'error');
//         setIsLoading(false);
//         return;
//       }
//       try {
//         await axios.post(`${API_URL}/peer/send`, {
//           sender_id: currentUser.id,
//           sender_name: currentUser.name,
//           receiver_id: selectedPeer.id,
//           message: text
//         });
//         await loadPeerMessages(selectedPeer.id);
//         showToast('Message sent! ✓', 'success');
//       } catch (err) {
//         console.error('send failed', err);
//         showToast('Failed to send message', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleSelectPeer = (peer) => {
//     setSelectedPeer(peer);
//     setShowContacts(false);
//     loadPeerMessages(peer.id);
//   };

//   const handleModeChange = (mode) => {
//     setActiveMode(mode);
//     setMessages([]);
//     if (mode === 'peer') {
//       setShowContacts(true);
//     } else {
//       setShowContacts(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const showToast = (message, type) => {
//     setToast({ message, type });
//   };

//   const closeToast = () => setToast(null);

//   const statusDot = (status) => (
//     <span className={`status-dot ${status === 'online' ? 'online' : 'offline'}`} />
//   );

//   return (
//     <div className="student-chat-container">
//       {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={3000} />}
      
//       {/* Beautiful Login Modal */}
//       {showLoginModal && (
//         <div className="login-modal-overlay">
//           <div className="login-modal">
//             <div className="login-modal-header">
//               <div className="login-icon">
//                 <UserPlus className="w-8 h-8 text-purple-600" />
//               </div>
//               <h2 className="login-title">Welcome to Student Chat! 👋</h2>
//               <p className="login-subtitle">Enter your name to start chatting with classmates</p>
//             </div>

//             <form onSubmit={handleLogin} className="login-form">
//               <div className="form-group">
//                 <label htmlFor="username" className="form-label">
//                   Your Name
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     id="username"
//                     type="text"
//                     value={username}
//                     onChange={handleUsernameChange}
//                     placeholder="e.g., James Ouma"
//                     className={`form-input ${usernameError ? 'input-error' : usernameValid ? 'input-success' : ''}`}
//                     autoFocus
//                   />
//                   {isCheckingUsername && (
//                     <div className="input-icon">
//                       <div className="spinner"></div>
//                     </div>
//                   )}
//                   {!isCheckingUsername && usernameValid && (
//                     <div className="input-icon">
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                     </div>
//                   )}
//                   {!isCheckingUsername && usernameError && (
//                     <div className="input-icon">
//                       <AlertCircle className="w-5 h-5 text-red-500" />
//                     </div>
//                   )}
//                 </div>
                
//                 {usernameError && (
//                   <p className="error-message">
//                     <AlertCircle className="w-4 h-4" />
//                     {usernameError}
//                   </p>
//                 )}
                
//                 {usernameValid && !usernameError && (
//                   <p className="success-message">
//                     <CheckCircle className="w-4 h-4" />
//                     Great! This name is available
//                   </p>
//                 )}

//                 <p className="form-hint">
//                   💡 Tip: If someone has your first name, add your last name to make it unique
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 className="login-button"
//                 disabled={!usernameValid || isCheckingUsername}
//               >
//                 {isCheckingUsername ? 'Checking...' : 'Join Chat'}
//               </button>
//             </form>

//             <div className="login-footer">
//               <p className="footer-text">By joining, you agree to be respectful and kind to others</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Chat Interface */}
//       {currentUser && (
//         <>
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 flex items-center">
//                 <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
//                 Student Q&A Center
//               </h2>
//               <div className="flex items-center space-x-4">
//                 {unreadCount > 0 && (
//                   <div className="relative">
//                     <Bell className="w-5 h-5 text-purple-600" />
//                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                       {unreadCount}
//                     </span>
//                   </div>
//                 )}
//                 <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
//                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                   {currentUser.name}
//                 </span>
//               </div>
//             </div>

//             <div className="chat-window">
//               <div className="chat-header">
//                 <div className="flex items-center space-x-4">
//                   <button onClick={() => handleModeChange('ai')} className={`mode-btn ${activeMode === 'ai' ? 'active' : ''}`}>
//                     <Bot className="w-4 h-4 mr-2" /> AI Assistant
//                   </button>
//                   <button onClick={() => handleModeChange('peer')} className={`mode-btn ${activeMode === 'peer' ? 'active' : ''}`}>
//                     <Users className="w-4 h-4 mr-2" /> Peer Chat
//                     {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
//                   </button>
//                 </div>
//                 {activeMode === 'peer' && (
//                   <button onClick={() => setShowContacts(!showContacts)} className="text-white text-sm hover:underline">
//                     {selectedPeer ? `Chatting with ${selectedPeer.name}` : 'Select a peer'}
//                   </button>
//                 )}
//               </div>

//               {showContacts && activeMode === 'peer' && (
//                 <div className="contacts-sidebar">
//                   <h3 className="text-lg font-bold mb-4">Available Students</h3>
//                   <div className="space-y-2">
//                     {contacts.filter(c => c.id !== currentUser.id).map(contact => (
//                       <button key={contact.id} onClick={() => handleSelectPeer(contact)} className={`contact-item ${selectedPeer?.id === contact.id ? 'active' : ''}`}>
//                         <span className="text-2xl mr-3">{contact.avatar}</span>
//                         <div className="flex-1 text-left">
//                           <p className="font-semibold">{contact.name}</p>
//                           <p className={`text-xs ${contact.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
//                             {statusDot(contact.status)} {contact.status}
//                           </p>
//                         </div>
//                         {unreadMessages[contact.id] && (
//                           <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
//                             {unreadMessages[contact.id].count}
//                           </span>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="messages-container">
//                 {messages.map((message) => (
//                   <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
//                     <div className="message-avatar">
//                       {message.sender === 'user' ? (
//                         <div className="avatar user-avatar">You</div>
//                       ) : message.sender === 'ai' ? (
//                         <Bot className="w-5 h-5 text-purple-600" />
//                       ) : (
//                         <User className="w-5 h-5 text-blue-600" />
//                       )}
//                     </div>
//                     <div className="message-content">
//                       {message.username && message.sender === 'peer' && <p className="message-username">{message.username}</p>}
//                       <div className="message-bubble">
//                         <p className="message-text">{message.text}</p>
//                       </div>
//                       <p className="message-time">
//                         {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 {isLoading && (
//                   <div className="message bot-message">
//                     <div className="message-avatar">
//                       <Bot className="w-5 h-5 text-purple-600" />
//                     </div>
//                     <div className="message-content">
//                       <div className="typing-indicator">
//                         <span></span><span></span><span></span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               <div className="chat-input-container">
//                 {activeMode === 'peer' && !selectedPeer ? (
//                   <div className="text-center text-gray-500 py-4">Please select a peer from the list to start chatting</div>
//                 ) : (
//                   <>
//                     <div className="chat-input-wrapper">
//                       <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
//                         onKeyPress={handleKeyPress}
//                         placeholder={activeMode === 'ai' ? "Ask me anything..." : `Message ${selectedPeer?.name}...`}
//                         className="chat-input" rows="1" />
//                       <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className="send-btn">
//                         <Send className="w-5 h-5" />
//                       </button>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StudentChat;
