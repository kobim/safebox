import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

import { decodeSecondAuth } from './utils';
export { Sync } from './sync';

const router = Router();

const MAX_RETRIES = 5;

const findAvailableKey = async (
  MESSAGES: KVNamespace,
): Promise<string | null> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const key = uuidv4();
    const existing = await MESSAGES.get(key);
    if (!existing) {
      return key;
    }
  }

  return null;
};

router.post('/api/new', async (_, { MESSAGES }: Env) => {
  const key = await findAvailableKey(MESSAGES);
  if (!key) {
    return new Response('No available key', { status: 500 });
  }
  return new Response(key, { status: 201 });
});

router.put('/api/m/:uuid/init', async (request: Request, { MESSAGES }: Env) => {
  const first = (await request.json()) as Subject;
  if (first.key === null || first.name === null) {
    return new Response('Invalid first', { status: 422 });
  }

  const { uuid } = request.params as { uuid: string };

  const existing = await MESSAGES.get(uuid);
  if (existing) {
    return new Response('Already initialized', { status: 400 });
  }

  const value = JSON.stringify({ first });
  await MESSAGES.put(uuid, value);
  return new Response(value);
});

router.get('/api/m/:uuid', async (request: Request, { MESSAGES }: Env) => {
  // TODO: auth based get
  const { uuid } = request.params as { uuid: string };
  const value = await MESSAGES.get<SavedExchange>(uuid, {
    type: 'json',
  });
  if (!value) {
    return new Response('Not found.', { status: 404 });
  }

  return new Response(
    JSON.stringify({
      ...value,
      uuid,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
});

router.patch(
  '/api/m/:uuid',
  async (request: Request, { MESSAGES, SYNCS }: Env) => {
    const { uuid } = request.params;
    const current = await MESSAGES.get<Exchange>(uuid, { type: 'json' });
    if (!current) {
      return new Response('Not found.', { status: 404 });
    }

    const value = (await request.json()) as Exchange;

    const secondName = decodeSecondAuth(request);

    const newValue: SavedExchange = {
      first: current.first,
      second: current.second,
      iv: current.iv,

      encMessage: value.encMessage || undefined,
    };

    if (current.second && current.second.name !== secondName) {
      return new Response("Error - can't reclaim", { status: 400 });
    }
    if (!current.second && value.second) {
      newValue['second'] = value.second;
      newValue['iv'] = value.iv;
    }

    await MESSAGES.put(uuid, JSON.stringify(newValue));

    const syncId = SYNCS.idFromName(uuid);
    const sync = await SYNCS.get(syncId);

    const valueWithUuid = JSON.stringify({
      ...newValue,
      uuid,
    });

    await sync.fetch(
      new Request(request, {
        body: valueWithUuid,
      }),
    );

    return new Response(valueWithUuid, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
);

router.get(
  '/api/m/:uuid/ws',
  async (request: Request, { MESSAGES, SYNCS }: Env) => {
    const { uuid } = request.params;
    if (MESSAGES.get(uuid) === null) {
      return new Response('Not found.', { status: 404 });
    }

    const syncId = SYNCS.idFromName(uuid);
    const sync = await SYNCS.get(syncId);

    return await sync.fetch(request);
  },
);

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
  fetch: async (request: Request, env: Env): Promise<Response> =>
    router.handle(request, env),
};
