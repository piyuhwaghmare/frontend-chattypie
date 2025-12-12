import './App.css'
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function App() {
   
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // 1. Load Chat History when page opens
  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://ai-chat-app-r7tg.onrender.com/api/history');
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Optimistic Update: Show user message immediately
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to Backend
      const res = await axios.post('https://ai-chat-app-r7tg.onrender.com/api/chat', { message: input });
      
      // Add AI Response
      const aiMessage = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Error: Could not reach server." }]);
    }
    setLoading(false);
  };

  return (
    <div className='app-container'>
      <header className='chat-header'>
        <h1>AI Chatbot</h1>
      </header>
      
      <div className='chat-window'>
       {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
        <div ref={bottomRef} />
      </div>

      <div className='input-area'>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default App
