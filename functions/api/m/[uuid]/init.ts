export const onRequestPut: PagesFunction<{ MESSAGES: KVNamespace }, 'uuid'> =
  async ({ request, env: { MESSAGES }, params }) => {
    const { uuid } = params as { uuid: string };
    const first = (await request.json()) as Subject;
    if (first.key === null || first.name === null) {
      return new Response('Invalid first', { status: 422 });
    }

    const existing = await MESSAGES.get(uuid);
    if (existing) {
      return new Response('Already initialized', { status: 400 });
    }

    const value = JSON.stringify({ first });
    await MESSAGES.put(uuid, value);
    return new Response(value);
  };
