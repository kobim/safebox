// src/sync.ts
var Sync = class {
  constructor(state) {
    this.state = state;
    this.sessions = [];
  }
  async fetch(request) {
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
  async handleSession(ws) {
    const session = {
      ws,
      ended: false,
    };
    ws.accept();
    this.sessions.push(session);
    const closeOrErrorHandler = () => {
      session.ended = true;
      this.sessions = this.sessions.filter((sess) => sess !== session);
    };
    ws.addEventListener('close', closeOrErrorHandler);
    ws.addEventListener('error', closeOrErrorHandler);
  }
  async updateExchange(exchangeJson) {
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
};
export { Sync };
//# sourceMappingURL=sync.mjs.map
