import { useState, useEffect, useRef } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: '👋 Hi! I’m your mental health assistant. How can I support you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: data.reply || '...' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '⚠️ Error contacting chatbot.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        from: 'bot',
        text: '👋 Hi! I’m your mental health assistant. How can I support you today?',
      },
    ]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[80vh] w-[75%] mx-auto mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">
          🧠 Mental Health Chatbot
        </h2>
        <button
          onClick={clearChat}
          className="text-sm text-indigo-500 border border-indigo-300 rounded px-3 py-1 hover:bg-indigo-50 transition"
        >
          Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scroll-smooth">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[75%] whitespace-pre-wrap ${
              msg.from === 'user'
                ? 'bg-indigo-100 self-end ml-auto text-right'
                : 'bg-gray-100 self-start text-left'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400 italic self-start">
            Bot is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
