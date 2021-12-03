const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api/m/**/ws', {
      target: 'ws://127.0.0.1:8788',
      ws: true,
    }),
  );
  app.use(
    createProxyMiddleware('/api', {
      target: 'http://127.0.0.1:8788',
    }),
  );
};
