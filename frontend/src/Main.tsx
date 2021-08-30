import React from 'react';
import { KeyIcon } from '@heroicons/react/solid';

import List from './List';

interface Params {
  newExchange(): Promise<void>;
  destroy(): Promise<void>;
}

const Main: React.FC<Params> = ({ newExchange, destroy }) => (
  <div className="relative py-3 sm:w-full sm:max-w-4xl sm:mx-auto bg-white shadow overflow-hidden sm:rounded-lg flex flex-col sm:flex-row">
    <div className="px-4 py-5 sm:px-6 w-60 flex flex-col justify-between h-96 text-center">
      <div className="">
        <button
          type="button"
          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={newExchange}
        >
          <KeyIcon className="w-4 h-4 mr-2" /> New exchange
        </button>
        <p className="mt-2 text-sm text-gray-500">Generates a new unique link to be shared</p>
      </div>
      <div className="">
        <button
          type="button"
          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={() => {
            if (window.confirm('Are you sure you want to erase everything?')) {
              return destroy();
            }
          }}
        >
          Delete Data
        </button>
        <p className="mt-2 text-sm text-gray-500">Erases everything on this browser.</p>
        <p className="mt-2 text-xs text-gray-500">
          <strong>Warning</strong>: This operation is irreversible.
        </p>
      </div>
    </div>
    <div className="sm:border-l border-gray-200 px-4 py-5 sm:px-6 sm:flex flex-grow">
      <div className="sm:w-1/2 mr-2">
        <List role="first" title="Exchanges created" />
      </div>
      <div className="sm:w-1/2 sm:mt-0 mt-4">
        <List role="second" title="Exchanges invited" />
      </div>
    </div>
  </div>
);

export default Main;
