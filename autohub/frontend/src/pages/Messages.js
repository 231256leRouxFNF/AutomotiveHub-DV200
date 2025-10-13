import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom'; // Import useLocation
import './PageLayout.css';

const Messages = () => {
  const [threads, setThreads] = useState([]);
  const location = useLocation(); // Get current location object
  const [newRecipient, setNewRecipient] = useState('');
  const [newMessage, setNewMessage] = useState('');
  // State to manage active conversation or new message form
  const [activeConversation, setActiveConversation] = useState(null); 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipientIdFromUrl = params.get('recipientId');
    if (recipientIdFromUrl) {
      // In a real app, you'd fetch recipient username/details by ID
      // For now, we'll just set the ID as the recipient
      setNewRecipient(recipientIdFromUrl);
      setActiveConversation('new'); // Indicate starting a new message
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/messages');
        if (!cancelled) setThreads(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setThreads([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [location]); // Re-run effect if URL changes

  const handleSendMessage = () => {
    console.log(`Sending message to ${newRecipient}: ${newMessage}`);
    // Implement actual send message logic here
    setNewMessage('');
    setNewRecipient('');
    setActiveConversation(null); // Go back to thread list
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Messages</h1>
        <section className="section">
          <h2 className="section-title">Conversations</h2>
          <div className="section-content grid">
            {activeConversation === 'new' ? (
              <div className="new-message-form">
                <h3>New Message</h3>
                <input
                  type="text"
                  placeholder="Recipient User ID" // In a real app, this would be a user search/selector
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="form-input mb-2"
                />
                <textarea
                  placeholder="Your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-textarea mb-2"
                  rows="5"
                ></textarea>
                <button onClick={handleSendMessage} className="btn primary-btn">Send Message</button>
                <button onClick={() => setActiveConversation(null)} className="btn secondary-btn mt-2">Cancel</button>
              </div>
            ) : (
              <>
                <button onClick={() => setActiveConversation('new')} className="btn primary-btn mb-4">Start New Message</button>
                {threads.map(t => (
                  <div className="card" key={t.id}>
                    <strong>{t.title}</strong>
                    <div className="muted">{t.unread > 0 ? `${t.unread} new` : 'Up to date'}</div>
                    <button className="btn-primary mt-8">Open</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
