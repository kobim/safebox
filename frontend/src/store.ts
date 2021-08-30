import { createStore, get, set, entries, clear } from 'idb-keyval';
import type { SubjectRole } from './bindings';

type SavedKey = {
  name: string;
  publicKey: string;
  privateKey: string;
};

type Key = IDBValidKey;

interface Store {
  get(key: Key): Promise<SavedKey | undefined>;
  set(key: Key, value: SavedKey): void;
  entries(): Promise<Array<[string, string]>>;
  delete(): Promise<void>;
}

const storeFor = (dbName: string): Store => {
  const idbStore = createStore(dbName, 'safebox');
  return {
    get: async (key: Key) => {
      return get<SavedKey>(key, idbStore);
    },
    set: (key: Key, value: SavedKey) => {
      set(key, value, idbStore);
    },
    entries: async () => {
      const items = await entries<Key, SavedKey>(idbStore);
      return items.map(([key, value]) => [key as string, value.name]);
    },
    delete: async () => {
      return clear(idbStore);
    },
  };
};

const firstStore = storeFor('first');
const secondStore = storeFor('second');

export const getStore = (role: SubjectRole): Store => {
  switch (role) {
    case 'first':
      return firstStore;
    case 'second':
      return secondStore;
  }
};

export const destroy = (): Promise<[void, void]> => {
  return Promise.all([firstStore.delete(), secondStore.delete()]);
};
