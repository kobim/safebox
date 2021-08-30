import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/solid';

import Info from './Info';

const ReturnToMain: React.FC = () => (
  <div className="absolute top-2 left-2">
    <Link to="/">
      <HomeIcon className="w-6 h-6 text-green-600" />
    </Link>
  </div>
);

const Header: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <header className="relative">
      {pathname !== '/' && <ReturnToMain />}
      <Info />
    </header>
  );
};

export default Header;
