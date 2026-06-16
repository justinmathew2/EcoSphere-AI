import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Sparkles, User, Bot } from 'lucide-react';

interface ChatMessage {
  role: string;
  content: string;
}

interface CoachProps {
  profileData: any;
}

export const Coach: React.FC<CoachProps> = ({ profileData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am your EcoSphere AI Sustainability Coach. 🌱 I am here to help you understand your carbon footprint and suggest concrete, actionable ways to reduce emissions and save money.\n\nAsk me anything! For example:\n- *'How can I reduce my transportation emissions?'*\n- *'What is a good eco-friendly shopping checklist?'*\n- *'Suggest some simple, tasty plant-based meal swaps.'*"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_history: newMessages,
          profile: profileData
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI Coach");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: "❌ Sorry, I encountered an error. Please check if your backend is running and the Vertex AI credentials are valid."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSend(promptText);
  };

  // Convert markdown-like syntax to basic HTML for chat bubbles
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formatted = line;
      // Bold syntax **text** or *text*
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet point conversion
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} style={{ marginLeft: '16px', listStyleType: 'disc' }} />;
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ margin: '4px 0' }} />;
    });
  };

  return (
    <div className="glass-panel chat-container animate-slide-up" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--color-glass-gradient)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--border-radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf color="var(--color-primary)" size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Sustainability Coach</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> Online - Powered by Gemini
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role}`}
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
          >
            <div style={{ marginTop: '2px' }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} color="var(--color-primary)" />}
            </div>
            <div style={{ flex: 1 }}>
              {formatContent(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-typing-dots">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: '0 24px 12px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            "How can I save electricity?",
            "Give me a sustainable meal plan",
            "Suggest eco-friendly travel options",
            "Why is my Carbon Score low?"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: 'var(--border-radius-full)' }}
            >
              <Sparkles size={10} color="var(--color-warning)" /> {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="chat-input-wrapper">
        <input
          type="text"
          className="form-input"
          placeholder="Ask the Sustainability Coach a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{ padding: '12px' }}
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
};
