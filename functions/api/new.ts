import { findAvailableKey } from '../utils';

export const onRequestPost: PagesFunction<{ MESSAGES: KVNamespace }> = async ({
  env: { MESSAGES },
}) => {
  console.log('asdfa', MESSAGES);
  const key = await findAvailableKey(MESSAGES);
  if (!key) {
    return new Response('No available key', { status: 500 });
  }
  return new Response(key, { status: 201 });
};
