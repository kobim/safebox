import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

import type {
  Exchange,
  FixedRequest,
  SavedExchange,
  Subject,
} from './bindings';

const router = Router();

const MAX_RETRIES = 5;

const findAvailableKey = async (): Promise<string | null> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const key = uuidv4();
    const existing = await MESSAGES.get(key);
    if (!existing) {
      return key;
    }
  }

  return '';
};

router.post('/api/new', async () => {
  const key = await findAvailableKey();
  if (!key) {
    return new Response('No available key', { status: 500 });
  }
  return new Response(key, { status: 201 });
});

router.put('/api/m/:uuid/init', async (request: FixedRequest) => {
  const first = (await request.json()) as Subject;
  if (first.key === null || first.name === null) {
    return new Response('Invalid first', { status: 422 });
  }

  const { uuid } = request.params as { uuid: string };

  const existing = await MESSAGES.get<Exchange>(uuid);
  if (existing) {
    return new Response('Already initialized', { status: 400 });
  }

  const value = JSON.stringify({ first });
  await MESSAGES.put(uuid, value);
  return new Response(value);
});

router.get('/api/m/:uuid', async (request) => {
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

const b64decode = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const decodeSecondAuth = ({ headers }: { headers: Headers }): string | null => {
  const value = headers.get('authorization');
  if (!value) {
    return null;
  }

  const [user, pass] = new TextDecoder()
    .decode(b64decode(value.split(' ')[1]))
    .split(':');
  if (user !== 'second') {
    return null;
  }
  return pass;
};

router.patch('/api/m/:uuid', async (request: FixedRequest) => {
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
  return new Response(
    JSON.stringify({
      ...newValue,
      uuid,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request)),
);
