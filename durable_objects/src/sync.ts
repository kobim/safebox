type Session = {
  ws: WebSocket;
  ended: boolean;
};

export class Sync implements DurableObject {
  state: DurableObjectState;

  sessions: Array<Session>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = [];
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/ws')) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('expected websocket', { status: 400 });
      }

      const { 0: client, 1: server } = new WebSocketPair();

      await this.handleSession(server);

      return new Response(null, { status: 101, webSocket: client });
    }

    const exchangeJson = await request.text();

    this.updateExchange(exchangeJson);

    return new Response(null, { status: 200 });
  }

  async handleSession(ws: WebSocket): Promise<void> {
    const session: Session = {
      ws,
      ended: false,
    };

    // @ts-ignore
    ws.accept();

    this.sessions.push(session);

    const closeOrErrorHandler = () => {
      session.ended = true;
      this.sessions = this.sessions.filter((sess) => sess !== session);
    };
    ws.addEventListener('close', closeOrErrorHandler);
    ws.addEventListener('error', closeOrErrorHandler);
  }

  async updateExchange(exchangeJson: string): Promise<void> {
    this.sessions = this.sessions.filter((session) => {
      try {
        session.ws.send(exchangeJson);
        return true;
      } catch (err) {
        session.ended = true;
        return false;
      }
    });
  }
}
