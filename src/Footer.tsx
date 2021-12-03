import { ExternalLinkIcon } from '@heroicons/react/solid';
import React from 'react';

const Footer: React.FC = () => (
  <footer className="absolute bottom-0 w-full bg-gray-200 flex justify-between py-2 px-4 text-gray-700 text-sm">
    <div>
      Powered by{' '}
      <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
        Cloudflare Pages
      </a>{' '}
      &amp;{' '}
      <a
        href="https://workers.cloudflare.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-400"
      >
        Cloudflare Workers
      </a>
    </div>
    <div className="whitespace-nowrap inline">
      <a
        href="https://github.com/kobim/safebox"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-400"
      >
        Source code <ExternalLinkIcon className="w-4 h-4 inline" />
      </a>
    </div>
  </footer>
);

export default Footer;
