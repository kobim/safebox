# Safebox

A safe way to receive sensitive information from anyone on the web

[![safebox.dev](https://img.shields.io/badge/Pages-safebox.dev-green?logo=cloudflare&color=13a821)](https://safebox.dev) &nbsp;
[![API Deploy](https://github.com/kobim/safebox/actions/workflows/api-publish.yml/badge.svg)](https://github.com/kobim/safebox/actions/workflows/api-publish.yml) &nbsp;

## Products Used

- [Cloudflare Pages](https://pages.cloudflare.com/) - hosting the React app
- [Cloudflare Workers](https://workers.cloudflare.com/) - API
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv) - storing the encrypted data
- [Cloudflare Workers Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects) - syncing between connected clients
