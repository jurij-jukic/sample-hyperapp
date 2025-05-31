// Main App component for Skeleton App
import { useEffect, useState } from 'react';
import './App.css';
import { useSkeletonStore } from './store/skeleton';

function App() {
  // Store state and actions
  const {
    nodeId,
    isConnected,
    counter,
    messages,
    isLoading,
    error,
    initialize,
    fetchStatus,
    incrementCounter,
    sendMessage,
    clearError,
  } = useSkeletonStore();

  // Local state for P2P form
  const [targetNode, setTargetNode] = useState('');
  const [messageText, setMessageText] = useState('');

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-refresh status every 30 seconds if connected
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isConnected, fetchStatus]);

  // Handle form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNode || !messageText) return;
    
    await sendMessage(targetNode, messageText);
    
    // Clear form on success
    if (!error) {
      setMessageText('');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">🦴 Skeleton App</h1>
        <div className="node-info">
          {isConnected ? (
            <>
              Connected as <span className="node-id">{nodeId}</span>
            </>
          ) : (
            <span className="not-connected">Not connected to Hyperware</span>
          )}
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="error error-message">
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main content */}
      {isConnected && (
        <>
          {/* Counter Section */}
          <section className="section">
            <h2 className="section-title">Counter Demo</h2>
            <p>This demonstrates basic state management and HTTP endpoints.</p>
            
            <div className="counter-section">
              <div className="counter-display">{counter}</div>
              <div className="button-group">
                <button 
                  onClick={() => incrementCounter(1)} 
                  disabled={isLoading}
                >
                  +1
                </button>
                <button 
                  onClick={() => incrementCounter(5)} 
                  disabled={isLoading}
                >
                  +5
                </button>
                <button 
                  onClick={() => incrementCounter(10)} 
                  disabled={isLoading}
                >
                  +10
                </button>
              </div>
            </div>
          </section>

          {/* Messages Section */}
          <section className="section">
            <h2 className="section-title">Messages</h2>
            <p>Messages received by this node:</p>
            
            <div className="messages-list">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className="message-item">
                    {msg}
                  </div>
                ))
              ) : (
                <div className="no-messages">No messages yet</div>
              )}
            </div>
            
            <button onClick={fetchStatus} disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : 'Refresh'}
            </button>
          </section>

          {/* P2P Communication Section */}
          <section className="section">
            <h2 className="section-title">P2P Communication</h2>
            <p>Send a message to another node running this app:</p>
            
            <form className="p2p-form" onSubmit={handleSendMessage}>
              <div className="form-group">
                <label htmlFor="target-node">Target Node (e.g., "bob.os")</label>
                <input
                  id="target-node"
                  type="text"
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  placeholder="Enter target node address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message"
                  rows={3}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading || !targetNode || !messageText}
              >
                {isLoading ? <span className="spinner" /> : 'Send Message'}
              </button>
            </form>
          </section>

          {/* Instructions */}
          <section className="section">
            <h2 className="section-title">How to Use This Skeleton</h2>
            <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              <p>This skeleton app demonstrates:</p>
              <ul>
                <li>Basic state management with a counter</li>
                <li>HTTP communication between frontend and backend</li>
                <li>P2P messaging between nodes</li>
                <li>Error handling and loading states</li>
              </ul>
              
              <p>To customize this app:</p>
              <ol>
                <li>Modify <code>AppState</code> in <code>lib.rs</code></li>
                <li>Add new HTTP endpoints with <code>#[http]</code></li>
                <li>Add remote endpoints with <code>#[remote]</code></li>
                <li>Update the UI components and API calls</li>
                <li>Build with <code>kit b --hyperapp</code></li>
              </ol>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;