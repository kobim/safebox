export {};

declare global {
  interface Env {
    MESSAGES: KVNamespace;
    SYNCS: DurableObjectNamespace;
  }

  interface WebSocket {
    accept(): void;
  }

  interface ResponseInit {
    webSocket?: WebSocket;
  }

  interface Request {
    params: { uuid: string };
  }

  type Subject = {
    key: JsonWebKey;
    name: string;
  };

  type SavedExchange = {
    first: Subject;
    second?: Subject;

    encMessage?: string;
    iv?: string;
  };

  type Exchange = {
    uuid: string;
  } & SavedExchange;
}
