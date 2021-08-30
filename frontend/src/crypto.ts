import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

import type { SubjectRole } from './bindings';
import { getStore } from './store';

type Key = {
  name: string;
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
};

export const cryptoKeysFrom = async ({ publicKey, privateKey }: Key): Promise<CryptoKeyPair> => {
  const importedPublic = await window.crypto.subtle.importKey(
    'jwk',
    publicKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
  const importedPrivate = await window.crypto.subtle.importKey(
    'jwk',
    privateKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );
  return {
    publicKey: importedPublic,
    privateKey: importedPrivate,
  };
};

export const getKey = async (uuid: string, storeKey: SubjectRole): Promise<Key | undefined> => {
  const store = getStore(storeKey);
  const current = await store.get(uuid);
  if (!current) {
    return undefined;
  }
  return {
    name: current.name,
    publicKey: JSON.parse(current.publicKey),
    privateKey: JSON.parse(current.privateKey),
  };
};

export const generateKey = async (uuid: string, storeKey: SubjectRole): Promise<Key> => {
  const store = getStore(storeKey);
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );

  const name = uniqueNamesGenerator({
    dictionaries: [animals, adjectives, colors],
    length: 3,
    separator: '-',
  });

  const privateKey = await window.crypto.subtle.exportKey('jwk', key.privateKey!);
  const publicKey = await window.crypto.subtle.exportKey('jwk', key.publicKey!);

  await store.set(uuid, {
    name,
    publicKey: JSON.stringify(publicKey),
    privateKey: JSON.stringify(privateKey),
  });

  return { name, publicKey, privateKey };
};

export const importPublicKey = async (key: JsonWebKey): Promise<CryptoKey> => {
  return window.crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
};

export const deriveKey = async (publicKey: CryptoKey, privateKey: CryptoKey): Promise<CryptoKey> => {
  return window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey!,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};
