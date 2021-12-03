import { decodeSecondAuth } from '../../utils';

export const onRequestGet: PagesFunction<{ MESSAGES: KVNamespace }, 'uuid'> =
  async ({ env: { MESSAGES }, params: { uuid } }) => {
    // TODO: auth based get
    const value = await MESSAGES.get<SavedExchange>(uuid as string, {
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
  };

export const onrequestPatch: PagesFunction<
  {
    MESSAGES: KVNamespace;
    SYNCS: DurableObjectNamespace;
  },
  'uuid'
> = async ({ request, env: { MESSAGES, SYNCS }, params }) => {
  const { uuid } = params as { uuid: string };
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
};
