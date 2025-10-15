
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import { Message } from './types';

const CHAT_HISTORY_KEY = 'aoporupa-chat-history';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      // Don't save if it's just the initial empty array
      if (messages.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } else {
        // Clear storage if messages are cleared
        localStorage.removeItem(CHAT_HISTORY_KEY);
      }
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-brand-light font-sans text-brand-dark min-h-screen flex flex-col">
      <Header onNewChat={handleNewChat} />
      <main className="flex-grow flex flex-col items-center p-2 md:p-4">
        <div className="w-full max-w-4xl h-full bg-white rounded-xl shadow-2xl flex flex-col border border-green-200">
          <ChatInterface messages={messages} setMessages={setMessages} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
