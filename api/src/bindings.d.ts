export {};

declare global {
  const MESSAGES: KVNamespace;
}

export type FixedRequest = {
  params: { uuid: string };

  json(): Promise<unknown>;
  headers: Headers;
};

export type Subject = {
  key: JsonWebKey;
  name: string;
};

export type SavedExchange = {
  first: Subject;
  second?: Subject;

  encMessage?: string;
  iv?: string;
};

export type Exchange = {
  uuid: string;
} & SavedExchange;
