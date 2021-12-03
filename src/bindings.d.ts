export {};

declare global {
  export type Subject = {
    key: JsonWebKey;
    name: string;
  };

  export type SubjectRole = 'first' | 'second';

  export type SavedExchange = {
    first: Subject;
    second?: Subject;

    encMessage?: string;
    iv?: string;
  };

  export type Exchange = {
    uuid: string;
  } & SavedExchange;
}
