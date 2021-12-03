import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/solid';

import Info from './Info';
import { LiveUpdatesToggle } from './LiveUpdates';

const Header: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <header className="relative">
      {pathname !== '/' && (
        <div className="absolute top-2 left-2 flex flex-col">
          <Link to="/">
            <HomeIcon className="w-6 h-6 text-green-600" />
          </Link>
          <LiveUpdatesToggle />
        </div>
      )}
      <div className="absolute top-2 right-2">
        <Info />
      </div>
    </header>
  );
};

export default Header;
