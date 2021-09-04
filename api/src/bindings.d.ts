export {};

declare global {
  interface Env {
    MESSAGES: KVNamespace;
    SYNCS: DurableObjectNamespace;
  }

  interface WebSocket {
    accept(): void;
  }

  const WebSocketPair: {
    new (): {
      /** the `client` socket */
      0: WebSocket;
      /** the `server` socket */
      1: WebSocket;
    };
  };

  interface ResponseInit {
    webSocket?: WebSocket;
  }

  interface Request {
    params: { uuid: string };

    json(): Promise<unknown>;
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
