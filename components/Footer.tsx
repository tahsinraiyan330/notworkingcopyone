
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 px-4 bg-brand-light">
      <p className="text-sm text-gray-600">
        Developed by <a href="https://github.com/tahsinrayyan" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-green hover:underline">Tahsin Raiyan</a>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        © {new Date().getFullYear()} অপরূপা. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;