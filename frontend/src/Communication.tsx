import React, { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import type { Exchange, SubjectRole } from './bindings';
import { getExchange, saveExchange } from './api';
import { cryptoKeysFrom, getKey, importPublicKey, deriveKey } from './crypto';
import { b64decode } from './utils';

import ShareExchange from './ShareExchange';
import AcceptExchange from './AcceptExchange';

interface WindowParams {
  uuid: string;
  exchange: Exchange | null | undefined;
  setExchange: React.Dispatch<SetStateAction<Exchange | null | undefined>>;
}

const Window: React.FC<WindowParams> = ({ uuid, exchange, setExchange }) => {
  const [text, setText] = useState<string>('');
  const [role, setRole] = useState<SubjectRole | null | undefined>(undefined);

  const [iv, setIV] = useState<Uint8Array | null>(null);
  const [secondName, setSecondName] = useState<string>('');
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    const setupKey = async (exchange: Exchange) => {
      let newRole: typeof role = 'second';
      let privateKey: CryptoKey | undefined;
      let publicKey: CryptoKey | undefined;
      if (exchange.first) {
        const senderKey = await getKey(exchange.uuid, 'first');
        if (senderKey) {
          newRole = 'first';
          const keys = await cryptoKeysFrom(senderKey);
          privateKey = keys.privateKey;
          if (exchange.second?.key) {
            publicKey = await importPublicKey(exchange.second.key);
          }
        }
      }

      const secondKey = await getKey(exchange.uuid, 'second');
      if (newRole === 'second' && exchange.second && exchange.second.name !== secondKey?.name) {
        newRole = null;
      }
      if (secondKey) {
        if (newRole === 'second') {
          const keys = await cryptoKeysFrom(secondKey);
          privateKey = keys.privateKey;
          publicKey = await importPublicKey(exchange.first.key);
          setSecondName(secondKey.name);
        }
      }

      setRole(newRole);
      if (privateKey && publicKey && exchange.iv) {
        const derivedKey = await deriveKey(publicKey, privateKey);
        setDerivedKey(derivedKey);
        const iv = b64decode(exchange.iv);
        setIV(iv);
        if (exchange.encMessage) {
          const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            derivedKey,
            b64decode(exchange.encMessage)
          );
          setText(new TextDecoder().decode(decrypted));
        }
      }
    };
    if (exchange) {
      setupKey(exchange);
    }
  }, [role, exchange]);

  const submit = useCallback(async () => {
    if (!derivedKey || !iv) {
      return;
    }

    const encodedText = new TextEncoder().encode(text);
    let encryptedData = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, encodedText);
    if (text.length === 0) {
      encryptedData = '';
    }

    const { data } = await saveExchange(uuid, secondName, encryptedData);
    setExchange(data);
  }, [uuid, derivedKey, text, iv, secondName, setExchange]);

  const submitDisabled = useMemo<boolean>(
    () => text.length === 0 && exchange?.encMessage === undefined,
    [text, exchange]
  );

  if (exchange === undefined || !role) {
    return <div className="text-center">Loading exchange...</div>;
  }

  if (exchange === null) {
    return <div className="text-center">Invalid exchange id</div>;
  }

  if (role === null) {
    return <div className="text-center">Error: not authorized</div>;
  }

  if (role === 'second' && !exchange.second) {
    return <AcceptExchange uuid={uuid} name={exchange.first.name} setExchange={setExchange} />;
  }

  if (exchange.second === undefined) {
    return <ShareExchange name={exchange.first.name} />;
  }

  if (role === 'first') {
    return (
      <>
        <div className="flex flex-row">
          <div className="flex-1 pr-2 space-y-2 relative">
            <p>
              Data received from <span className="font-semibold">{exchange.second.name}</span>
            </p>
            <p>
              This exchange is named <span className="font-semibold">{exchange.first.name}</span>
            </p>
            <p className="text-sm">You can only read data.</p>
            <p className="text-sm absolute bottom-0">(refresh to check for updates)</p>
          </div>
          <div className="flex-1 flex flex-col">
            <textarea
              className="border border-gray-200 border-solid outline-none p-2 h-56 resize-none"
              readOnly={true}
              defaultValue={text}
            ></textarea>
          </div>
        </div>
        {text.length === 0 && <p className="text-sm text-right">No data yet</p>}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row">
        <div className="flex-1 pr-2 space-y-2 relative">
          <p>
            Exchanging with <span className="font-semibold">{exchange.first.name}</span>
          </p>
          <p>
            Your name is <span className="font-semibold">{exchange.second.name}</span>
          </p>
          <p className="text-sm absolute bottom-0 pr-2">
            You can write everything in the text box and it will be encrypted and sent once you click{' '}
            <span className="italic">Save</span>.
          </p>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <textarea
            onChange={e => setText(e.target.value)}
            value={text}
            className="border border-gray-200 border-solid focus:border-green-500 outline-none p-2 h-56 resize-none"
          ></textarea>
        </div>
      </div>
      <div className="text-right">
        <button
          type="submit"
          onClick={submit}
          disabled={submitDisabled}
          className="font-medium text-green-600 hover:text-green-500 disabled:text-gray-300"
        >
          Save
        </button>
      </div>
    </>
  );
};

interface Params {
  uuid: string;
}

const Communication: React.FC<RouteComponentProps<Params>> = ({
  match: {
    params: { uuid },
  },
}) => {
  const [exchange, setExchange] = useState<Exchange | null | undefined>(undefined);
  useEffect(() => {
    if (uuid) {
      getExchange(uuid).then(({ data }) => setExchange(data));
    }
  }, [uuid]);

  return (
    <div className="bg-white mx-auto sm:shadow-md p-4 sm:max-w-2xl w-full h-full">
      <Window uuid={uuid} exchange={exchange} setExchange={setExchange} />
    </div>
  );
};

export default Communication;
