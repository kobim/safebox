import React, { SetStateAction, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Exchange, Subject } from './bindings';
import { acceptExchange } from './api';
import { generateKey } from './crypto';

interface Params {
  uuid: string;
  name: string;
  setExchange: React.Dispatch<SetStateAction<Exchange | null | undefined>>;
}

const AcceptExchange: React.FC<Params> = ({ uuid, name, setExchange }) => {
  const navigate = useNavigate();

  const accept = useCallback(async () => {
    const { publicKey: key, name } = await generateKey(uuid, 'second');

    const subject: Subject = {
      name,
      key,
    };

    const ivBytes = await window.crypto.getRandomValues(new Uint8Array(12));

    const { data } = await acceptExchange(uuid, subject, ivBytes);
    setExchange(data);
  }, [uuid, setExchange]);

  const decline = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <>
      <p className="text-center">
        Exchange with '<span className="font-medium">{name}</span>'?
      </p>
      <div className="flex mt-4 w-36 mx-auto">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3 sm:w-auto sm:text-sm"
          onClick={accept}
        >
          Yes
        </button>
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 ml-3 sm:w-auto sm:text-sm"
          onClick={decline}
        >
          No
        </button>
      </div>
    </>
  );
};

export default AcceptExchange;
