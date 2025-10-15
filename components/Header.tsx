
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewChat }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-brand-green/20">
             <LogoIcon className="h-10 w-10 object-contain rounded-full text-brand-dark" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-green font-bengali">অপরূপা</h1>
            <p className="text-xs md:text-sm text-gray-500 -mt-1">AI Legal & Governance Agent</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-brand-dark bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          aria-label="Start new chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;