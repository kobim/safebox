export const onRequestGet: PagesFunction<
  {
    MESSAGES: KVNamespace;
    SYNCS: DurableObjectNamespace;
  },
  'uuid'
> = async ({ request, env: { MESSAGES, SYNCS }, params }) => {
  const { uuid } = params as { uuid: string };
  if (MESSAGES.get(uuid) === null) {
    return new Response('Not found.', { status: 404 });
  }

  const syncId = SYNCS.idFromName(uuid);
  const sync = await SYNCS.get(syncId);

  return await sync.fetch(request);
};
