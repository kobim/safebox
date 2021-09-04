import React, { SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import type { Exchange, SubjectRole } from './bindings';
import { getExchange, saveExchange } from './api';
import { cryptoKeysFrom, getKey, importPublicKey, deriveKey } from './crypto';
import { b64decode } from './utils';

import { LiveUpdatesContext } from './LiveUpdates';
import ShareExchange from './ShareExchange';
import AcceptExchange from './AcceptExchange';
import DisplayExchange from './DisplayExchange';

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
  }, [exchange]);

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

  return <DisplayExchange exchange={exchange} text={text} setText={setText} submit={submit} role={role} />;
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
  const { enabled: updatesEnabled } = useContext(LiveUpdatesContext);

  const updatesUrl = useMemo<string | null>(() => {
    if (!updatesEnabled) {
      return null;
    }
    const protocol = window.location.protocol.replace('http', 'ws');
    return `${protocol}//${window.location.host}/api/m/${uuid}/ws`;
  }, [uuid, updatesEnabled]);

  useWebSocket(updatesUrl, {
    onMessage: ({ data }) => setExchange(JSON.parse(data)),
  });

  useEffect(() => {
    if (uuid) {
      getExchange(uuid).then(({ data }) => setExchange(data));
    }
  }, [uuid]);

  return (
    <div className="bg-white sm:mx-auto sm:shadow-md p-4 sm:max-w-2xl w-full h-full">
      <Window uuid={uuid} exchange={exchange} setExchange={setExchange} />
    </div>
  );
};

export default Communication;
