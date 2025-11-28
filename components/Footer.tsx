import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900/50 border-t border-zinc-700 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-zinc-400">
        <p>&copy; {new Date().getFullYear()} testURdsa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;